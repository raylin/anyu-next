import fs from "node:fs";
import path from "node:path";

let cachedRepoRoot: string | null = null;

function looksLikeRepoRoot(candidate: string): boolean {
  return (
    fs.existsSync(path.join(candidate, "prompts", "product_result_prompt_v0.md")) &&
    fs.existsSync(path.join(candidate, "schemas", "product_result_schema_v0.json"))
  );
}

export function findRepoRoot(startDir: string = process.cwd()): string {
  if (cachedRepoRoot) {
    return cachedRepoRoot;
  }

  let currentDir = startDir;

  while (true) {
    if (looksLikeRepoRoot(currentDir)) {
      cachedRepoRoot = currentDir;
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);

    if (parentDir === currentDir) {
      throw new Error("Unable to resolve repository root for prompt/schema loading.");
    }

    currentDir = parentDir;
  }
}

export function getProductPromptPath(): string {
  return path.join(findRepoRoot(), "prompts", "product_result_prompt_v0.md");
}

export function getProductSchemaPath(): string {
  return path.join(findRepoRoot(), "schemas", "product_result_schema_v0.json");
}
