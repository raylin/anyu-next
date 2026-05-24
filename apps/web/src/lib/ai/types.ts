import type { ProductResult } from "@/lib/ai/product-result-schema";
import type { AiTemperatureUserContext } from "@/lib/modules/ai-temperature-context";

export type AnalyzeRequestPayload = {
  text: string;
  situation?: string;
  anonymousSessionId?: string;
  userContext?: AiTemperatureUserContext;
};

export type AnalyzeSuccessResponse = {
  ok: true;
  status: "completed";
  requestId?: string;
  resultId: string;
  redirectTo: string;
  cacheHit?: boolean;
};

export type AnalyzeProcessingResponse = {
  ok: true;
  status: "processing";
  requestId: string;
  pollUrl: string;
  cacheHit?: false;
};

export type ApiErrorResponse = {
  ok: false;
  error: string;
  message: string;
};

export type AnalyzeRequestStatusResponse =
  | {
      ok: true;
      status: "processing";
      phase: string;
      elapsedMs: number;
      retryable: boolean;
    }
  | {
      ok: true;
      status: "completed";
      resultId: string;
      redirectTo: string;
      elapsedMs: number;
      retryable: false;
    }
  | {
      ok: true;
      status: "failed" | "expired";
      errorCode: string;
      errorCategory: string;
      message: string;
      elapsedMs: number;
      retryable: boolean;
    };

export type AnalyzeResponse =
  | AnalyzeSuccessResponse
  | AnalyzeProcessingResponse
  | ApiErrorResponse;

export type ProviderCallResult = {
  text: string;
  provider: "anthropic" | "openai";
  model: string;
  rawResponse?: unknown;
};

export type ModelStrategyName =
  | "sonnet_default"
  | "haiku_retry_sonnet_fallback";

export type RuntimeModelMetadata = {
  modelStrategy: ModelStrategyName;
  primaryModel: string;
  finalModel: string;
  retryCount: number;
  fallbackUsed: boolean;
  schemaValidationPassed: boolean;
};

export type PromptMetadata = {
  situation_type: string;
  input_length: number;
  generated_at: string;
  experiment_id: string;
  variant: string;
  model_provider: string;
  model_name: string;
  user_context: AiTemperatureUserContext;
  user_context_notes: Record<string, string>;
};

export type StoredAnalysisResult = {
  id: string;
  normalizedResult: ProductResult;
  score: number | null;
  stateLabel: string | null;
};
