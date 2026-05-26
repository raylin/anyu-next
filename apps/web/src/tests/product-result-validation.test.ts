import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { aiTemperatureDemoProductResult } from "@/lib/modules/demo-result";
import {
  buildProviderFallbackPaidResult,
  getPaidResultValidationDiagnostics,
  PAID_RESULT_MAX_OUTPUT_TOKENS,
  validatePaidResultText,
} from "@/lib/ai/paid-result-generation";
import { PAID_RESULT_MIN_TEXT_LENGTH } from "@/lib/ai/paid-result-semantic-validation";
import type { ProductResult } from "@/lib/ai/product-result-schema";
import { normalizePaidResultForDisplay } from "@/lib/ai/product-result-schema";
import { validateProductResultObject } from "@/lib/ai/validate-product-result";
import { extractFreeResult } from "@/lib/modules/result-adapters";

function cloneDemoResult(): ProductResult {
  return structuredClone(aiTemperatureDemoProductResult);
}

describe("product result schema validation", () => {
  it("accepts the demo fixture as a valid product result", () => {
    expect(validateProductResultObject(aiTemperatureDemoProductResult)).toEqual(
      aiTemperatureDemoProductResult,
    );
  });

  it("keeps the paid result prompt concise enough for synchronous analyze", () => {
    const prompt = readFileSync(
      resolve(process.cwd(), "src/lib/ai/assets/product_result_prompt_v0.md"),
      "utf8",
    );

    expect(prompt).toContain("Target about 1,200–1,800 Traditional Chinese characters");
    expect(prompt).toContain("exactly 6 copyable messages");
  });

  it("keeps deferred paid result semantic depth compatible with compact provider output", () => {
    expect(PAID_RESULT_MIN_TEXT_LENGTH).toBeLessThanOrEqual(900);
  });

  it("discourages unnecessary Chinese-English mixing in the paid result prompt", () => {
    const prompt = readFileSync(
      resolve(process.cwd(), "src/lib/ai/assets/paid_result_prompt_v0.md"),
      "utf8",
    );

    expect(prompt).toContain("Avoid unnecessary English words or code-switching");
    expect(prompt).toContain("genuinely");
    expect(prompt).toContain("vibe");
    expect(prompt).toContain("Prefer Chinese equivalents");
  });

  it("keeps deferred paid result output budget large enough for complete JSON", () => {
    expect(PAID_RESULT_MAX_OUTPUT_TOKENS).toBeGreaterThanOrEqual(3_600);
  });

  it("accepts free-only results without running paid semantic validation", () => {
    const freeResult = extractFreeResult(aiTemperatureDemoProductResult);

    expect(
      validateProductResultObject(freeResult, "product_result_schema_free_v1"),
    ).toEqual(freeResult);
  });

  it("builds a valid provider-fallback paid result for deferred generation", () => {
    const freeResult = extractFreeResult(aiTemperatureDemoProductResult);
    const paidResult = buildProviderFallbackPaidResult({
      freeResult,
      userContext: {
        relationshipStage: "曖昧中",
        userGoal: "我該怎麼回",
        primaryPain: "回覆變慢",
        replyTone: "有界線但不冷",
      },
    });

    expect(validateProductResultObject({ ...freeResult, paid_result: paidResult })).toEqual({
      ...freeResult,
      paid_result: paidResult,
    });
    expect(paidResult.replyStrategies.flatMap((strategy) => strategy.copyableMessages)).toHaveLength(6);
  });

  it("accepts provider output that wraps the paid result under paid_result", async () => {
    const freeResult = extractFreeResult(aiTemperatureDemoProductResult);
    const paidResult = await validatePaidResultText(
      JSON.stringify({ paid_result: aiTemperatureDemoProductResult.paid_result }),
      freeResult,
    );

    expect(paidResult).toEqual(aiTemperatureDemoProductResult.paid_result);
  });

  it("returns sanitized diagnostics for schema validation failures", async () => {
    const freeResult = extractFreeResult(aiTemperatureDemoProductResult);

    await expect(
      validatePaidResultText(
        JSON.stringify({
          fullSummary: "摘要",
          possibleStates: [],
          signalDeepDive: [],
          replyStrategies: [{ label: "主動推進", copyableMessages: [] }],
          next48HourPlan: [],
          avoidDoing: [],
          softInsight: "提醒",
          summaryCard: {},
        }),
        freeResult,
      ),
    ).rejects.toSatisfy((error) => {
      const diagnostics = getPaidResultValidationDiagnostics(error);

      expect(diagnostics).toMatchObject({
        parse: "success",
        copyableMessagesCount: 0,
      });
      expect(diagnostics?.schemaFailurePaths).toContain("/replyStrategies/0");
      expect(diagnostics?.missingFields).toEqual(
        expect.arrayContaining([
          "/replyStrategies/0.tone",
          "/replyStrategies/0.whenToUse",
          "/replyStrategies/0.whyItWorks",
        ]),
      );
      expect(diagnostics?.arrayCounts).toMatchObject({
        possibleStates: 0,
        signalDeepDive: 0,
        replyStrategies: 1,
        next48HourPlan: 0,
        avoidDoing: 0,
        "replyStrategies.0.copyableMessages": 0,
      });

      return true;
    });
  });

  it("rejects forbidden paid result phrasing", () => {
    const result = cloneDemoResult();
    result.paid_result!.avoidDoing[0] = "不要用操控對方的方式推進關係。";

    expect(() => validateProductResultObject(result)).toThrow(/forbidden phrasing/);
  });

  it("rejects insufficient reply strategies", () => {
    const result = cloneDemoResult();
    result.paid_result!.replyStrategies = result.paid_result!.replyStrategies.slice(0, 2);

    expect(() => validateProductResultObject(result)).toThrow(/replyStrategies|must NOT have fewer/);
  });

  it("rejects insufficient copyable messages", () => {
    const result = cloneDemoResult();
    result.paid_result!.replyStrategies[0].copyableMessages = ["這週如果你有空，我們喝杯咖啡就好。"];

    expect(() => validateProductResultObject(result)).toThrow(/copyableMessages|must NOT have fewer/);
  });

  it("rejects missing next48HourPlan depth", () => {
    const result = cloneDemoResult();
    result.paid_result!.next48HourPlan = ["先等等"];

    expect(() => validateProductResultObject(result)).toThrow(/next48HourPlan|must NOT have fewer/);
  });

  it("rejects missing summary card depth", () => {
    const result = cloneDemoResult();
    result.paid_result!.summaryCard.nextMove = "";

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
