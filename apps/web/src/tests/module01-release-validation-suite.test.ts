import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  assertSanitizedSummary,
  buildSummary,
  deriveGateStatus,
  makeCheck,
  worstStatus,
} from "../../scripts/module01-release-validation-suite.mjs";

describe("Module 01 release validation suite", () => {
  it("registers the package commands", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"),
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
  });

  it("rejects unsafe summary output", () => {
    expect(() =>
      assertSanitizedSummary({
        module: "ai-temperature",
        raw: "pal_private_token_value",
      }),
    ).toThrow("module01_validation_summary_not_sanitized");
    expect(() =>
      assertSanitizedSummary({
        module: "ai-temperature",
        raw: "owner@example.test",
      }),
    ).toThrow("module01_validation_summary_not_sanitized");
  });
});
