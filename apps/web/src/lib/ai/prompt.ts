import fs from "node:fs/promises";
import { getProductPromptPath } from "@/lib/ai/repo-paths";
import type { PromptMetadata } from "@/lib/ai/types";

let cachedPromptTemplate: string | null = null;

export async function loadProductPromptTemplate(): Promise<string> {
  if (cachedPromptTemplate) {
    return cachedPromptTemplate;
  }

  cachedPromptTemplate = await fs.readFile(getProductPromptPath(), "utf-8");
  return cachedPromptTemplate;
}

export async function buildProductPrompt(
  rawContent: string,
  metadata: PromptMetadata,
): Promise<string> {
  const template = await loadProductPromptTemplate();

  return template
    .replace("{{RAW_CONTENT}}", rawContent)
    .replace(
      "{{SOURCE_METADATA}}",
      JSON.stringify(metadata, null, 2),
    );
}
