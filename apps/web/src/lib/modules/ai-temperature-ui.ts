import type { ProductModuleConfig } from "@/lib/modules/types";

export const MIN_ANALYZE_LENGTH = 12;

export type DemoObservedSignal = {
  label: string;
  value: number;
  note: string;
};

export type DemoResult = {
  score: number;
  stateLabel: string;
  oneSentenceRead: string;
  observedSignals: DemoObservedSignal[];
  insight: string;
  reassurance: string;
  persona: string;
  shareQuote: string;
};

export function isAnalyzeInputReady(input: string): boolean {
  return input.trim().length >= MIN_ANALYZE_LENGTH;
}

export function getAnalyzeButtonLabel(input: string): string {
  return isAnalyzeInputReady(input) ? "分析我的曖昧溫度" : "先貼一段對話";
}

export function getModuleLabel(moduleConfig: ProductModuleConfig): string {
  return `module · 01 · ${moduleConfig.family}`;
}

export function getAiTemperatureDemoResult(): DemoResult {
  return {
    score: 42,
    stateLabel: "溫差期",
    oneSentenceRead: "你不是想太多，只是你太會看見細節。",
    observedSignals: [
      { label: "主動度", value: 32, note: "多半由你先開話題" },
      { label: "即時性", value: 45, note: "回覆節奏有明顯落差" },
      { label: "情緒投入", value: 38, note: "短句多，延伸提問偏少" },
    ],
    insight:
      "讓你卡住的不是他沒回訊息，而是他明明有在活動，卻暫時沒有接你的邀約。",
    reassurance:
      "現在最不該做的，不是追問答案，而是把壓力全部丟到自己身上。",
    persona: "微訊號觀察家",
    shareQuote: "有些曖昧不是沒訊號，是訊號太小聲。",
  };
}
