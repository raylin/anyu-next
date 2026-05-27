import path from "node:path";

export function getProductPromptPath(promptVersion = "product_result_prompt_v0.4"): string {
  if (promptVersion.trim() === "product_result_prompt_free_v0.1") {
    return path.join(process.cwd(), "src/lib/ai/assets/product_result_prompt_free_v0.md");
  }

  return path.join(process.cwd(), "src/lib/ai/assets/product_result_prompt_v0.md");
}

export function getProductSchemaPath(): string {
  return path.join(process.cwd(), "src/lib/ai/assets/product_result_schema_v0.json");
}

export function getProductSchemaPathForVersion(schemaVersion: string): string {
  const normalizedVersion = schemaVersion.trim();

  if (normalizedVersion === "product_result_schema_v1") {
    return path.join(process.cwd(), "src/lib/ai/assets/product_result_schema_v1.json");
  }

  if (normalizedVersion === "product_result_schema_v2") {
    return path.join(process.cwd(), "src/lib/ai/assets/product_result_schema_v2.json");
  }

  if (normalizedVersion === "product_result_schema_free_v1") {
    return path.join(process.cwd(), "src/lib/ai/assets/product_result_schema_free_v1.json");
  }

  return getProductSchemaPath();
}

export function getPaidResultPromptPath(): string {
  return path.join(process.cwd(), "src/lib/ai/assets/paid_result_prompt_v0.md");
}

export function getPaidResultSchemaPath(): string {
  return path.join(process.cwd(), "src/lib/ai/assets/paid_result_schema_v3.json");
}
