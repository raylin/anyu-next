import { describe, expect, it } from "vitest";

import { aiTemperatureModule } from "@/content/modules/ai-temperature";
import {
  getVisibleAnalyzeLength,
  MIN_ANALYZE_LENGTH,
  validateAnalyzeInput,
} from "@/lib/modules/ai-temperature-ui";
import {
  createModule01AdminPartialLineBindSummaryFixture,
  createModule01AdminReadySummaryFixture,
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
