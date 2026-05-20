import { buildProductPrompt } from "@/lib/ai/prompt";
import { callAiProvider, getActiveProviderInfo } from "@/lib/ai/provider";
import type { ProductResult } from "@/lib/ai/product-result-schema";
import { validateProductResultText } from "@/lib/ai/validate-product-result";
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
};

type RuntimeTimingHooks = {
  mark?: (phase: TimingPhaseName) => void;
};

export async function generateModuleResult(input: {
  moduleConfig: ProductModuleConfig;
  redactedText: string;
  privacyFlags: string[];
  situation: string;
}, timing: RuntimeTimingHooks = {}): Promise<GeneratedProductRuntime> {
  const providerInfo = getActiveProviderInfo();

  timing.mark?.("provider_started");
  const providerResult = await callAiProvider(
    await buildProductPrompt(input.redactedText, {
      situation_type: input.situation,
      input_length: input.redactedText.length,
      generated_at: new Date().toISOString(),
      experiment_id: input.moduleConfig.experimentId,
      variant: "B",
      model_provider: providerInfo.provider,
      model_name: providerInfo.model,
    }),
  );
  timing.mark?.("provider_completed");

  const result = validateProductResultText(providerResult.text);
  timing.mark?.("schema_validated");

  return {
    result,
    provider: providerResult.provider,
    providerModel: providerResult.model,
    providerRawJson: providerResult.rawResponse,
    redactedText: input.redactedText,
    privacyFlags: input.privacyFlags,
    scoreBucket: scoreToBucket(result.free_result.temperature_score),
  };
}
