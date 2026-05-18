import { describe, expect, it } from "vitest";
import { aiTemperatureModule } from "@/content/modules/ai-temperature";
import {
  MAX_ANALYZE_LENGTH,
  MIN_ANALYZE_LENGTH,
  getAnalyzeErrorMessage,
  getAnalyzeButtonLabel,
  getModuleLabel,
  isAnalyzeInputReady,
  scoreToBucket,
  validateAnalyzeInput,
} from "@/lib/modules/ai-temperature-ui";

describe("ai-temperature UI helpers", () => {
  it("keeps the CTA disabled for short input", () => {
    expect(isAnalyzeInputReady("太短了")).toBe(false);
    expect(getAnalyzeButtonLabel("太短了")).toBe("先貼一段對話");
  });

  it("enables the CTA once input reaches the minimum length", () => {
    const longEnough = "我昨天約他週末見面，但他已讀後沒有回我。";

    expect(longEnough.trim().length).toBeGreaterThanOrEqual(MIN_ANALYZE_LENGTH);
    expect(isAnalyzeInputReady(longEnough)).toBe(true);
    expect(getAnalyzeButtonLabel(longEnough)).toBe("分析我的曖昧溫度");
  });

  it("renders the expected module label and chip inventory", () => {
    expect(getModuleLabel(aiTemperatureModule)).toBe("module · 01 · 曖昧溫度計");
    expect(aiTemperatureModule.title).toBe("他是真的忙，還是其實在冷掉？");
    expect(aiTemperatureModule.subtitle).toBe(
      "貼上對話或描述情境，AI 幫你讀出關係溫度，與下一句怎麼回。",
    );
    expect(aiTemperatureModule.chips).toEqual([
      "已讀不回",
      "忽冷忽熱",
      "回訊變慢但看限動",
      "不確定 / 跳過",
    ]);
  });

  it("normalizes analyze input against the allowed chips", () => {
    const result = validateAnalyzeInput({
      text: "我昨天約他週末見面，但他今天已讀後沒回，晚上卻還在發限動。",
      situation: "已讀不回",
      anonymousSessionId: "session-123",
      allowedChips: aiTemperatureModule.chips,
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.situation).toBe("已讀不回");
      expect(result.anonymousSessionId).toBe("session-123");
    }
  });

  it("rejects too-short and too-long analyze input", () => {
    const tooShort = validateAnalyzeInput({
      text: "太短了",
      allowedChips: aiTemperatureModule.chips,
    });
    const tooLong = validateAnalyzeInput({
      text: "a".repeat(MAX_ANALYZE_LENGTH + 1),
      allowedChips: aiTemperatureModule.chips,
    });

    expect(tooShort.ok).toBe(false);
    expect(tooLong.ok).toBe(false);
  });

  it("maps score ranges into buckets", () => {
    expect(scoreToBucket(10)).toBe("cold");
    expect(scoreToBucket(40)).toBe("cool");
    expect(scoreToBucket(70)).toBe("warm");
    expect(scoreToBucket(90)).toBe("hot");
    expect(scoreToBucket(Number.NaN)).toBe("unknown");
  });

  it("maps runtime errors into friendly UI copy", () => {
    expect(getAnalyzeErrorMessage("config_error")).toBe(
      "目前分析服務尚未設定完成，請稍後再試。",
    );
    expect(getAnalyzeErrorMessage("input_too_short")).toBe(
      "文字太短，請多貼一點互動脈絡。",
    );
    expect(getAnalyzeErrorMessage("input_too_long")).toBe(
      "文字太長，請先保留最近幾段關鍵對話。",
    );
    expect(getAnalyzeErrorMessage("anything_else")).toBe(
      "分析暫時失敗，請晚點再試一次。",
    );
  });
});
