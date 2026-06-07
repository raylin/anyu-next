import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import {
  authSummary,
  main,
  parseArgs,
  readCredentials,
  resolveAdminToken,
  writeCredentials,
} from "./auth.js";

function tempCredentialsPath() {
  const dir = mkdtempSync(path.join(tmpdir(), "anyu-ops-auth-"));
  return {
    dir,
    filePath: path.join(dir, "credentials.json"),
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

function context(input: { credentialsPath: string; stdin?: Readable; token?: string } = { credentialsPath: "" }) {
  let stdout = "";
  let stderr = "";

  return {
    ctx: {
      env: {
        ...(input.token ? { ADMIN_API_TOKEN: input.token } : {}),
        ANYU_OPS_CREDENTIALS_PATH: input.credentialsPath || path.join(tmpdir(), "anyu-missing-credentials.json"),
      },
      stdin: input.stdin,
      stdout: { write: vi.fn((chunk: string) => { stdout += chunk; return true; }) },
      stderr: { write: vi.fn((chunk: string) => { stderr += chunk; return true; }) },
    },
    get stdout() { return stdout; },
    get stderr() { return stderr; },
  };
}

describe("ANYU ops auth config", () => {
  it("resolves process env before credentials file", () => {
    const temp = tempCredentialsPath();
    try {
      writeCredentials(
        { version: 1, profiles: { production: { adminApiToken: "file-token" } } },
        { ANYU_OPS_CREDENTIALS_PATH: temp.filePath },
      );

      const result = resolveAdminToken("production", {
        ADMIN_API_TOKEN: "process-token",
        ANYU_OPS_CREDENTIALS_PATH: temp.filePath,
      });

      expect(result).toMatchObject({
        token: "process-token",
        sourceCategory: "process_env",
        tokenPresent: true,
      });
    } finally {
      temp.cleanup();
    }
  });

  it("uses credentials file when process env is missing", () => {
    const temp = tempCredentialsPath();
    try {
      writeCredentials(
        { version: 1, profiles: { production: { adminApiToken: "file-token" } } },
        { ANYU_OPS_CREDENTIALS_PATH: temp.filePath },
      );

      expect(resolveAdminToken("production", { ANYU_OPS_CREDENTIALS_PATH: temp.filePath })).toMatchObject({
        token: "file-token",
        sourceCategory: "credentials_file",
        tokenPresent: true,
      });
      expect(resolveAdminToken("staging", { ANYU_OPS_CREDENTIALS_PATH: temp.filePath })).toMatchObject({
        token: "",
        sourceCategory: "missing",
        tokenPresent: false,
      });
    } finally {
      temp.cleanup();
    }
  });

  it("reports malformed credentials with a safe error", () => {
    const temp = tempCredentialsPath();
    try {
      writeCredentials({ version: 1, profiles: {} }, { ANYU_OPS_CREDENTIALS_PATH: temp.filePath });
      // Corrupt after creation to avoid printing any credential-shaped value.
      vi.spyOn(JSON, "parse").mockImplementationOnce(() => ({ version: 2, profiles: {} }));

      expect(() => readCredentials({ ANYU_OPS_CREDENTIALS_PATH: temp.filePath })).toThrow("credentials_file_invalid");
    } finally {
      vi.restoreAllMocks();
      temp.cleanup();
    }
  });

  it("auth status prints only source category and no token metadata", async () => {
    const temp = tempCredentialsPath();
    try {
      writeCredentials(
        { version: 1, profiles: { production: { adminApiToken: "file-token" } } },
        { ANYU_OPS_CREDENTIALS_PATH: temp.filePath },
      );
      const run = context({ credentialsPath: temp.filePath });

      const exitCode = await main(["auth", "status", "--env", "production", "--json"], run.ctx);

      expect(exitCode).toBe(0);
      expect(JSON.parse(run.stdout)).toMatchObject({
        ok: true,
        auth: {
          env: "production",
          tokenAvailable: true,
          tokenSourceCategory: "credentials_file",
          valuesPrinted: false,
          lengthsPrinted: false,
          prefixesPrinted: false,
          suffixesPrinted: false,
          hashesPrinted: false,
          checksumsPrinted: false,
        },
      });
      expect(run.stdout).not.toContain("file-token");
    } finally {
      temp.cleanup();
    }
  });

  it("auth set-token writes one profile and preserves the other", async () => {
    const temp = tempCredentialsPath();
    try {
      writeCredentials(
        { version: 1, profiles: { staging: { adminApiToken: "staging-token" } } },
        { ANYU_OPS_CREDENTIALS_PATH: temp.filePath },
      );
      const run = context({
        credentialsPath: temp.filePath,
        stdin: Readable.from(["production-token\n"]),
      });

      const exitCode = await main(["auth", "set-token", "--env", "production", "--json"], run.ctx);
      const credentials = JSON.parse(readFileSync(temp.filePath, "utf8"));

      expect(exitCode).toBe(0);
      expect(credentials.profiles.staging.adminApiToken).toBe("staging-token");
      expect(credentials.profiles.production.adminApiToken).toBe("production-token");
      expect(statSync(temp.filePath).mode & 0o777).toBe(0o600);
      expect(run.stdout).not.toContain("production-token");
    } finally {
      temp.cleanup();
    }
  });

  it("auth logout removes one profile token and preserves other profiles", async () => {
    const temp = tempCredentialsPath();
    try {
      writeCredentials(
        {
          version: 1,
          profiles: {
            staging: { adminApiToken: "staging-token" },
            production: { adminApiToken: "production-token" },
          },
        },
        { ANYU_OPS_CREDENTIALS_PATH: temp.filePath },
      );
      const run = context({ credentialsPath: temp.filePath });

      const exitCode = await main(["auth", "logout", "--env", "production", "--json"], run.ctx);
      const credentials = JSON.parse(readFileSync(temp.filePath, "utf8"));

      expect(exitCode).toBe(0);
      expect(credentials.profiles.staging.adminApiToken).toBe("staging-token");
      expect(credentials.profiles.production.adminApiToken).toBeUndefined();
      expect(run.stdout).not.toContain("production-token");
    } finally {
      temp.cleanup();
    }
  });

  it("rejects unsupported envs, positional tokens, and token flags", () => {
    expect(() => parseArgs(["auth", "status", "--env", "dev"])).toThrow("env_invalid");
    expect(() => parseArgs(["auth", "set-token", "--env", "production", "secret"])).toThrow("unexpected_argument");
    expect(() => parseArgs(["auth", "set-token", "--env", "production", "--token", "secret"])).toThrow(
      "unsupported_option",
    );
  });

  it("keeps status missing safe", () => {
    const summary = authSummary("production", {
      ANYU_OPS_CREDENTIALS_PATH: path.join(tmpdir(), "missing-anyu-ops-creds.json"),
    });

    expect(summary).toMatchObject({
      env: "production",
      tokenAvailable: false,
      tokenSourceCategory: "missing",
      valuesPrinted: false,
      lengthsPrinted: false,
      prefixesPrinted: false,
      suffixesPrinted: false,
      hashesPrinted: false,
      checksumsPrinted: false,
    });
  });
});
