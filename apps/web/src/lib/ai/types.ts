import type { ProductResult } from "@/lib/ai/product-result-schema";

export type AnalyzeRequestPayload = {
  text: string;
  situation?: string;
  anonymousSessionId?: string;
};

export type AnalyzeSuccessResponse = {
  ok: true;
  resultId: string;
  redirectTo: string;
};

export type ApiErrorResponse = {
  ok: false;
  error: string;
  message: string;
};

export type AnalyzeResponse = AnalyzeSuccessResponse | ApiErrorResponse;

export type ProviderCallResult = {
  text: string;
  provider: "anthropic" | "openai";
  model: string;
  rawResponse?: unknown;
};

export type PromptMetadata = {
  situation_type: string;
  input_length: number;
  generated_at: string;
  experiment_id: string;
  variant: string;
  model_provider: string;
  model_name: string;
};

export type StoredAnalysisResult = {
  id: string;
  normalizedResult: ProductResult;
  score: number | null;
  stateLabel: string | null;
};
