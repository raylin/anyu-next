import { describe, expect, it } from "vitest";
import { PAID_RESULT_PROVIDER_FALLBACK_MODEL } from "@/lib/ai/paid-result-generation";
import { aiTemperatureDemoProductResult } from "@/lib/modules/demo-result";
import { extractFreeResult } from "@/lib/modules/result-adapters";
import {
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
});
