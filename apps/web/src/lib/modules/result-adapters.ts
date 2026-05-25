import type { ProductResult, RichPaidResult } from "@/lib/ai/product-result-schema";
import { isRichPaidResult } from "@/lib/ai/product-result-schema";

export type FreeProductResult = Omit<ProductResult, "paid_result">;

export function extractFreeResult(productResult: ProductResult): FreeProductResult {
  return {
    free_result: productResult.free_result,
    insight_layer: productResult.insight_layer,
    paid_preview: productResult.paid_preview,
    share_card: productResult.share_card,
    personal_pattern_candidate: productResult.personal_pattern_candidate,
    metadata: productResult.metadata,
  };
}

export function extractPaidResult(productResult: ProductResult): RichPaidResult | null {
  return isRichPaidResult(productResult.paid_result) ? productResult.paid_result : null;
}

export function combineFreeAndPaidForLegacyDisplay(
  freeResult: FreeProductResult,
  paidResult: RichPaidResult,
): ProductResult {
  return {
    ...freeResult,
    paid_result: paidResult,
  };
}

export function adaptLegacyProductResult(productResult: ProductResult) {
  return {
    freeResult: extractFreeResult(productResult),
    paidResult: extractPaidResult(productResult),
    legacyProductResult: productResult,
  };
}
