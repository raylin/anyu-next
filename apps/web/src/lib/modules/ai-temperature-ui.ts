import type { ProductResult } from "@/lib/ai/product-result-schema";
import { aiTemperatureDemoProductResult } from "@/lib/modules/demo-result";
import {
  normalizeUserContext,
  type AiTemperatureUserContext,
} from "@/lib/modules/ai-temperature-context";
import type { ProductModuleConfig } from "@/lib/modules/types";

export const MIN_ANALYZE_LENGTH = 30;
export const SOFT_MAX_ANALYZE_LENGTH = 2000;
export const MAX_ANALYZE_LENGTH = 4000;
export const ANONYMOUS_SESSION_STORAGE_KEY = "anyu-ambiguous-temperature-session-id";
export const ANALYZE_RECOVERY_STORAGE_KEY = "anyu-analyze-recovery-state";
export const ANALYZE_REQUEST_TIMEOUT_MS = 95_000;
export const ANALYZE_POLL_INTERVAL_MS = 2_000;
export const ANALYZE_POLL_TIMEOUT_MS = 10 * 60_000;
export const LINE_ADD_URL_CONFIG_KEY = "NEXT_PUBLIC_LINE_ADD_URL";
export const LINE_PRIMARY_PANEL_TITLE = "用 LINE 領取完整分析";
export const LINE_PRIMARY_BODY =
  "目前內測中，這次不會真的收費。加入 LINE 後，我們會把完整分析連結送給你。";
export const LINE_PRIMARY_CTA = "用 LINE 領取完整分析";
export const EMAIL_FALLBACK_LABEL = "改用 Email 接收通知";
export const EMAIL_FALLBACK_BODY =
  "留下 Email，我們會在完整分析或新測驗開放時通知你。不寄日常電子報，也不分享給第三方。";
export const MISSING_LINE_URL_MESSAGE = "LINE 連結暫時還沒準備好，請先改用 Email 接收通知。";
export const LINE_FULFILLMENT_FALLBACK_INTRO =
  "如果沒有自動帶入，請把這組短碼貼給暗語 ANYU：";

export type ScoreBucket = "cold" | "cool" | "warm" | "hot" | "unknown";
export type AnalyzeWaitStage =
  | "normal"
  | "deeper_read"
  | "slow_generation"
  | "slow_retry_hint";

export type AnalyzeInputGuidanceState =
  | "too_short"
  | "can_analyze"
  | "ideal"
  | "long"
  | "too_long";

export type AnalyzeInputGuidance = {
  state: AnalyzeInputGuidanceState;
  label: string;
  detail: string;
  counterText?: string;
};

export type ObservedSignalViewModel = {
  label: string;
  value: number;
  note: string;
};

export type AiTemperatureResultViewModel = {
  score: number;
  stateLabel: string;
  oneSentenceRead: string;
  observedSignals: ObservedSignalViewModel[];
  insightTitle: string;
  insight: string;
  reassurance: string;
  persona: string;
  shareQuote: string;
  paidHeadline: string;
  paidPrice: string;
  paidIncludedSections: string[];
  paidPreviewCopy: string;
};

export type AnalyzeInputValidationResult =
  | {
      ok: true;
      text: string;
      situation: string;
      anonymousSessionId: string | null;
      userContext: AiTemperatureUserContext;
      userContextProvided: boolean;
      userContextFieldCount: number;
      inputCharCount: number;
    }
  | {
      ok: false;
      error: string;
      message: string;
    };

const OBSERVED_SIGNAL_LABELS = ["主動度", "即時性", "情緒投入"] as const;
const OBSERVED_SIGNAL_OFFSETS = [-10, 3, -4] as const;

export function isAnalyzeInputReady(input: string): boolean {
  return input.trim().length >= MIN_ANALYZE_LENGTH;
}

export function getAnalyzeButtonLabel(input: string): string {
  const guidance = getAnalyzeInputGuidance(input);

  if (guidance.state === "too_long") {
    return "內容太長了";
  }

  return isAnalyzeInputReady(input) ? "分析我的曖昧溫度" : "再寫一點…";
}

