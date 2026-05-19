import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { aiTemperatureModule } from "@/content/modules/ai-temperature";
import {
  ANALYZE_LOADING_MESSAGES,
  MAX_ANALYZE_LENGTH,
  MIN_ANALYZE_LENGTH,
  buildShareText,
  getAnalyzeErrorMessage,
  getAnalyzeButtonLabel,
  getAnalyzeLoadingMessage,
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

  it("cycles through calm loading messages", () => {
    expect(getAnalyzeLoadingMessage(0)).toBe("讀著你貼上的對話⋯");
    expect(getAnalyzeLoadingMessage(1)).toBe("比對節奏與回應時差⋯");
    expect(getAnalyzeLoadingMessage(ANALYZE_LOADING_MESSAGES.length)).toBe(
      ANALYZE_LOADING_MESSAGES[0],
    );
  });

  it("keeps the app token copy synced with required v1.1 tokens", () => {
    const appTokens = readFileSync(
      resolve(process.cwd(), "src/styles/tokens.css"),
      "utf8",
    );
    const canonicalTokens = readFileSync(
      resolve(process.cwd(), "../../docs/design-system/tokens-v1.1.css"),
      "utf8",
    );

    expect(appTokens).toContain("--anyu-ink-dark");
    expect(appTokens).toContain("--anyu-ink-onDark");
    expect(appTokens).toContain("--anyu-dim-onDark");
    expect(appTokens).toContain("--anyu-line-onDark");
    expect(appTokens).toBe(canonicalTokens);
  });

  it("builds identity-safe share text from result data", () => {
    const shareText = buildShareText(
      {
        score: 42,
        stateLabel: "溫差期",
        oneSentenceRead: "你不是想太多，只是你太會看見細節。",
        observedSignals: [],
        insightTitle: "你卡住的，不只是回覆慢。",
        insight: "讓你卡住的不是他沒回訊息。",
        reassurance: "先別急著追問。",
        persona: "微訊號觀察家",
        shareQuote: "有些曖昧不是沒訊號，是訊號太小聲。",
        paidHeadline: "解鎖下一句怎麼回",
        paidPrice: "NT$49",
        paidIncludedSections: [],
        paidPreviewCopy: "預覽",
      },
      aiTemperatureModule,
      "https://staging.anyu.tw",
    );

    expect(shareText).toContain("我剛測了曖昧溫度計：42/100｜溫差期");
    expect(shareText).toContain("有些曖昧不是沒訊號，是訊號太小聲。");
    expect(shareText).toContain("— 暗語 ANYU");
    expect(shareText).toContain("https://staging.anyu.tw/m/ambiguous-temperature");
  });
});
