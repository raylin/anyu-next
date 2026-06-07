import { describe, expect, it } from "vitest";

import { aiTemperatureModule } from "@/content/modules/ai-temperature";
import { buildAnalyzeCacheKey } from "@/lib/ai/result-cache";
import {
  getVisibleAnalyzeLength,
  MIN_ANALYZE_LENGTH,
  validateAnalyzeInput,
} from "@/lib/modules/ai-temperature-ui";
import {
  createModule01AdminPartialLineBindSummaryFixture,
  createModule01AdminReadySummaryFixture,
  createFreshModule01SmokeAnalyzeRequest,
  createModule01SmokeRunId,
  createValidModule01AnalyzeRequest,
  createValidModule01AnalyzeText,
  MODULE01_CHECKOUT_HARNESS_STATES,
  MODULE01_PAYMENT_CONTEXT,
  MODULE01_VALID_ANALYZE_FIXTURE_NAME,
  MODULE01_VALID_ANALYZE_VALIDITY_NOTE,
} from "@/tests/fixtures/module01";

describe("Module 01 shared fixtures", () => {
  it("keeps the canonical analyze request valid against current Module 01 validation", () => {
    const request = createValidModule01AnalyzeRequest({
      anonymousSessionId: "fixture-contract-test-session",
    });
    const result = validateAnalyzeInput({
      ...request,
      allowedChips: aiTemperatureModule.chips,
    });

    expect(MODULE01_VALID_ANALYZE_FIXTURE_NAME).toBe(
      "module01_valid_smoke_analyze_request_v0",
    );
    expect(MODULE01_VALID_ANALYZE_VALIDITY_NOTE).toContain("80 visible-character minimum");
    expect(getVisibleAnalyzeLength(request.text)).toBeGreaterThanOrEqual(MIN_ANALYZE_LENGTH);
    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.situation).toBe("回訊變慢但看限動");
      expect(result.userContext).toEqual({
        relationshipStage: "曖昧中",
        userGoal: "我該怎麼回",
        primaryPain: "回覆變慢",
        replyTone: "有界線但不冷",
      });
      expect(result.userContextProvided).toBe(true);
      expect(result.userContextFieldCount).toBe(4);
    }
  });

  it("creates fresh smoke requests that remain valid and change cache-relevant text", () => {
    const first = createFreshModule01SmokeAnalyzeRequest({
      smokeRunId: "module01-smoke-20260607T090000Z-1234abcd",
    });
    const second = createFreshModule01SmokeAnalyzeRequest({
      smokeRunId: "module01-smoke-20260607T090001Z-5678abcd",
    });

    expect(first.smokeRunId).toBe("module01-smoke-20260607T090000Z-1234abcd");
    expect(second.smokeRunId).toBe("module01-smoke-20260607T090001Z-5678abcd");
    expect(first.text).not.toBe(second.text);
    expect(first.anonymousSessionId).not.toBe(second.anonymousSessionId);
    expect(first.text).toContain("【系統測試批次：module01-smoke-20260607T090000Z-1234abcd】");
    expect(second.text).toContain("【系統測試批次：module01-smoke-20260607T090001Z-5678abcd】");

    for (const request of [first, second]) {
      const result = validateAnalyzeInput({
        ...request,
        allowedChips: aiTemperatureModule.chips,
      });

      expect(result.ok).toBe(true);
      expect(JSON.stringify(request)).not.toMatch(/pa_|pcs_|pal_|\/r\/|@/iu);
    }
  });

  it("proves smokeRunId changes the analysis cache key while anonymousSessionId alone is not assumed sufficient", () => {
    const base = createValidModule01AnalyzeRequest({
      anonymousSessionId: "module01-session-a",
    });
    const sameTextDifferentSession = createValidModule01AnalyzeRequest({
      anonymousSessionId: "module01-session-b",
    });
    const fresh = createFreshModule01SmokeAnalyzeRequest({
      smokeRunId: "module01-smoke-20260607T090002Z-90abcdef",
    });
    const cacheInput = {
      moduleSlug: "ambiguous-temperature",
      situation: base.situation,
      userContext: base.userContext,
      promptVersion: "product_result_prompt_v0.4",
      schemaVersion: "product_result_schema_v2",
      modelStrategy: "sonnet_default" as const,
      provider: "anthropic" as const,
      primaryModel: "claude-sonnet-4-20250514",
    };
    const env = { NODE_ENV: "test" } as NodeJS.ProcessEnv;
    const baseKey = buildAnalyzeCacheKey({ ...cacheInput, redactedText: base.text }, env);
    const sessionOnlyKey = buildAnalyzeCacheKey(
      { ...cacheInput, redactedText: sameTextDifferentSession.text },
      env,
    );
    const freshKey = buildAnalyzeCacheKey({ ...cacheInput, redactedText: fresh.text }, env);

    expect(sessionOnlyKey?.cacheKeyHash).toBe(baseKey?.cacheKeyHash);
    expect(freshKey?.cacheKeyHash).not.toBe(baseKey?.cacheKeyHash);
  });

  it("generates smokeRunIds with a stable non-private format", () => {
    const smokeRunId = createModule01SmokeRunId();

    expect(smokeRunId).toMatch(/^module01-smoke-[0-9]{8}T[0-9]{6}Z-[a-f0-9]{8}$/u);
  });

  it("creates safe smoke text variants without private or tokenized values", () => {
    const text = createValidModule01AnalyzeText("fixture-cache-buster");

    expect(text).toContain("fixture-cache-buster");
    expect(text).not.toMatch(/pa_[A-Za-z0-9_-]{8,}/u);
    expect(text).not.toMatch(/pcs_[A-Za-z0-9_-]{8,}/u);
    expect(text).not.toMatch(/pal_[A-Za-z0-9_-]{8,}/u);
    expect(text).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu);
  });

  it("defines reusable checkout, access-link, admin, and payment fixture surfaces", () => {
    expect(MODULE01_CHECKOUT_HARNESS_STATES).toEqual([
      "desktop_locked",
      "email_saved",
      "mobile_locked",
      "line_deliverable",
      "line_contact_only",
    ]);
    expect(MODULE01_PAYMENT_CONTEXT).toMatchObject({
      amountMinor: 49,
      currency: "TWD",
      provider: "newebpay",
    });
    expect(createModule01AdminReadySummaryFixture().diagnosis).toContain("paid_result_ready");
    expect(createModule01AdminPartialLineBindSummaryFixture().diagnosis).toEqual(
      expect.arrayContaining(["line_bind_incomplete", "line_recipient_secret_missing"]),
    );
  });
});
