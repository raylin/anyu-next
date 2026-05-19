import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { getProductPromptPath, getProductSchemaPath } from "@/lib/ai/repo-paths";

describe("app-local AI asset paths", () => {
  it("resolves the bundled prompt asset inside apps/web", () => {
    expect(fs.existsSync(getProductPromptPath())).toBe(true);
  });

  it("resolves the bundled schema asset inside apps/web", () => {
    expect(fs.existsSync(getProductSchemaPath())).toBe(true);
  });
});
