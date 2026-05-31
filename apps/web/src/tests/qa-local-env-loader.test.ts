import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  findWebAppDir,
  loadLocalEnv,
  parseLocalEnvContent,
} from "../../scripts/lib/load-local-env.mjs";

const MUTABLE_ENV_NAMES = ["QA_LOADER_SECRET", "QA_LOADER_EXISTING"];

afterEach(() => {
  for (const name of MUTABLE_ENV_NAMES) {
    delete process.env[name];
  }
});

describe("local QA env loader", () => {
  it("parses env files without requiring dotenv", () => {
    const entries = parseLocalEnvContent(`
# comment
OPERATOR_TEST_SECRET=plain
INTERNAL_JOB_SECRET="quoted value"
NEWEBPAY_HASH_KEY='single quoted'
QA_WITH_COMMENT=value # comment
`);

    expect(entries).toEqual([
      ["OPERATOR_TEST_SECRET", "plain"],
      ["INTERNAL_JOB_SECRET", "quoted value"],
      ["NEWEBPAY_HASH_KEY", "single quoted"],
      ["QA_WITH_COMMENT", "value"],
    ]);
  });

  it("loads missing variables from a local env file without overriding exported env", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "anyu-qa-env-loader-"));
    const envFilePath = path.join(dir, ".env.local");

    try {
      process.env.QA_LOADER_EXISTING = "exported";
      writeFileSync(
        envFilePath,
        [
          "QA_LOADER_SECRET=from-file",
          "QA_LOADER_EXISTING=from-file",
        ].join("\n"),
      );

      const result = loadLocalEnv({ envFilePath });

      expect(result.envFilePresent).toBe(true);
      expect(result.loaded).toContain("QA_LOADER_SECRET");
      expect(result.skippedExisting).toContain("QA_LOADER_EXISTING");
      expect(process.env.QA_LOADER_SECRET).toBe("from-file");
      expect(process.env.QA_LOADER_EXISTING).toBe("exported");
    } finally {
      rmSync(dir, { force: true, recursive: true });
    }
  });

  it("finds the web app directory from the repo root shape", () => {
    const root = mkdtempSync(path.join(tmpdir(), "anyu-qa-env-root-"));
    const webDir = path.join(root, "apps", "web");

    try {
      mkdirSync(webDir, { recursive: true });
      writeFileSync(path.join(webDir, "package.json"), JSON.stringify({ name: "anyu-next-web" }));

      expect(findWebAppDir(root)).toBe(webDir);
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });
});
