import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  assertSanitizedSummary,
  buildSummary,
  deriveGateStatus,
  makeCheck,
  parseAdminCliJsonOutput,
  parseSuiteKnownResultArtifact,
  resolveKnownResultId,
  verifyEnvMirrorShape,
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
    expect(packageJson.scripts["qa:module01:mock-flow"]).toBe(
      "node scripts/module01-mock-flow-qa.mjs",
    );
    expect(packageJson.scripts["qa:module01:staging"]).toBe(
      "node scripts/module01-release-validation-suite.mjs staging",
    );
    expect(packageJson.scripts["qa:module01:staging:channels"]).toBe(
      "node scripts/module01-staging-channels-qa.mjs",
    );
    expect(packageJson.scripts["qa:module01:ui"]).toBe(
      "PLAYWRIGHT_BROWSERS_PATH=../../.playwright-browsers playwright test --config=playwright.module01-ui.config.ts --project=chromium",
    );
    expect(packageJson.scripts["qa:module01:wait-result"]).toBe(
      "node scripts/module01-staging-result-wait.mjs",
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

  it("keeps real staging channels out of default staging and release suites", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "scripts/module01-release-validation-suite.mjs"),
      "utf8",
    );

    expect(source).not.toContain("qa:module01:staging:channels");
    expect(source).not.toContain("module01-staging-channels-qa.mjs");
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

  it("resolves known staging result IDs from explicit env before suite artifact", () => {
    const artifactPath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), "anyu-module01-artifact-")),
      "artifact.json",
    );
    fs.writeFileSync(
      artifactPath,
      JSON.stringify({
        environment: "staging",
        resultId: "22222222-2222-4222-8222-222222222222",
        resultIdSourceCategory: "staging_runtime_no_card",
      }),
    );

    expect(
      resolveKnownResultId({
        env: {
          MODULE01_ADMIN_LOOKUP_RESULT_ID: "11111111-1111-4111-8111-111111111111",
        },
        artifactPath,
      }),
    ).toEqual({
      resultId: "11111111-1111-4111-8111-111111111111",
      sourceCategory: "explicit_env_known_result_id",
    });
  });

  it("resolves known staging result IDs from the no-card artifact", () => {
    const artifact = JSON.stringify({
      environment: "staging",
      resultId: "22222222-2222-4222-8222-222222222222",
      resultIdSourceCategory: "staging_runtime_no_card",
      tokenizedUrlPresent: false,
    });
    const artifactPath = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), "anyu-module01-artifact-")),
      "artifact.json",
    );

    fs.writeFileSync(artifactPath, artifact);

    expect(parseSuiteKnownResultArtifact(artifact)).toEqual({
      resultId: "22222222-2222-4222-8222-222222222222",
      sourceCategory: "staging_runtime_no_card",
    });
    expect(resolveKnownResultId({ env: {}, artifactPath })).toEqual({
      resultId: "22222222-2222-4222-8222-222222222222",
      sourceCategory: "staging_runtime_no_card",
    });
  });

  it("rejects unsafe or non-staging known result artifacts", () => {
    expect(
      parseSuiteKnownResultArtifact(
        JSON.stringify({
          environment: "production",
          resultId: "22222222-2222-4222-8222-222222222222",
          resultIdSourceCategory: "staging_runtime_no_card",
        }),
      ),
    ).toBeNull();
    expect(
      parseSuiteKnownResultArtifact(
        JSON.stringify({
          environment: "staging",
          resultId: ["/r/pal", "unsafe_token_value"].join("_"),
          resultIdSourceCategory: "staging_runtime_no_card",
        }),
      ),
    ).toBeNull();
  });

  it("verifies env mirror shape without exposing values", () => {
    const requiredKeys = ["REQUIRED_ONE", "REQUIRED_TWO", "REQUIRED_THREE"];
    const shape = verifyEnvMirrorShape(
      [
        "REQUIRED_ONE=value-one-redacted",
        "REQUIRED_TWO=value-two-redacted",
        "REQUIRED_THREE=value-three-redacted",
      ].join("\n"),
      requiredKeys,
    );

    expect(shape).toMatchObject({
      category: "pass_mirror_shape",
      missingNames: [],
      emptyNames: [],
      placeholderNames: [],
      duplicateNames: [],
    });
    expect(JSON.stringify(shape)).not.toContain("value-one-redacted");
    expect(JSON.stringify(shape)).not.toContain("value-two-redacted");
    expect(JSON.stringify(shape)).not.toContain("value-three-redacted");
  });

  it("blocks env mirror shape for missing, empty, placeholder, and duplicate keys", () => {
    expect(verifyEnvMirrorShape("A=ok\n", ["A", "B"]).category).toBe(
      "blocked_missing_local_mirror_secret",
    );
    expect(verifyEnvMirrorShape("A=\n", ["A"]).category).toBe(
      "blocked_empty_local_mirror_secret",
    );
    expect(verifyEnvMirrorShape("A=CHANGE_ME\n", ["A"]).category).toBe(
      "blocked_placeholder_local_mirror_secret",
    );
    expect(verifyEnvMirrorShape("A=ok\nA=still-ok\n", ["A"]).category).toBe(
      "blocked_duplicate_local_mirror_key",
    );
  });
});
