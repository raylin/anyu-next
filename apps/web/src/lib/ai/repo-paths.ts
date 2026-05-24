import path from "node:path";

export function getProductPromptPath(): string {
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

  return getProductSchemaPath();
}
