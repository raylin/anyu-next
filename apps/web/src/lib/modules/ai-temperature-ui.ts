import type { ProductResult } from "@/lib/ai/product-result-schema";
import { aiTemperatureDemoProductResult } from "@/lib/modules/demo-result";
import type { ProductModuleConfig } from "@/lib/modules/types";

export const MIN_ANALYZE_LENGTH = 30;
export const SOFT_MAX_ANALYZE_LENGTH = 2000;
export const MAX_ANALYZE_LENGTH = 4000;
export const ANONYMOUS_SESSION_STORAGE_KEY = "anyu-ambiguous-temperature-session-id";
export const ANALYZE_REQUEST_TIMEOUT_MS = 65_000;

export type ScoreBucket = "cold" | "cool" | "warm" | "hot" | "unknown";
export type AnalyzeWaitStage =
  | "normal"
  | "deeper_read"
  | "slow_generation"
  | "slow_retry_hint";

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
  return isAnalyzeInputReady(input) ? "分析我的曖昧溫度" : "先貼一段對話";
}

export function getAnalyzeInputHint(input: string): string {
  const trimmedLength = input.trim().length;

  if (trimmedLength > MAX_ANALYZE_LENGTH) {
    return "這段太長了，請保留最近幾段關鍵對話再試一次。";
  }

  if (trimmedLength > SOFT_MAX_ANALYZE_LENGTH) {
    return "內容有點長，建議保留最近幾段關鍵對話。";
  }

  if (trimmedLength > 0 && trimmedLength < MIN_ANALYZE_LENGTH) {
    return "再寫一點互動脈絡，ANYU 才讀得出節奏。";
  }

  return "免費 · 結果可截圖分享";
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
  return `module · 01 · ${moduleConfig.family}`;
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
  allowedChips: readonly string[];
}): AnalyzeInputValidationResult {
  const text = input.text?.trim() ?? "";

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
      result.paid_result.risk_warning ||
      result.paid_result.what_not_to_do[0] ||
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
