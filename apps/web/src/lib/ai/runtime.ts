import { buildProductPrompt } from "@/lib/ai/prompt";
import {
  ProviderConfigError,
  callAiProvider,
  getActiveProviderInfo,
} from "@/lib/ai/provider";
import type { ProductResult } from "@/lib/ai/product-result-schema";
import { validateProductResultText } from "@/lib/ai/validate-product-result";
import type {
  ModelStrategyName,
  RuntimeModelMetadata,
} from "@/lib/ai/types";
import {
  buildUserContextPromptNotes,
  type AiTemperatureUserContext,
} from "@/lib/modules/ai-temperature-context";
import { PaidResultSemanticValidationError } from "@/lib/ai/paid-result-semantic-validation";
import type { ProductModuleConfig } from "@/lib/modules/types";
import { scoreToBucket } from "@/lib/modules/ai-temperature-ui";
import type { TimingPhaseName } from "@/lib/runtime/timing";

export type GeneratedProductRuntime = {
  result: ProductResult;
  provider: string;
  providerModel: string;
  providerRawJson?: unknown;
  redactedText: string;
  privacyFlags: string[];
  scoreBucket: string;
  runtimeModel: RuntimeModelMetadata;
};

type RuntimeTimingHooks = {
  mark?: (phase: TimingPhaseName) => void;
};

type RuntimeStrategyConfig = {
  strategy: ModelStrategyName;
  provider: "anthropic" | "openai";
  primaryModel: string;
  retryOnInvalid: boolean;
  fallbackModel: string | null;
};

type ValidatedProviderResult = {
  result: ProductResult;
  provider: string;
  model: string;
  rawResponse?: unknown;
};

function buildPromptMetadata(
  input: {
    moduleConfig: ProductModuleConfig;
    redactedText: string;
    situation: string;
    userContext: AiTemperatureUserContext;
  },
  provider: string,
  model: string,
) {
  return {
    situation_type: input.situation,
    input_length: input.redactedText.length,
    generated_at: new Date().toISOString(),
    experiment_id: input.moduleConfig.experimentId,
    variant: "B",
    model_provider: provider,
    model_name: model,
    user_context: input.userContext,
    user_context_notes: buildUserContextPromptNotes(input.userContext),
  } as const;
}

export function isOutputValidationError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    (error instanceof PaidResultSemanticValidationError ||
      error.message.startsWith("Model output was not valid JSON:") ||
      error.message.includes(" is invalid"))
  );
}

export function resolveRuntimeStrategy(
  providerInfo: { provider: "anthropic" | "openai"; model: string } = getActiveProviderInfo(),
  env: NodeJS.ProcessEnv = process.env,
): RuntimeStrategyConfig {
  const requestedStrategy: ModelStrategyName =
    env.MODEL_STRATEGY === "haiku_retry_sonnet_fallback"
      ? "haiku_retry_sonnet_fallback"
      : "sonnet_default";

  if (requestedStrategy !== "haiku_retry_sonnet_fallback") {
    return {
      strategy: "sonnet_default",
      provider: providerInfo.provider,
      primaryModel: providerInfo.model,
      retryOnInvalid: true,
      fallbackModel: null,
    };
  }

  if (providerInfo.provider !== "anthropic") {
    return {
      strategy: "sonnet_default",
      provider: providerInfo.provider,
      primaryModel: providerInfo.model,
      retryOnInvalid: true,
      fallbackModel: null,
    };
  }

  const primaryModel = env.ANTHROPIC_FAST_MODEL?.trim();
  const fallbackModel = env.ANTHROPIC_FALLBACK_MODEL?.trim();

  if (!primaryModel || !fallbackModel) {
    throw new ProviderConfigError(
      "Guarded Haiku staging strategy requires ANTHROPIC_FAST_MODEL and ANTHROPIC_FALLBACK_MODEL.",
    );
  }

  return {
    strategy: "haiku_retry_sonnet_fallback",
    provider: "anthropic",
    primaryModel,
    retryOnInvalid: true,
    fallbackModel,
  };
}

async function runValidatedAttempt(input: {
  moduleConfig: ProductModuleConfig;
  redactedText: string;
  situation: string;
  userContext: AiTemperatureUserContext;
  provider: "anthropic" | "openai";
  model: string;
}): Promise<ValidatedProviderResult> {
  const providerResult = await callAiProvider(
    await buildProductPrompt(
      input.redactedText,
      buildPromptMetadata(input, input.provider, input.model),
      input.moduleConfig.promptVersion,
    ),
    { model: input.model },
  );

  return {
    result: validateProductResultText(providerResult.text, input.moduleConfig.schemaVersion),
    provider: providerResult.provider,
    model: providerResult.model,
    rawResponse: providerResult.rawResponse,
  };
}

export async function generateModuleResult(input: {
  moduleConfig: ProductModuleConfig;
  redactedText: string;
  privacyFlags: string[];
  situation: string;
  userContext: AiTemperatureUserContext;
}, timing: RuntimeTimingHooks = {}): Promise<GeneratedProductRuntime> {
  const providerInfo = getActiveProviderInfo();
  const strategy = resolveRuntimeStrategy(providerInfo);
  let finalAttempt: ValidatedProviderResult | null = null;
  let retryCount = 0;
  let fallbackUsed = false;

  timing.mark?.("provider_started");
  try {
    finalAttempt = await runValidatedAttempt({
      moduleConfig: input.moduleConfig,
      redactedText: input.redactedText,
      situation: input.situation,
      userContext: input.userContext,
      provider: strategy.provider,
      model: strategy.primaryModel,
    });
  } catch (error) {
    if (!isOutputValidationError(error)) {
      throw error;
    }

    if (!strategy.retryOnInvalid) {
      throw error;
    }

    retryCount = 1;

    try {
      finalAttempt = await runValidatedAttempt({
        moduleConfig: input.moduleConfig,
        redactedText: input.redactedText,
        situation: input.situation,
        userContext: input.userContext,
        provider: strategy.provider,
        model: strategy.primaryModel,
      });
    } catch (retryError) {
      if (!isOutputValidationError(retryError) || !strategy.fallbackModel) {
        throw retryError;
      }

      fallbackUsed = true;
      finalAttempt = await runValidatedAttempt({
        moduleConfig: input.moduleConfig,
        redactedText: input.redactedText,
        situation: input.situation,
        userContext: input.userContext,
        provider: strategy.provider,
        model: strategy.fallbackModel,
      });
    }
  }

  timing.mark?.("provider_completed");
  timing.mark?.("schema_validated");

  if (!finalAttempt) {
    throw new Error("No valid provider attempt completed.");
  }

  return {
    result: finalAttempt.result,
    provider: finalAttempt.provider,
    providerModel: finalAttempt.model,
    providerRawJson: finalAttempt.rawResponse,
    redactedText: input.redactedText,
    privacyFlags: input.privacyFlags,
    scoreBucket: scoreToBucket(finalAttempt.result.free_result.temperature_score),
    runtimeModel: {
      modelStrategy: strategy.strategy,
      primaryModel: strategy.primaryModel,
      finalModel: finalAttempt.model,
      retryCount,
      fallbackUsed,
      schemaValidationPassed: true,
    },
  };
}
