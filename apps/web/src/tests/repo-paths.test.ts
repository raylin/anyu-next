import fs from "node:fs";
import { describe, expect, it } from "vitest";
import {
  getProductPromptPath,
  getProductSchemaPath,
  getProductSchemaPathForVersion,
  getPaidResultPromptPath,
  getPaidResultSchemaPath,
} from "@/lib/ai/repo-paths";

describe("app-local AI asset paths", () => {
  it("resolves the bundled prompt asset inside apps/web", () => {
    expect(fs.existsSync(getProductPromptPath())).toBe(true);
  });

  it("resolves the bundled schema asset inside apps/web", () => {
    expect(fs.existsSync(getProductSchemaPath())).toBe(true);
  });

  it("resolves product result schema v1 to the v1 asset", () => {
    const schemaPath = getProductSchemaPathForVersion("product_result_schema_v1");

    expect(schemaPath).toContain("product_result_schema_v1.json");
    expect(fs.existsSync(schemaPath)).toBe(true);
  });

  it("resolves product result schema v2 to the v2 asset", () => {
    const schemaPath = getProductSchemaPathForVersion("product_result_schema_v2");

    expect(schemaPath).toContain("product_result_schema_v2.json");
    expect(fs.existsSync(schemaPath)).toBe(true);
  });

  it("resolves free-result prompt and schema assets", () => {
    const promptPath = getProductPromptPath("product_result_prompt_free_v0.1");
    const schemaPath = getProductSchemaPathForVersion("product_result_schema_free_v1");

    expect(promptPath).toContain("product_result_prompt_free_v0.md");
    expect(schemaPath).toContain("product_result_schema_free_v1.json");
    expect(fs.existsSync(promptPath)).toBe(true);
    expect(fs.existsSync(schemaPath)).toBe(true);
  });

  it("resolves paid-result prompt and schema assets", () => {
    expect(fs.existsSync(getPaidResultPromptPath())).toBe(true);
    expect(fs.existsSync(getPaidResultSchemaPath())).toBe(true);
  });
});
