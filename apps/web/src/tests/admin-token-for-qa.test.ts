import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  resolveAdminTokenForQa,
  summarizeAdminTokenForQa,
} from "../../scripts/lib/admin-token-for-qa.mjs";

const MUTABLE_ENV_NAMES = ["ADMIN_API_TOKEN"];

afterEach(() => {
  for (const name of MUTABLE_ENV_NAMES) {
    delete process.env[name];
  }
});

describe("Admin token for QA resolver", () => {
  it("uses process env before the staging mirror", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "anyu-admin-token-qa-"));

    try {
      process.env.ADMIN_API_TOKEN = "process-token";
      const envFilePath = path.join(dir, ".env.staging");
      writeFileSync(envFilePath, "ADMIN_API_TOKEN=mirror-token\n");

      const result = resolveAdminTokenForQa({ envFilePath, targetEnv: "staging" });

      expect(result.token).toBe("process-token");
      expect(result.sourceCategory).toBe("process_env");
      expect(summarizeAdminTokenForQa(result)).toEqual({
        sourceCategory: "process_env",
        tokenPresent: true,
        valuesPrinted: false,
        lengthsPrinted: false,
        prefixesPrinted: false,
        suffixesPrinted: false,
        hashesPrinted: false,
        checksumsPrinted: false,
      });
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  it("loads ADMIN_API_TOKEN from .env.staging for staging QA only", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "anyu-admin-token-qa-"));

    try {
      const envFilePath = path.join(dir, ".env.staging");
      writeFileSync(envFilePath, "ADMIN_API_TOKEN=mirror-token\n");

      const staging = resolveAdminTokenForQa({ envFilePath, targetEnv: "staging" });
      const production = resolveAdminTokenForQa({ envFilePath, targetEnv: "production" });

      expect(staging.token).toBe("mirror-token");
      expect(staging.sourceCategory).toBe("staging_mirror");
      expect(production.token).toBe("");
      expect(production.sourceCategory).toBe("missing");
      expect(process.env.ADMIN_API_TOKEN).toBeUndefined();
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  it("returns an explicit missing category without token metadata", () => {
    const result = resolveAdminTokenForQa({
      env: {},
      envFilePath: path.join(tmpdir(), "missing-admin-token.env"),
      targetEnv: "staging",
    });
    const summary = summarizeAdminTokenForQa(result);

    expect(result.token).toBe("");
    expect(result.sourceCategory).toBe("missing");
    expect(summary).toMatchObject({
      sourceCategory: "missing",
      tokenPresent: false,
      valuesPrinted: false,
      lengthsPrinted: false,
      prefixesPrinted: false,
      suffixesPrinted: false,
      hashesPrinted: false,
      checksumsPrinted: false,
    });
    expect(JSON.stringify(summary)).not.toContain("ADMIN_API_TOKEN=");
  });
});
