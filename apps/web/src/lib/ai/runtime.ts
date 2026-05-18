import { buildProductPrompt } from "@/lib/ai/prompt";
import { callAiProvider, getActiveProviderInfo } from "@/lib/ai/provider";
import type { ProductResult } from "@/lib/ai/product-result-schema";
import { validateProductResultText } from "@/lib/ai/validate-product-result";
import type { ProductModuleConfig } from "@/lib/modules/types";
import { scoreToBucket } from "@/lib/modules/ai-temperature-ui";
import { redactUserInput } from "@/lib/privacy/pii";

export type GeneratedProductRuntime = {
  result: ProductResult;
  provider: string;
  providerModel: string;
  providerRawJson?: unknown;
  redactedText: string;
  privacyFlags: string[];
  scoreBucket: string;
};

export async function generateModuleResult(input: {
  moduleConfig: ProductModuleConfig;
  text: string;
  situation: string;
}): Promise<GeneratedProductRuntime> {
  const { redactedText, flags } = redactUserInput(input.text);
  const providerInfo = getActiveProviderInfo();
  const providerResult = await callAiProvider(
    await buildProductPrompt(redactedText, {
      situation_type: input.situation,
      input_length: redactedText.length,
      generated_at: new Date().toISOString(),
      experiment_id: input.moduleConfig.experimentId,
      variant: "B",
      model_provider: providerInfo.provider,
      model_name: providerInfo.model,
    }),
  );

  const result = validateProductResultText(providerResult.text);

  return {
    result,
    provider: providerResult.provider,
    providerModel: providerResult.model,
    providerRawJson: providerResult.rawResponse,
    redactedText,
    privacyFlags: flags,
    scoreBucket: scoreToBucket(result.free_result.temperature_score),
  };
}
