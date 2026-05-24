import { describe, expect, it } from "vitest";
import { aiTemperatureDemoProductResult } from "@/lib/modules/demo-result";
import type { ProductResult } from "@/lib/ai/product-result-schema";
import { normalizePaidResultForDisplay } from "@/lib/ai/product-result-schema";
import { validateProductResultObject } from "@/lib/ai/validate-product-result";

function cloneDemoResult(): ProductResult {
  return structuredClone(aiTemperatureDemoProductResult);
}

describe("product result schema validation", () => {
  it("accepts the demo fixture as a valid product result", () => {
    expect(validateProductResultObject(aiTemperatureDemoProductResult)).toEqual(
      aiTemperatureDemoProductResult,
    );
  });

  it("rejects forbidden paid result phrasing", () => {
    const result = cloneDemoResult();
    result.paid_result.avoidDoing[0] = "不要過度分析每一個小動作。";

    expect(() => validateProductResultObject(result)).toThrow(/forbidden phrasing/);
  });

  it("rejects insufficient reply strategies", () => {
    const result = cloneDemoResult();
    result.paid_result.replyStrategies = result.paid_result.replyStrategies.slice(0, 2);

    expect(() => validateProductResultObject(result)).toThrow(/replyStrategies|must NOT have fewer/);
  });

  it("rejects insufficient copyable messages", () => {
    const result = cloneDemoResult();
    result.paid_result.replyStrategies[0].copyableMessages = ["這週如果你有空，我們喝杯咖啡就好。"];

    expect(() => validateProductResultObject(result)).toThrow(/copyableMessages|must NOT have fewer/);
  });

  it("rejects missing next48HourPlan depth", () => {
    const result = cloneDemoResult();
    result.paid_result.next48HourPlan = ["先等等"];

    expect(() => validateProductResultObject(result)).toThrow(/next48HourPlan|must NOT have fewer/);
  });

  it("rejects missing summary card depth", () => {
    const result = cloneDemoResult();
    result.paid_result.summaryCard.nextMove = "";

    expect(() => validateProductResultObject(result)).toThrow(/summaryCard|too thin/);
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
