import { describe, expect, it } from "vitest";
import { aiTemperatureModule } from "@/content/modules/ai-temperature";
import {
  MIN_ANALYZE_LENGTH,
  getAnalyzeButtonLabel,
  getModuleLabel,
  isAnalyzeInputReady,
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
});
