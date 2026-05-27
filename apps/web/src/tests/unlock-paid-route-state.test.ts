import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { PAID_RESULT_PROVIDER_FALLBACK_MODEL } from "@/lib/ai/paid-result-generation";
import { aiTemperatureDemoProductResult } from "@/lib/modules/demo-result";
import { extractFreeResult } from "@/lib/modules/result-adapters";
import {
  EvidenceSummarySection,
  getResultAgeBucket,
  getUnlockedPaidResultSource,
  resolveUnlockPaidRouteState,
} from "@/app/m/[moduleSlug]/unlock/[unlockToken]/page";

describe("unlock paid route state", () => {
  it("renders completed state when a completed paid result exists", () => {
    expect(
      resolveUnlockPaidRouteState({
        result: extractFreeResult(aiTemperatureDemoProductResult),
        storedPaidResult: {
          status: "completed",
          paidResultJson: aiTemperatureDemoProductResult.paid_result,
        },
        fulfillmentStatus: "delivered",
      }),
    ).toBe("completed");
  });

  it("renders processing state directly without falling back to claim CTA", () => {
    expect(
      resolveUnlockPaidRouteState({
        result: extractFreeResult(aiTemperatureDemoProductResult),
        storedPaidResult: {
          status: "processing",
          paidResultJson: null,
        },
        fulfillmentStatus: "delivered",
      }),
    ).toBe("processing");
  });

  it("treats fulfilled links with no paid row as claimed missing pending state", () => {
    expect(
      resolveUnlockPaidRouteState({
        result: extractFreeResult(aiTemperatureDemoProductResult),
        storedPaidResult: null,
        fulfillmentStatus: "bound",
      }),
    ).toBe("claimed_missing");
  });

  it("keeps failed paid results in safe failure state", () => {
    expect(
      resolveUnlockPaidRouteState({
        result: aiTemperatureDemoProductResult,
        storedPaidResult: {
          status: "failed",
          paidResultJson: null,
        },
        fulfillmentStatus: "delivered",
      }),
    ).toBe("failed");
  });

  it("classifies completed paid result source safely", () => {
    expect(
      getUnlockedPaidResultSource({
        result: extractFreeResult(aiTemperatureDemoProductResult),
        storedPaidResult: {
          status: "completed",
          model: "claude-sonnet-4-20250514",
          paidResultJson: aiTemperatureDemoProductResult.paid_result,
        },
      }),
    ).toBe("provider");

    expect(
      getUnlockedPaidResultSource({
        result: extractFreeResult(aiTemperatureDemoProductResult),
        storedPaidResult: {
          status: "completed",
          model: PAID_RESULT_PROVIDER_FALLBACK_MODEL,
          paidResultJson: aiTemperatureDemoProductResult.paid_result,
        },
      }),
    ).toBe("fallback");

    expect(
      getUnlockedPaidResultSource({
        result: aiTemperatureDemoProductResult,
        storedPaidResult: null,
      }),
    ).toBe("legacy");

    expect(
      getUnlockedPaidResultSource({
        result: extractFreeResult(aiTemperatureDemoProductResult),
        storedPaidResult: null,
      }),
    ).toBe("unknown");
  });

  it("buckets completed result age without exposing timestamps", () => {
    const now = new Date("2026-05-27T12:00:00.000Z");

    expect(getResultAgeBucket("2026-05-27T11:30:00.000Z", now)).toBe("lt_1h");
    expect(getResultAgeBucket("2026-05-27T08:00:00.000Z", now)).toBe("1_24h");
    expect(getResultAgeBucket("2026-05-25T12:00:00.000Z", now)).toBe("1_7d");
    expect(getResultAgeBucket("2026-05-01T12:00:00.000Z", now)).toBe("gt_7d");
    expect(getResultAgeBucket("not-a-date", now)).toBe("unknown");
  });

  it("renders paid evidence summaries only when v3 evidence is available", () => {
    const html = renderToStaticMarkup(
      createElement(EvidenceSummarySection, {
        evidenceSummary: {
          title: "這份分析主要參考了這些線索",
          items: [
            {
              label: "回覆節奏",
              summary: "對方仍有回應，但速度與延伸度不穩。",
              reason: "支撐仍有互動但投入節奏不一致的判讀。",
            },
            {
              label: "生活小事",
              summary: "生活近況仍會出現，連結沒有完全中斷。",
              reason: "讓分析保留多種可能，而非直接判定冷掉。",
            },
            {
              label: "回覆目標",
              summary: "使用者想知道下一句怎麼回。",
              reason: "支撐低壓、保留界線的回覆策略。",
            },
          ],
        },
      }),
    );

    expect(html).toContain("evidence");
    expect(html).toContain("這份分析主要參考了這些線索");
    expect(html).toContain("回覆節奏");
    expect(renderToStaticMarkup(createElement(EvidenceSummarySection, { evidenceSummary: null }))).toBe("");
  });
});
