import fs from "node:fs";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
// @ts-expect-error The one-time helper is intentionally a standalone .mjs script, not CLI TypeScript.
import { main, migrateAdminTokens, parseArgs, readAdminTokenFromMirror } from "../scripts/migrate-admin-token-from-env-mirrors.mjs";
import { authSummary } from "./auth.js";

function tempRepo() {
  const dir = mkdtempSync(path.join(tmpdir(), "anyu-ops-migration-"));
  const webDir = path.join(dir, "apps/web");
  fs.mkdirSync(webDir, { recursive: true });
  return {
    dir,
    webDir,
    credentialsPath: path.join(dir, "credentials.json"),
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

function writeMirror(filePath: string, entries: Record<string, string>) {
  const lines = Object.entries(entries).map(([key, value]) => `${key}="${value}"`);
  writeFileSync(filePath, `${lines.join("\n")}\n`);
}

function commandContext(credentialsPath: string) {
  let stdout = "";
  let stderr = "";
  return {
    ctx: {
      env: { ANYU_OPS_CREDENTIALS_PATH: credentialsPath },
      stdout: { write: vi.fn((chunk: string) => { stdout += chunk; return true; }) },
      stderr: { write: vi.fn((chunk: string) => { stderr += chunk; return true; }) },
    },
    get stdout() { return stdout; },
    get stderr() { return stderr; },
  };
}

describe("one-time Admin token env mirror migration helper", () => {
  it("requires explicit owner confirmation", async () => {
    const temp = tempRepo();
    try {
      const run = commandContext(temp.credentialsPath);

      const exitCode = await main(["--json", "--repo-root", temp.dir], run.ctx);

      expect(exitCode).toBe(1);
      expect(JSON.parse(run.stderr)).toEqual({ ok: false, error: "owner_confirmation_required" });
    } finally {
      temp.cleanup();
    }
  });

  it("copies only ADMIN_API_TOKEN values and preserves existing credentials fields", () => {
    const temp = tempRepo();
    try {
      writeMirror(path.join(temp.webDir, ".env.staging"), {
        ["ADMIN_API_TOKEN"]: "staging-fixture-value",
        DATABASE_URL: "must-not-copy",
        NEXT_PUBLIC_APP_URL: "must-not-copy-either",
      });
      writeMirror(path.join(temp.webDir, ".env.production"), {
        ["ADMIN_API_TOKEN"]: "production-fixture-value",
        FEATURE_FLAG: "must-not-copy",
      });
      writeFileSync(
        temp.credentialsPath,
        `${JSON.stringify({
          version: 1,
          profiles: {
            staging: { existingField: "preserved" },
            production: { existingField: "preserved-too" },
            other: { note: "preserved" },
          },
        }, null, 2)}\n`,
      );

      const result = migrateAdminTokens({
        repoRoot: temp.dir,
        env: { ANYU_OPS_CREDENTIALS_PATH: temp.credentialsPath },
      });
      const credentials = JSON.parse(readFileSync(temp.credentialsPath, "utf8"));

      expect(result).toMatchObject({
        ok: true,
        profiles: {
          staging: { tokenCopied: true, category: "token_copied" },
          production: { tokenCopied: true, category: "token_copied" },
        },
        valuesPrinted: false,
        lengthsPrinted: false,
        prefixesPrinted: false,
        suffixesPrinted: false,
        hashesPrinted: false,
        checksumsPrinted: false,
      });
      expect(credentials.profiles.staging.adminApiToken).toBe("staging-fixture-value");
      expect(credentials.profiles.production.adminApiToken).toBe("production-fixture-value");
      expect(credentials.profiles.staging.existingField).toBe("preserved");
      expect(credentials.profiles.production.existingField).toBe("preserved-too");
      expect(credentials.profiles.other.note).toBe("preserved");
      expect(JSON.stringify(credentials)).not.toContain("must-not-copy");
      expect(statSync(temp.credentialsPath).mode & 0o777).toBe(0o600);
    } finally {
      temp.cleanup();
    }
  });

  it("prints only categories and no token metadata", async () => {
    const temp = tempRepo();
    try {
      writeMirror(path.join(temp.webDir, ".env.staging"), {
        ["ADMIN_API_TOKEN"]: "staging-fixture-value",
      });
      writeMirror(path.join(temp.webDir, ".env.production"), {
        ["ADMIN_API_TOKEN"]: "production-fixture-value",
      });
      const run = commandContext(temp.credentialsPath);

      const exitCode = await main(
        ["--confirm-owner-approved", "--json", "--repo-root", temp.dir],
        run.ctx,
      );

      expect(exitCode).toBe(0);
      expect(run.stdout).toContain("\"tokenCopied\": true");
      expect(run.stdout).not.toContain("staging-fixture-value");
      expect(run.stdout).not.toContain("production-fixture-value");
      expect(JSON.parse(run.stdout)).toMatchObject({
        valuesPrinted: false,
        lengthsPrinted: false,
        prefixesPrinted: false,
        suffixesPrinted: false,
        hashesPrinted: false,
        checksumsPrinted: false,
      });
      expect(run.stderr).toBe("");
    } finally {
      temp.cleanup();
    }
  });

  it("reports a missing staging token without failing if production exists", () => {
    const temp = tempRepo();
    try {
      writeMirror(path.join(temp.webDir, ".env.staging"), {
        NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw",
      });
      writeMirror(path.join(temp.webDir, ".env.production"), {
        ["ADMIN_API_TOKEN"]: "production-fixture-value",
      });

      const result = migrateAdminTokens({
        repoRoot: temp.dir,
        env: { ANYU_OPS_CREDENTIALS_PATH: temp.credentialsPath },
      });

      expect(result.ok).toBe(true);
      expect(result.profiles.staging).toMatchObject({
        tokenCopied: false,
        category: "staging_token_missing",
      });
      expect(result.profiles.production).toMatchObject({
        tokenCopied: true,
        category: "token_copied",
      });
    } finally {
      temp.cleanup();
    }
  });

  it("reports a missing production token without failing if staging exists", () => {
    const temp = tempRepo();
    try {
      writeMirror(path.join(temp.webDir, ".env.staging"), {
        ["ADMIN_API_TOKEN"]: "staging-fixture-value",
      });
      writeMirror(path.join(temp.webDir, ".env.production"), {
        NEXT_PUBLIC_APP_URL: "https://anyu.tw",
      });

      const result = migrateAdminTokens({
        repoRoot: temp.dir,
        env: { ANYU_OPS_CREDENTIALS_PATH: temp.credentialsPath },
      });

      expect(result.ok).toBe(true);
      expect(result.profiles.staging).toMatchObject({
        tokenCopied: true,
        category: "token_copied",
      });
      expect(result.profiles.production).toMatchObject({
        tokenCopied: false,
        category: "production_token_missing",
      });
    } finally {
      temp.cleanup();
    }
  });

  it("fails safely when both tokens are missing", () => {
    const temp = tempRepo();
    try {
      writeMirror(path.join(temp.webDir, ".env.staging"), {
        NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw",
      });
      writeMirror(path.join(temp.webDir, ".env.production"), {
        NEXT_PUBLIC_APP_URL: "https://anyu.tw",
      });

      const result = migrateAdminTokens({
        repoRoot: temp.dir,
        env: { ANYU_OPS_CREDENTIALS_PATH: temp.credentialsPath },
      });

      expect(result).toMatchObject({
        ok: false,
        error: "admin_tokens_missing",
        permissionStatus: "not_written",
        profiles: {
          staging: { tokenCopied: false, category: "staging_token_missing" },
          production: { tokenCopied: false, category: "production_token_missing" },
        },
      });
      expect(fs.existsSync(temp.credentialsPath)).toBe(false);
    } finally {
      temp.cleanup();
    }
  });

  it("normal auth resolver does not read app env mirrors directly", () => {
    const temp = tempRepo();
    try {
      writeMirror(path.join(temp.webDir, ".env.production"), {
        ["ADMIN_API_TOKEN"]: "production-fixture-value",
      });

      expect(authSummary("production", { ANYU_OPS_CREDENTIALS_PATH: temp.credentialsPath })).toMatchObject({
        tokenAvailable: false,
        tokenSourceCategory: "missing",
      });
    } finally {
      temp.cleanup();
    }
  });

  it("parses only ADMIN_API_TOKEN from mirror files", () => {
    const temp = tempRepo();
    try {
      const mirrorPath = path.join(temp.webDir, ".env.staging");
      writeMirror(mirrorPath, {
        DATABASE_URL: "must-not-copy",
        ["ADMIN_API_TOKEN"]: "staging-fixture-value",
      });

      const result = readAdminTokenFromMirror(mirrorPath);

      expect(result).toMatchObject({
        found: true,
        token: "staging-fixture-value",
        category: "token_present",
      });
    } finally {
      temp.cleanup();
    }
  });

  it("keeps unsupported options out of the one-time helper", () => {
    expect(() => parseArgs(["--token", "secret", "--confirm-owner-approved"])).toThrow("unsupported_option");
  });
});
