import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { aiTemperatureModule } from "@/content/modules/ai-temperature";
import { AI_TEMPERATURE_CONTEXT_GROUPS } from "@/lib/modules/ai-temperature-context";
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
  RECOMMENDED_ANALYZE_LENGTH,
  RICH_ANALYZE_LENGTH,
  SOFT_MAX_ANALYZE_LENGTH,
  buildShareText,
  formatPaidLikelihoodLabel,
  getLineAddUrl,
  getAnalyzeErrorMessage,
  getAnalyzeButtonLabel,
  getAnalyzeInputGuidance,
  getAnalyzeInputHint,
  getAnalyzeLoadingMessage,
  getAnalyzeLoadingSubtitle,
  getAnalyzeWaitStage,
  getModuleMetadataDescription,
  getModuleMetadataTitle,
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
      label: "太少了",
      detail: "再補一點互動細節，暗語才不會只靠猜。",
      counterText: `3 / ${MIN_ANALYZE_LENGTH}`,
    });
  });

  it("enables the CTA once input reaches the minimum length", () => {
    const longEnough =
      "我們上週末見面時聊得很自然，他也說下次可以再約。但這幾天訊息變慢，常常隔半天才回，雖然還是會看我的限動、偶爾傳生活小事。我不知道他是真的忙，還是其實已經沒那麼想靠近了。";

    expect(longEnough.trim().length).toBeGreaterThanOrEqual(MIN_ANALYZE_LENGTH);
    expect(isAnalyzeInputReady(longEnough)).toBe(true);
    expect(getAnalyzeButtonLabel(longEnough)).toBe("分析我的曖昧溫度");
    expect(getAnalyzeInputGuidance(longEnough)).toMatchObject({
      state: "can_analyze" satisfies AnalyzeInputGuidanceState,
      label: "可以分析",
      detail: "已經可以分析；如果再補一點時間線或對方反應，結果會更穩。",
    });
  });

  it("maps context quality bands into guidance states", () => {
    expect(getAnalyzeInputGuidance("a".repeat(45))).toMatchObject({
      state: "almost_ready" satisfies AnalyzeInputGuidanceState,
      label: "還差一點",
      detail: "多寫一點對方怎麼回、多久回、最近有沒有變化。",
    });
    expect(getAnalyzeInputGuidance("a".repeat(RECOMMENDED_ANALYZE_LENGTH))).toMatchObject({
      state: "ideal" satisfies AnalyzeInputGuidanceState,
      label: "更貼近了",
      detail: "內容夠完整，能看出互動節奏與關係溫度。",
    });
    expect(getAnalyzeInputGuidance("a".repeat(RICH_ANALYZE_LENGTH))).toMatchObject({
      state: "rich" satisfies AnalyzeInputGuidanceState,
      label: "細節很夠",
      detail: "很好，這樣完整分析比較能寫出具體下一步。",
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
    expect(getAnalyzeInputHint("a".repeat(RECOMMENDED_ANALYZE_LENGTH))).toBe(
      "內容夠完整，能看出互動節奏與關係溫度。",
    );
    expect(getAnalyzeInputHint("a".repeat(SOFT_MAX_ANALYZE_LENGTH + 1))).toBe(
      "建議保留最近幾段關鍵對話就好。",
    );
  });

  it("keeps the guidance copy soft and avoids remaining-count pressure", () => {
    const states = [
      getAnalyzeInputGuidance("太短了"),
      getAnalyzeInputGuidance("a".repeat(MIN_ANALYZE_LENGTH)),
      getAnalyzeInputGuidance("a".repeat(RECOMMENDED_ANALYZE_LENGTH)),
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

    expect(shortGuidance.counterText).toBe(`3 / ${MIN_ANALYZE_LENGTH}`);
    expect(shortGuidance.label).toBe("太少了");
    expect(shortGuidance.detail).not.toMatch(/再補\s*\d+\s*個字/);
  });

  it("sets a richer textarea placeholder that models enough context", () => {
    const source = readFileSync(resolve(process.cwd(), "src/components/anyu/InputCard.tsx"), "utf8");

    expect(source).toContain("我們上週末見面聊得很好");
    expect(source).toContain("這幾天回訊變慢");
    expect(source).toContain("我不知道他是真的忙，還是熱度在變低");
    expect(source).not.toContain("我昨天約他週末見面，他已讀後沒回，但晚上還在發限動。");
  });

  it("keeps paid waiting UX explicit and polling-based", () => {
    const component = readFileSync(
      resolve(process.cwd(), "src/components/modules/ai-temperature/PaidResultPendingPoller.tsx"),
      "utf8",
    );
    const globals = readFileSync(resolve(process.cwd(), "src/styles/globals.css"), "utf8");

    expect(component).toContain("正在整理你的完整分析");
    expect(component).toContain("通常需要 30–60 秒");
    expect(component).toContain("讀取你的互動線索");
    expect(component).toContain("完成 48 小時觀察策略");
    expect(component).toContain("paid-result/status");
    expect(component).toContain("router.refresh()");
    expect(globals).toContain(".anyu-paid-wait-bar");
    expect(globals).toContain("@keyframes anyuPaidWaitSlide");
  });

  it("renders the expected module label and chip inventory", () => {
    expect(getModuleLabel(aiTemperatureModule)).toBe("MODULE · 01");
    expect(aiTemperatureModule.title).toBe("曖昧溫度計");
    expect(aiTemperatureModule.subtitle).toBe("他是真的忙，還是其實在冷掉？");
    expect(aiTemperatureModule.description).toBeUndefined();
    expect(aiTemperatureModule.chips).toEqual([
      "已讀不回",
      "忽冷忽熱",
      "回訊變慢但看限動",
      "不確定 / 跳過",
    ]);
  });

  it("builds module metadata from the title-first hierarchy", () => {
    expect(getModuleMetadataTitle(aiTemperatureModule)).toBe("曖昧溫度計｜暗語 ANYU");
    expect(getModuleMetadataDescription(aiTemperatureModule)).toBe(
      "他是真的忙，還是其實在冷掉？貼上一段互動，讓暗語幫你讀出曖昧裡的微訊號。",
    );
  });

  it("normalizes analyze input against the allowed chips", () => {
    const result = validateAnalyzeInput({
      text: "我們上週末見面時聊得很自然，他也說下次可以再約。但這幾天訊息變慢，常常隔半天才回，雖然還是會看我的限動、偶爾傳生活小事。我不知道他是真的忙，還是其實已經沒那麼想靠近了。",
      situation: "已讀不回",
      anonymousSessionId: "session-123",
      allowedChips: aiTemperatureModule.chips,
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.situation).toBe("已讀不回");
      expect(result.anonymousSessionId).toBe("session-123");
      expect(result.userContextProvided).toBe(false);
      expect(result.userContextFieldCount).toBe(0);
    }
  });

  it("validates optional context chips and rejects unknown context values", () => {
    const result = validateAnalyzeInput({
      text: "我們上週末見面時聊得很自然，他也說下次可以再約。但這幾天訊息變慢，常常隔半天才回，雖然還是會看我的限動、偶爾傳生活小事。我不知道他是真的忙，還是其實已經沒那麼想靠近了。",
      situation: "已讀不回",
      userContext: {
        userGoal: "我該怎麼回",
        primaryPain: "回覆變慢",
        replyTone: "有界線但不冷",
      },
      allowedChips: aiTemperatureModule.chips,
    });
    const unknown = validateAnalyzeInput({
      text: "我們上週末見面時聊得很自然，他也說下次可以再約。但這幾天訊息變慢，常常隔半天才回，雖然還是會看我的限動、偶爾傳生活小事。我不知道他是真的忙，還是其實已經沒那麼想靠近了。",
      userContext: {
        userGoal: "請直接替我操控對方",
      },
      allowedChips: aiTemperatureModule.chips,
    });

    expect(AI_TEMPERATURE_CONTEXT_GROUPS).toHaveLength(4);
    expect(AI_TEMPERATURE_CONTEXT_GROUPS.map((group) => group.label)).toContain(
      "你想回給對方的語氣 · 可選",
    );
    expect(
      AI_TEMPERATURE_CONTEXT_GROUPS.find((group) => group.key === "replyTone")?.options,
    ).toContain("坦白但不施壓");
    expect(result.ok).toBe(true);
    expect(unknown.ok).toBe(false);

    if (result.ok) {
      expect(result.userContext).toEqual({
        userGoal: "我該怎麼回",
        primaryPain: "回覆變慢",
        replyTone: "有界線但不冷",
      });
      expect(result.userContextProvided).toBe(true);
      expect(result.userContextFieldCount).toBe(3);
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
      "再補一點互動細節，暗語才不會只靠猜。",
    );
    expect(getAnalyzeErrorMessage("input_too_long")).toBe(
      "這段太長了，請保留最近幾段關鍵對話再試一次。",
    );
    expect(getAnalyzeErrorMessage("anything_else")).toBe(
      "分析暫時失敗，請晚點再試一次。",
    );
  });

  it("localizes paid likelihood labels for unlocked display", () => {
    expect(formatPaidLikelihoodLabel("high")).toBe("高");
    expect(formatPaidLikelihoodLabel("medium")).toBe("中");
    expect(formatPaidLikelihoodLabel("low")).toBe("低");
  });

  it("maps elapsed time into wait-state stages and copy", () => {
    expect(ANALYZE_REQUEST_TIMEOUT_MS).toBeGreaterThanOrEqual(90_000);
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
    expect(appTokens).toContain('--anyu-font-reading: "Newsreader", "Noto Serif TC", serif;');
    expect(appTokens).toContain('--anyu-font-kai: "LXGW WenKai", "Kaiti TC", "STKaiti", "Noto Serif TC", serif;');
    expect(appTokens).toContain('.t-kai { font: 400 17px/1.85 var(--anyu-font-kai);');
    expect(appTokens).toContain('.t-kai-quote { font: 400 17px/1.85 var(--anyu-font-kai);');
    expect(appTokens).toContain('.t-quote   { font: 400 var(--anyu-type-quote-size)/var(--anyu-type-quote-lh) var(--anyu-font-kai);');
    expect(appTokens).toContain('.t-reading { font: 400 16px/1.75 var(--anyu-font-reading);');
    expect(appTokens).toContain('.t-reading-lg { font: 400 18px/1.7 var(--anyu-font-reading);');
    expect(appTokens).toContain('.t-label-accent { color: var(--anyu-accent); }');
    expect(appTokens).toContain('.t-label-dim { color: var(--anyu-dim); }');
    expect(appTokens).toContain('.t-label-faint { color: var(--anyu-faint); }');
    expect(appTokens).not.toContain("Cormorant Garamond");
    expect(appTokens).toBe(canonicalTokens);
  });

  it("loads Instrument Serif, Newsreader, and LXGW WenKai in the app layout for the approved font phases", () => {
    const layoutSource = readFileSync(resolve(process.cwd(), "src/app/layout.tsx"), "utf8");

    expect(layoutSource).toContain("fonts.googleapis.com");
    expect(layoutSource).toContain("Instrument+Serif:ital@0;1");
    expect(layoutSource).toContain("family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400");
    expect(layoutSource).toContain("https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css");
    expect(layoutSource).not.toContain("Cormorant");
  });

  it("keeps the dual-theme fidelity fixes in shared and scoped CSS", () => {
    const globals = readFileSync(resolve(process.cwd(), "src/styles/globals.css"), "utf8");

    expect(globals).toContain(".anyu-share-preview {\n  width: 100%;\n  max-width: none;");
    expect(globals).toContain("display: grid;");
    expect(globals).toContain(".anyu-share-actions {\n  display: grid;\n  gap: 0.45rem;\n  margin-top: var(--anyu-space-3);");
    expect(globals).toContain(".anyu-share-shell {\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr) auto;");
    expect(globals).toContain("min-height: clamp(25rem, 72vw, 32rem);");
    expect(globals).toContain("background: var(--anyu-card);");
    expect(globals).toContain(".anyu-share-action {\n  width: 100%;\n}");
    expect(globals).toContain(".anyu-share-action-primary {\n  border-color: var(--anyu-ink-dark);");
    expect(globals).toContain(".anyu-reply-card-open .anyu-reply-tag {\n  color: var(--anyu-ink-onDark);");
    expect(globals).toContain(".anyu-reply-why span {\n  color: var(--anyu-accent2);");
    expect(globals).toContain(".anyu-v2 .anyu-signature-card {\n  position: relative;\n  background: var(--anyu-card);");
    expect(globals).toContain(".anyu-v2 .anyu-quote-card::before {\n  content: \"\";");
    expect(globals).toContain(".anyu-v2 .anyu-quote-card {\n  position: relative;\n  padding-left: calc(1.15rem + 0.7rem);");
    expect(globals).toContain("inset: 0 auto 0 0;\n  width: 0.45rem;\n  border-right: var(--anyu-border-base) solid var(--anyu-line);");
    expect(globals).not.toContain(".anyu-v2 .anyu-quote-card {\n  position: relative;\n  padding-right: calc(1.15rem + 0.7rem);");
    expect(globals).toContain("radial-gradient(ellipse 12rem 7rem at 12% 10%");
    expect(globals).not.toContain(".anyu-v2 .anyu-share-shell {\n  border: var(--anyu-border-heavy) solid var(--anyu-line);\n  border-radius: var(--anyu-radius-2xl);\n  background:\n    var(--anyu-grain),");
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

  it("keeps the line-first fulfillment copy explicit and the email fallback secondary", () => {
    expect(LINE_PRIMARY_PANEL_TITLE).toBe("用 LINE 領取完整分析");
    expect(LINE_PRIMARY_BODY).toContain("我們會把完整分析連結送給你");
    expect(LINE_PRIMARY_CTA).toBe("用 LINE 領取完整分析");
    expect(EMAIL_FALLBACK_LABEL).toBe("改用 Email 接收通知");
    expect(EMAIL_FALLBACK_BODY).toContain("不寄日常電子報");
    expect(MISSING_LINE_URL_MESSAGE).toBe(
      "LINE 連結暫時還沒準備好，請先改用 Email 接收通知。",
    );
  });
});
