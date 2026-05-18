import { describe, expect, it } from "vitest";
import { aiTemperatureDemoProductResult } from "@/lib/modules/demo-result";
import { validateProductResultObject } from "@/lib/ai/validate-product-result";

describe("product result schema validation", () => {
  it("accepts the demo fixture as a valid product result", () => {
    expect(validateProductResultObject(aiTemperatureDemoProductResult)).toEqual(
      aiTemperatureDemoProductResult,
    );
  });
});
