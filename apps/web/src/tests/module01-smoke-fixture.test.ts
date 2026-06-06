import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  assertSafeModule01SmokeFixtureOutput,
  buildModule01SmokeFixtureArtifacts,
  validateModule01AnalyzeRequest,
  writeModule01SmokeFixtureArtifacts,
} from "../../scripts/lib/module01-smoke-fixture.mjs";

describe("Module 01 smoke fixture helper", () => {
  it("exposes the smoke fixture command in package scripts", () => {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"));

    expect(packageJson.scripts["qa:module01:smoke-fixture"]).toBe(
      "node scripts/module01-smoke-fixture.mjs",
    );
  });

  it("builds a pass summary and sanitized analyze request artifact", () => {
    const artifacts = buildModule01SmokeFixtureArtifacts({
      generatedAt: "2026-06-07T00:00:00.000Z",
      anonymousSessionId: "module01-smoke-fixture-test-session",
    });

    expect(artifacts.summary).toMatchObject({
      module: "ai-temperature",
      moduleSlug: "ambiguous-temperature",
      command: "qa:module01:smoke-fixture",
      status: "pass",
      validationStatus: "pass",
      visibleLengthPass: true,
      containsPrivateData: false,
      containsTokenizedUrl: false,
      sendsRealEmail: false,
      sendsRealLine: false,
      mutatesData: false,
      productionTouched: false,
    });
    expect(artifacts.summary.userContextKeys).toEqual([
      "relationshipStage",
      "userGoal",
      "primaryPain",
      "replyTone",
    ]);
    expect(artifacts.request).toMatchObject({
      situation: "回訊變慢但看限動",
      anonymousSessionId: "module01-smoke-fixture-test-session",
    });
    expect(() => assertSafeModule01SmokeFixtureOutput(artifacts.summary)).not.toThrow();
    expect(() => assertSafeModule01SmokeFixtureOutput(artifacts.request)).not.toThrow();
  });

  it("writes structured .qa artifacts without tokenized URLs or provider payloads", () => {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "module01-smoke-fixture-"));
    const result = writeModule01SmokeFixtureArtifacts({
      outputDir,
      anonymousSessionId: "module01-smoke-fixture-write-test",
    });
    const request = JSON.parse(fs.readFileSync(result.requestPath, "utf8"));
    const summary = JSON.parse(fs.readFileSync(result.summaryPath, "utf8"));

    expect(request.anonymousSessionId).toBe("module01-smoke-fixture-write-test");
    expect(summary.status).toBe("pass");
    expect(summary.requestArtifact).toContain("module01-valid-analyze-request.json");
    expect(JSON.stringify(summary)).not.toMatch(/TradeInfo|TradeSha|provider_payload/iu);
    expect(JSON.stringify(summary)).not.toMatch(/\/r\/[A-Za-z0-9_-]{12,}/u);
  });

  it("classifies invalid fixture shapes as blocked", () => {
    const validation = validateModule01AnalyzeRequest({
      text: "太短了",
      situation: "回訊變慢但看限動",
      anonymousSessionId: "module01-invalid-fixture-test",
      userContext: {
        userGoal: "請直接替我操控對方",
      },
    });

    expect(validation.validationStatus).toBe("blocked");
    expect(validation.blockers).toEqual(
      expect.arrayContaining(["visible_length_too_short", "invalid_user_context_userGoal"]),
    );
  });
});