export function getAnalyzeInputGuidance(input: string): AnalyzeInputGuidance {
  const trimmedLength = input.trim().length;

  if (trimmedLength > MAX_ANALYZE_LENGTH) {
    return {
      state: "too_long",
      label: "內容太長了",
      detail: "請刪到 4000 字以內，再送出分析。",
      counterText: `${trimmedLength} / ${MAX_ANALYZE_LENGTH}`,
    };
  }

  if (trimmedLength > SOFT_MAX_ANALYZE_LENGTH) {
    return {
      state: "long",
      label: "內容有點長",
      detail: "建議保留最近幾段關鍵對話就好。",
    };
  }

  if (trimmedLength >= 120) {
    return {
      state: "ideal",
      label: "內容剛剛好",
      detail: "這段互動已經足夠讀出節奏。",
    };
  }

  if (trimmedLength >= MIN_ANALYZE_LENGTH) {
    return {
      state: "can_analyze",
      label: "可以分析了",
      detail: "如果再多一點前後文，結果會更細。",
    };
  }

  return {
    state: "too_short",
    label: "還差一點點",
    detail: "多給一點互動脈絡，ANYU 才讀得出節奏。",
    counterText: `${trimmedLength} / ${MIN_ANALYZE_LENGTH}`,
  };
}

export function getAnalyzeInputHint(input: string): string {
  return getAnalyzeInputGuidance(input).detail;
}

export function getAnalyzeErrorMessage(error: string): string {
  switch (error) {
    case "input_too_short":
      return "再寫一點互動脈絡，ANYU 才讀得出節奏。";
    case "input_too_long":
      return "這段太長了，請保留最近幾段關鍵對話再試一次。";
    case "unsupported_content":
      return "這段看起來不像曖昧或關係互動情境。請貼最近的對話，或用自己的話描述你卡住的互動。";
    case "prompt_injection_detected":
      return "這段裡有一些和關係分析無關的指令。請移除後再試一次。";
    case "rate_limited_session":
      return "今天已經分析過幾次了，請明天再來看看。";
    case "rate_limited_ip":
      return "這個裝置或網路剛剛送出太多次，請稍後再試。";
    case "daily_cap_reached":
      return "今天的體驗名額已滿，請明天再試。";
    case "validation_error":
      return "送出的內容格式不正確，請重新整理後再試。";
    case "config_error":
      return "目前分析服務尚未設定完成，請稍後再試。";
    case "provider_error":
    case "request_timeout":
      return "這次分析等得比較久，請稍後再試一次。";
    default:
      return "分析暫時失敗，請晚點再試一次。";
  }
}

export function getAnalyzeWaitStage(elapsedMs: number): AnalyzeWaitStage {
  if (elapsedMs >= 40_000) {
    return "slow_retry_hint";
  }

  if (elapsedMs >= 20_000) {
    return "slow_generation";
  }

  if (elapsedMs >= 8_000) {
    return "deeper_read";
  }

  return "normal";
}

export function getAnalyzeLoadingMessage(elapsedMs: number): string {
  switch (getAnalyzeWaitStage(elapsedMs)) {
    case "deeper_read":
      return "訊號比較細，我們還在整理節奏與回應落差⋯";
    case "slow_generation":
      return "這次讀得比較久，請再等一下；結果還在生成中。";
    case "slow_retry_hint":
      return "這次真的有點慢。你可以繼續等，或稍後重新試一次。";
    case "normal":
    default:
      return "讀著你貼上的對話⋯";
  }
}

export function getAnalyzeLoadingSubtitle(elapsedMs: number): string {
  switch (getAnalyzeWaitStage(elapsedMs)) {
    case "deeper_read":
      return "我們還在比對回應節奏、主動度和那些不太明說的小訊號。";
    case "slow_generation":
      return "不是當掉，只是這次需要多看一眼那些容易忽略的細節。";
    case "slow_retry_hint":
      return "如果不想繼續等，也可以稍後重試；你剛剛貼的內容不會被寫進事件紀錄。";
    case "normal":
    default:
      return "我們在比對節奏、回應時差與情緒投入的細節。";
  }
}

export function getModuleLabel(moduleConfig: ProductModuleConfig): string {
  void moduleConfig;
  return "MODULE · 01";
}

export function getModuleMetadataTitle(moduleConfig: ProductModuleConfig): string {
  return `${moduleConfig.title}｜${moduleConfig.brand}`;
}

export function getModuleMetadataDescription(moduleConfig: ProductModuleConfig): string {
  return `${moduleConfig.subtitle}貼上一段互動，讓暗語幫你讀出曖昧裡的微訊號。`;
}

