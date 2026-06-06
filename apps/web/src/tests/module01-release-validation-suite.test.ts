import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  assertSanitizedSummary,
  buildSummary,
  deriveGateStatus,
  makeCheck,
  parseAdminCliJsonOutput,
  worstStatus,
} from "../../scripts/module01-release-validation-suite.mjs";

describe("Module 01 release validation suite", () => {
  it("registers the package commands", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"),
    );
    const rootPackageJson = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), "../../package.json"), "utf8"),
    );

    expect(packageJson.scripts["qa:module01:local"]).toBe(
      "node scripts/module01-release-validation-suite.mjs local",
    );
    expect(packageJson.scripts["qa:module01:staging"]).toBe(
      "node scripts/module01-release-validation-suite.mjs staging",
    );
    expect(packageJson.scripts["qa:module01:production-preflight"]).toBe(
      "node scripts/module01-release-validation-suite.mjs production-preflight",
    );
    expect(packageJson.scripts["qa:module01:release"]).toBe(
      "node scripts/module01-release-validation-suite.mjs release",
    );
    expect(packageJson.scripts["ops:paid-result:lookup"]).toBeUndefined();
    expect(rootPackageJson.scripts["ops"]).toBe("corepack pnpm --filter @anyu/admin-cli ops");
    expect(rootPackageJson.scripts["ops"]).not.toContain("--dir");
    expect(rootPackageJson.scripts["ops"]).not.toContain("exec tsx");
  });

  it("derives pass, partial, and blocked gate statuses", () => {
    expect(worstStatus(["pass", "partial"])).toBe("partial");
    expect(worstStatus(["pass", "blocked", "partial"])).toBe("blocked");
    expect(
      deriveGateStatus({
        required: makeCheck("required", "pass"),
        optional: makeCheck("optional", "partial", { required: false }),
      }),
    ).toBe("partial");
    expect(
      deriveGateStatus({
        required: makeCheck("required", "pass"),
        optional: makeCheck("optional", "skipped", { required: false }),
      }),
    ).toBe("pass");
    expect(
      deriveGateStatus({
        required: makeCheck("required", "blocked"),
        optional: makeCheck("optional", "pass", { required: false }),
      }),
    ).toBe("blocked");
  });

  it("builds a summary with explicit safety and manual fields", () => {
    const summary = buildSummary({
      environment: "staging",
      command: "qa:module01:staging",
      checks: {
        noCard: makeCheck("no_card", "pass", {
          mutatesData: true,
          productionTouched: true,
        }),
        admin: makeCheck("admin_api_lookup", "partial", {
          required: false,
          warnings: ["skipped_missing_admin_token"],
        }),
        adminCli: makeCheck("admin_cli_lookup", "pass", {
          adminCliLookupCommand: "pnpm ops lookup-result --env staging --id [REDACTED] --json",
          adminCliLookupStatus: "pass",
          responseSanitized: true,
        }),
        channels: makeCheck("channel_manual_acceptance", "skipped", {
          required: false,
          manualRequired: true,
        }),
      },
      manualRequired: ["ownerEmailReceived"],
    });

    expect(summary).toMatchObject({
      module: "ai-temperature",
      environment: "staging",
      command: "qa:module01:staging",
      status: "partial",
      sendsRealEmail: false,
      sendsRealLine: false,
      mutatesData: true,
      productionTouched: true,
      manualRequired: ["ownerEmailReceived"],
      warnings: ["skipped_missing_admin_token"],
    });
    expect(JSON.stringify(summary)).toContain("adminCliLookupStatus");
    expect(JSON.stringify(summary)).not.toContain("11111111-1111-4111-8111-111111111111");
  });

  it("rejects unsafe summary output", () => {
    expect(() =>
      assertSanitizedSummary({
        module: "ai-temperature",
        raw: ["pal", "private_token_value"].join("_"),
      }),
    ).toThrow("module01_validation_summary_not_sanitized");
    expect(() =>
      assertSanitizedSummary({
        module: "ai-temperature",
        raw: "owner@example.test",
      }),
    ).toThrow("module01_validation_summary_not_sanitized");
  });

  it("parses Admin CLI JSON output after pnpm script prologue", () => {
    expect(
      parseAdminCliJsonOutput(`$ corepack pnpm --filter @anyu/admin-cli ops lookup-result --json
$ tsx src/index.ts lookup-result --json
{"ok":true,"env":"staging","lookup":{"ok":true}}
`),
    ).toEqual({
      ok: true,
      env: "staging",
      lookup: { ok: true },
    });
    expect(parseAdminCliJsonOutput("ANYU ops error: admin_auth_failed\n")).toBeNull();
  });
});
