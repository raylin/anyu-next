import { describe, expect, it } from "vitest";
import { aiTemperatureDemoProductResult } from "@/lib/modules/demo-result";
import { normalizePaidResultForDisplay } from "@/lib/ai/product-result-schema";
import { validateProductResultObject } from "@/lib/ai/validate-product-result";

describe("product result schema validation", () => {
  it("accepts the demo fixture as a valid product result", () => {
    expect(validateProductResultObject(aiTemperatureDemoProductResult)).toEqual(
      aiTemperatureDemoProductResult,
    );
  });

  it("adapts legacy paid result shapes for display", () => {
    const paidResult = normalizePaidResultForDisplay({
      deeper_signal_analysis: "深層訊號",
      possible_interpretation: "可能解讀",
      risk_warning: "風險提醒",
      what_not_to_do: ["不要連續追問"],
      reply_strategies: {
        主動推進: "主動推進建議",
        低壓試探: "低壓試探建議",
        暫時拉開: "暫時拉開建議",
      },
    });

    expect(paidResult.fullSummary).toBe("可能解讀");
    expect(paidResult.replyStrategies).toHaveLength(3);
    expect(paidResult.avoidDoing).toEqual(["不要連續追問"]);
  });
});
