import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { aiTemperatureModule } from "@/content/modules/ai-temperature";
import {
  ANALYZE_REQUEST_TIMEOUT_MS,
  EMAIL_FALLBACK_BODY,
  EMAIL_FALLBACK_LABEL,
  LINE_ADD_URL_CONFIG_KEY,
  LINE_PRIMARY_BODY,
  LINE_PRIMARY_CTA,
  LINE_PRIMARY_PANEL_TITLE,
  type AnalyzeInputGuidanceState,
  MAX_ANALYZE_LENGTH,
  MISSING_LINE_URL_MESSAGE,
  MIN_ANALYZE_LENGTH,
  SOFT_MAX_ANALYZE_LENGTH,
  buildShareText,
  getLineAddUrl,
  getAnalyzeErrorMessage,
  getAnalyzeButtonLabel,
  getAnalyzeInputGuidance,
  getAnalyzeInputHint,
  getAnalyzeLoadingMessage,
  getAnalyzeLoadingSubtitle,
  getAnalyzeWaitStage,
  getModuleLabel,
  isAnalyzeInputReady,
  scoreToBucket,
  validateAnalyzeInput,
} from "@/lib/modules/ai-temperature-ui";

describe("ai-temperature UI helpers", () => {
  it("keeps the CTA disabled for short input", () => {
    expect(isAnalyzeInputReady("太短了")).toBe(false);
    expect(getAnalyzeButtonLabel("太短了")).toBe("再寫一點…");
    expect(getAnalyzeInputGuidance("太短了")).toMatchObject({
      state: "too_short" satisfies AnalyzeInputGuidanceState,
      label: "還差一點點",
      detail: "多給一點互動脈絡，ANYU 才讀得出節奏。",
      counterText: "3 / 30",
    });
  });

  it("enables the CTA once input reaches the minimum length", () => {
    const longEnough = "我昨天約他週末見面，但他已讀後沒有回我，今天晚上還在發限動。";

    expect(longEnough.trim().length).toBeGreaterThanOrEqual(MIN_ANALYZE_LENGTH);
    expect(isAnalyzeInputReady(longEnough)).toBe(true);
    expect(getAnalyzeButtonLabel(longEnough)).toBe("分析我的曖昧溫度");
    expect(getAnalyzeInputGuidance(longEnough)).toMatchObject({
      state: "can_analyze" satisfies AnalyzeInputGuidanceState,
      label: "可以分析了",
      detail: "如果再多一點前後文，結果會更細。",
    });
  });

  it("maps context quality bands into guidance states", () => {
    expect(getAnalyzeInputGuidance("a".repeat(130))).toMatchObject({
      state: "ideal" satisfies AnalyzeInputGuidanceState,
      label: "內容剛剛好",
      detail: "這段互動已經足夠讀出節奏。",
    });
    expect(getAnalyzeInputGuidance("a".repeat(SOFT_MAX_ANALYZE_LENGTH + 1))).toMatchObject({
      state: "long" satisfies AnalyzeInputGuidanceState,
      label: "內容有點長",
      detail: "建議保留最近幾段關鍵對話就好。",
    });
    expect(getAnalyzeInputGuidance("a".repeat(MAX_ANALYZE_LENGTH + 1))).toMatchObject({
      state: "too_long" satisfies AnalyzeInputGuidanceState,
      label: "內容太長了",
      detail: "請刪到 4000 字以內，再送出分析。",
      counterText: `${MAX_ANALYZE_LENGTH + 1} / ${MAX_ANALYZE_LENGTH}`,
    });
    expect(getAnalyzeButtonLabel("a".repeat(MAX_ANALYZE_LENGTH + 1))).toBe("內容太長了");
  });

  it("keeps the legacy hint helper aligned with the richer guidance", () => {
    expect(getAnalyzeInputHint("a".repeat(130))).toBe("這段互動已經足夠讀出節奏。");
    expect(getAnalyzeInputHint("a".repeat(SOFT_MAX_ANALYZE_LENGTH + 1))).toBe(
      "建議保留最近幾段關鍵對話就好。",
    );
  });

  it("keeps the guidance copy soft and avoids remaining-count pressure", () => {
    const states = [
      getAnalyzeInputGuidance("太短了"),
      getAnalyzeInputGuidance("a".repeat(MIN_ANALYZE_LENGTH)),
      getAnalyzeInputGuidance("a".repeat(130)),
      getAnalyzeInputGuidance("a".repeat(SOFT_MAX_ANALYZE_LENGTH + 1)),
      getAnalyzeInputGuidance("a".repeat(MAX_ANALYZE_LENGTH + 1)),
    ];

    for (const state of states) {
      expect(state.detail).not.toMatch(/再補\s*\d+\s*個字/);
      expect(state.detail).not.toMatch(/還剩\s*\d+\s*個字/);
    }
  });

  it("shows numeric progress for the first threshold without duplicate pressure copy", () => {
    const shortGuidance = getAnalyzeInputGuidance("曖昧中");

    expect(shortGuidance.counterText).toBe("3 / 30");
    expect(shortGuidance.label).toBe("還差一點點");
    expect(shortGuidance.detail).not.toMatch(/再補\s*\d+\s*個字/);
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
      text: "我昨天約他週末見面，但他今天已讀後沒回，晚上卻還在發限動，我真的有點猜不透。",
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
    expect(getAnalyzeErrorMessage("unsupported_content")).toBe(
      "這段看起來不像曖昧或關係互動情境。請貼最近的對話，或用自己的話描述你卡住的互動。",
    );
    expect(getAnalyzeErrorMessage("prompt_injection_detected")).toBe(
      "這段裡有一些和關係分析無關的指令。請移除後再試一次。",
    );
    expect(getAnalyzeErrorMessage("rate_limited_session")).toBe(
      "今天已經分析過幾次了，請明天再來看看。",
    );
    expect(getAnalyzeErrorMessage("rate_limited_ip")).toBe(
      "這個裝置或網路剛剛送出太多次，請稍後再試。",
    );
    expect(getAnalyzeErrorMessage("daily_cap_reached")).toBe(
      "今天的體驗名額已滿，請明天再試。",
    );
    expect(getAnalyzeErrorMessage("validation_error")).toBe(
      "送出的內容格式不正確，請重新整理後再試。",
    );
    expect(getAnalyzeErrorMessage("config_error")).toBe(
      "目前分析服務尚未設定完成，請稍後再試。",
    );
    expect(getAnalyzeErrorMessage("provider_error")).toBe(
      "這次分析等得比較久，請稍後再試一次。",
    );
    expect(getAnalyzeErrorMessage("request_timeout")).toBe(
      "這次分析等得比較久，請稍後再試一次。",
    );
    expect(getAnalyzeErrorMessage("input_too_short")).toBe(
      "再寫一點互動脈絡，ANYU 才讀得出節奏。",
    );
    expect(getAnalyzeErrorMessage("input_too_long")).toBe(
      "這段太長了，請保留最近幾段關鍵對話再試一次。",
    );
    expect(getAnalyzeErrorMessage("anything_else")).toBe(
      "分析暫時失敗，請晚點再試一次。",
    );
  });

  it("maps elapsed time into wait-state stages and copy", () => {
    expect(ANALYZE_REQUEST_TIMEOUT_MS).toBeGreaterThan(60_000);
    expect(getAnalyzeWaitStage(0)).toBe("normal");
    expect(getAnalyzeWaitStage(8_500)).toBe("deeper_read");
    expect(getAnalyzeWaitStage(22_000)).toBe("slow_generation");
    expect(getAnalyzeWaitStage(45_000)).toBe("slow_retry_hint");
    expect(getAnalyzeLoadingMessage(0)).toBe("讀著你貼上的對話⋯");
    expect(getAnalyzeLoadingMessage(10_000)).toBe(
      "訊號比較細，我們還在整理節奏與回應落差⋯",
    );
    expect(getAnalyzeLoadingMessage(25_000)).toBe(
      "這次讀得比較久，請再等一下；結果還在生成中。",
    );
    expect(getAnalyzeLoadingMessage(45_000)).toBe(
      "這次真的有點慢。你可以繼續等，或稍後重新試一次。",
    );
    expect(getAnalyzeLoadingSubtitle(45_000)).toContain("不會被寫進事件紀錄");
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
    expect(appTokens).toContain("--anyu-mark-min");
    expect(appTokens).toContain("--anyu-mark-favicon");
    expect(appTokens).toContain("--anyu-mark-loading");
    expect(appTokens).toContain("--anyu-mark-loading-size");
    expect(appTokens).toContain("--anyu-mark-cycle");
    expect(appTokens).toContain("--anyu-mark-stagger");
    expect(appTokens).toContain('--anyu-font-latin: "Instrument Serif", "Noto Serif TC", serif;');
    expect(appTokens).not.toContain("Cormorant Garamond");
    expect(appTokens).toBe(canonicalTokens);
  });

  it("loads Instrument Serif in the app layout without widening into later font phases", () => {
    const layoutSource = readFileSync(resolve(process.cwd(), "src/app/layout.tsx"), "utf8");

    expect(layoutSource).toContain("fonts.googleapis.com");
    expect(layoutSource).toContain("Instrument+Serif:ital@0;1");
    expect(layoutSource).not.toContain("Newsreader");
    expect(layoutSource).not.toContain("LXGW WenKai");
    expect(layoutSource).not.toContain("Cormorant");
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

  it("reads the public line add url safely from env-like input", () => {
    expect(LINE_ADD_URL_CONFIG_KEY).toBe("NEXT_PUBLIC_LINE_ADD_URL");
    expect(getLineAddUrl("https://lin.ee/S6dnbJO")).toBe("https://lin.ee/S6dnbJO");
    expect(getLineAddUrl("   ")).toBeNull();
    expect(getLineAddUrl(undefined)).toBeNull();
  });

  it("keeps the line-first contact copy explicit and the email fallback secondary", () => {
    expect(LINE_PRIMARY_PANEL_TITLE).toBe("加入 LINE，收到完整分析開放通知");
    expect(LINE_PRIMARY_BODY).toContain("完整分析與新測驗開放");
    expect(LINE_PRIMARY_CTA).toBe("加入 LINE，收到開放通知");
    expect(EMAIL_FALLBACK_LABEL).toBe("改用 Email 接收通知");
    expect(EMAIL_FALLBACK_BODY).toContain("不寄日常電子報");
    expect(MISSING_LINE_URL_MESSAGE).toBe(
      "LINE 連結暫時還沒準備好，請先改用 Email 接收通知。",
    );
  });
});