export function getLineAddUrl(envValue = process.env.NEXT_PUBLIC_LINE_ADD_URL): string | null {
  const candidate = envValue?.trim();

  return candidate ? candidate : null;
}

export function scoreToBucket(score: number): ScoreBucket {
  if (!Number.isFinite(score)) {
    return "unknown";
  }

  if (score <= 25) {
    return "cold";
  }

  if (score <= 50) {
    return "cool";
  }

  if (score <= 75) {
    return "warm";
  }

  return "hot";
}

export function normalizeSituationType(
  value: string | undefined,
  allowedChips: readonly string[],
): string {
  const candidate = value?.trim();

  if (candidate && allowedChips.includes(candidate)) {
    return candidate;
  }

  return allowedChips[allowedChips.length - 1] ?? "不確定 / 跳過";
}

export function validateAnalyzeInput(input: {
  text?: string;
  situation?: string;
  anonymousSessionId?: string;
  userContext?: unknown;
  allowedChips: readonly string[];
}): AnalyzeInputValidationResult {
  const text = input.text?.trim() ?? "";
  const normalizedContext = normalizeUserContext(input.userContext);

  if ("ok" in normalizedContext && normalizedContext.ok === false) {
    return {
      ok: false,
      error: "validation_error",
      message: "送出的內容格式不正確，請重新整理後再試。",
    };
  }

  if (text.length < MIN_ANALYZE_LENGTH) {
      return {
      ok: false,
      error: "input_too_short",
      message: "再寫一點互動脈絡，ANYU 才讀得出節奏。",
    };
  }

  if (text.length > MAX_ANALYZE_LENGTH) {
      return {
      ok: false,
      error: "input_too_long",
      message: "這段太長了，請保留最近幾段關鍵對話再試一次。",
    };
  }

  return {
    ok: true,
    text,
    situation: normalizeSituationType(input.situation, input.allowedChips),
    anonymousSessionId: input.anonymousSessionId?.trim() || null,
    userContext: normalizedContext.context,
    userContextProvided: normalizedContext.provided,
    userContextFieldCount: normalizedContext.fieldCount,
    inputCharCount: text.length,
  };
}

export function getClientAnonymousSessionId(): string {
  if (typeof window === "undefined") {
    throw new Error("Anonymous session ID can only be accessed in the browser.");
  }

  const existingValue = window.localStorage.getItem(ANONYMOUS_SESSION_STORAGE_KEY);

  if (existingValue) {
    return existingValue;
  }

  const createdValue =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(ANONYMOUS_SESSION_STORAGE_KEY, createdValue);
  return createdValue;
}

function clampSignalValue(score: number, offset: number): number {
  return Math.max(10, Math.min(95, score + offset));
}

export function mapProductResultToViewModel(
  result: ProductResult,
): AiTemperatureResultViewModel {
  const score = result.free_result.temperature_score;

  return {
    score,
    stateLabel: result.free_result.state_label,
    oneSentenceRead: result.free_result.one_sentence_read,
    observedSignals: result.free_result.observed_signals.map((signal, index) => ({
      label: OBSERVED_SIGNAL_LABELS[index] ?? `訊號 ${index + 1}`,
      value: clampSignalValue(score, OBSERVED_SIGNAL_OFFSETS[index] ?? 0),
      note: signal,
    })),
    insightTitle: result.insight_layer.title,
    insight: result.insight_layer.explanation,
    reassurance:
      result.paid_result?.softInsight ||
      result.paid_result?.avoidDoing[0] ||
      result.free_result.uncertainty_note,
    persona: result.share_card.relationship_persona,
    shareQuote: result.share_card.card_sentence,
    paidHeadline: result.paid_preview.headline,
    paidPrice: result.paid_preview.price,
    paidIncludedSections: result.paid_preview.included_sections,
    paidPreviewCopy: result.paid_preview.preview_copy,
  };
}

export function getAiTemperatureDemoResult(): AiTemperatureResultViewModel {
  return mapProductResultToViewModel(aiTemperatureDemoProductResult);
}

export function buildShareText(
  result: AiTemperatureResultViewModel,
  moduleConfig: ProductModuleConfig,
  appUrl: string,
): string {
  return [
    `我剛測了${moduleConfig.family}：${result.score}/100｜${result.stateLabel}`,
    result.shareQuote || result.oneSentenceRead,
    "— 暗語 ANYU",
    `${appUrl.replace(/\/$/, "")}/m/${moduleConfig.slug}`,
  ].join("\n");
}
