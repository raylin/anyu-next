import { describe, expect, it } from "vitest";
import { aiTemperatureDemoProductResult } from "@/lib/modules/demo-result";
import { extractFreeResult } from "@/lib/modules/result-adapters";
import { resolveUnlockPaidRouteState } from "@/app/m/[moduleSlug]/unlock/[unlockToken]/page";

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
});
