import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { aiTemperatureDemoProductResult } from "@/lib/modules/demo-result";
import {
  buildProviderFallbackPaidResult,
  getPaidResultValidationDiagnostics,
  PAID_RESULT_MAX_OUTPUT_TOKENS,
  PAID_RESULT_PROMPT_VERSION,
  PAID_RESULT_SCHEMA_VERSION,
  validatePaidResultText,
} from "@/lib/ai/paid-result-generation";
import {
  PAID_RESULT_MIN_TEXT_LENGTH,
  validatePaidEvidenceSummarySemantics,
} from "@/lib/ai/paid-result-semantic-validation";
import type { ProductResult, RichPaidResult } from "@/lib/ai/product-result-schema";
import { normalizePaidResultForDisplay } from "@/lib/ai/product-result-schema";
import { validateProductResultObject } from "@/lib/ai/validate-product-result";
import { extractFreeResult } from "@/lib/modules/result-adapters";

function cloneDemoResult(): ProductResult {
  return structuredClone(aiTemperatureDemoProductResult);
}

function withEvidenceSummary(paidResult: RichPaidResult): RichPaidResult {
  return {
    ...structuredClone(paidResult),
    evidenceSummary: {
      title: "這份分析主要參考了這些線索",
      items: [
        {
          label: "回覆節奏",
          summary: "對方仍有回應，但速度和延伸度都不穩定。",
          reason: "這能支持「仍有互動，但投入節奏未必一致」的判讀。",
        },
        {
          label: "互動延伸",
          summary: "生活小事仍會出現，代表連結沒有完全中斷。",
          reason: "這讓分析保留多種可能，而不是直接判定冷掉。",
        },
        {
          label: "你的目標",
          summary: "你想知道下一句怎麼回，而不是立刻逼出關係答案。",
          reason: "這會讓建議偏向低壓測試與保留界線。",
        },
      ],
    },
  };
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
    expect(prompt).toContain("The free result should feel seen and useful, but not complete");
    expect(prompt).toContain("Do not explain every ambiguous behavior as stress");
  });

  it("keeps free-only prompt value bounded against paid-level conclusions", () => {
    const prompt = readFileSync(
      resolve(process.cwd(), "src/lib/ai/assets/product_result_prompt_free_v0.md"),
      "utf8",
    );

    expect(prompt).toContain("curiosity-preserving");
    expect(prompt).toContain("Do not make the free result sound complete");
    expect(prompt).toContain("full analysis separates possible states");
  });

  it("keeps deferred paid result semantic depth compatible with compact provider output", () => {
    expect(PAID_RESULT_MIN_TEXT_LENGTH).toBeLessThanOrEqual(900);
  });

  it("discourages unnecessary Chinese-English mixing in the paid result prompt", () => {
    const prompt = readFileSync(
      resolve(process.cwd(), "src/lib/ai/assets/paid_result_prompt_v0.md"),
      "utf8",
    );

    expect(PAID_RESULT_PROMPT_VERSION).toBe("paid_result_prompt_v0.2");
    expect(PAID_RESULT_SCHEMA_VERSION).toBe("paid_result_schema_v3");
    expect(prompt).toContain("Avoid unnecessary English words or code-switching");
    expect(prompt).toContain("genuinely");
    expect(prompt).toContain("vibe");
    expect(prompt).toContain("Prefer Chinese equivalents");
    expect(prompt).toContain("lower interest, lower priority, or unequal investment");
    expect(prompt).toContain("evidenceSummary");
    expect(prompt).toContain("Do not include raw message logs");
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
    expect(paidResult.possibleStates.map((state) => state.label)).toContain("投入程度不對等");
    expect(paidResult.possibleStates.map((state) => state.explanation).join(" ")).toContain(
      "沒有把這段互動放在同樣優先的位置",
    );
    expect(paidResult.evidenceSummary).toBeUndefined();
  });

  it("accepts provider output that wraps the paid result under paid_result", async () => {
    const freeResult = extractFreeResult(aiTemperatureDemoProductResult);
    const paidResultWithEvidence = withEvidenceSummary(aiTemperatureDemoProductResult.paid_result!);
    const paidResult = await validatePaidResultText(
      JSON.stringify({ paid_result: paidResultWithEvidence }),
      freeResult,
    );

    expect(paidResult).toEqual(paidResultWithEvidence);
  });

  it("requires evidence summary for provider-generated paid result schema v3", async () => {
    const freeResult = extractFreeResult(aiTemperatureDemoProductResult);

    await expect(
      validatePaidResultText(JSON.stringify(aiTemperatureDemoProductResult.paid_result), freeResult),
    ).rejects.toSatisfy((error) => {
      const diagnostics = getPaidResultValidationDiagnostics(error);

      expect(diagnostics?.parse).toBe("success");
      expect(diagnostics?.missingFields).toContain("evidenceSummary");
      return true;
    });
  });

  it("rejects unsafe evidence summary details without exposing source content", async () => {
    const freeResult = extractFreeResult(aiTemperatureDemoProductResult);
    const paidResultWithEvidence = withEvidenceSummary(aiTemperatureDemoProductResult.paid_result!);
    paidResultWithEvidence.evidenceSummary!.items[0].summary =
      "對方仍有回應，但夾帶 test@example.com 這類不該保留的識別資訊。";

    await expect(
      validatePaidResultText(JSON.stringify(paidResultWithEvidence), freeResult),
    ).rejects.toSatisfy((error) => {
      const diagnostics = getPaidResultValidationDiagnostics(error);

      expect(diagnostics?.semanticCategory).toContain("unsafe identifier-like text");
      expect(JSON.stringify(diagnostics)).not.toContain("test@example.com");
      return true;
    });
  });

  it("keeps evidence semantic validation bounded to summaries, not raw quotes", () => {
    expect(() =>
      validatePaidEvidenceSummarySemantics({
        title: "這份分析主要參考了這些線索",
        items: [
          {
            label: "原句",
            summary: "「這是一段很長很長的逐字引用內容，超過二十四個字，不應該被保留下來」",
            reason: "這會讓證據區像逐字稿，而不是摘要。",
          },
          { label: "節奏", summary: "回覆仍在，但互動延伸不穩。", reason: "支撐多重可能判讀。" },
          { label: "目標", summary: "使用者想知道下一句怎麼回。", reason: "支撐低壓回覆策略。" },
        ],
      }),
    ).toThrow(/long quote-like text/);
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
