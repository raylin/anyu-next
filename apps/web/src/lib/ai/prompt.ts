import fs from "node:fs/promises";
import { getProductPromptPath } from "@/lib/ai/repo-paths";
import type { PromptMetadata } from "@/lib/ai/types";

const cachedPromptTemplateByVersion = new Map<string, string>();

export async function loadProductPromptTemplate(
  promptVersion = "product_result_prompt_v0.4",
): Promise<string> {
  if (cachedPromptTemplateByVersion.has(promptVersion)) {
    return cachedPromptTemplateByVersion.get(promptVersion) ?? "";
  }

  const promptTemplate = await fs.readFile(getProductPromptPath(promptVersion), "utf-8");
  cachedPromptTemplateByVersion.set(promptVersion, promptTemplate);
  return promptTemplate;
}

export async function buildProductPrompt(
  rawContent: string,
  metadata: PromptMetadata,
  promptVersion?: string,
): Promise<string> {
  const template = await loadProductPromptTemplate(promptVersion);

  return template
    .replace("{{RAW_CONTENT}}", rawContent)
    .replace(
      "{{SOURCE_METADATA}}",
      JSON.stringify(metadata, null, 2),
    );
}
