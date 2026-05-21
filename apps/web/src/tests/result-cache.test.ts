import { describe, expect, it } from "vitest";
import {
  ANALYSIS_CACHE_KEY_VERSION,
  buildAnalyzeCacheKey,
  normalizeAnalyzeCacheText,
} from "@/lib/ai/result-cache";

describe("analysis result cache", () => {
  const baseInput = {
    moduleSlug: "ambiguous-temperature",
    redactedText: "他昨天說晚點回我， 今天又看了限動還沒回。",
    situation: "已讀不回",
    promptVersion: "product_result_prompt_v0.2",
    schemaVersion: "product_result_schema_v0",
    modelStrategy: "sonnet_default" as const,
    provider: "anthropic" as const,
    primaryModel: "claude-sonnet-4-20250514",
  };

  it("normalizes whitespace and unicode before hashing", () => {
    expect(normalizeAnalyzeCacheText("A\u3000B\n\nC")).toBe("A B C");
  });

  it("returns a stable key for equivalent normalized input", () => {
    const first = buildAnalyzeCacheKey(
      baseInput,
      {
        NODE_ENV: "test",
      } as NodeJS.ProcessEnv,
    );
    const second = buildAnalyzeCacheKey(
      {
        ...baseInput,
        redactedText: "他昨天說晚點回我，\n今天又看了限動還沒回。",
      },
      {
        NODE_ENV: "test",
      } as NodeJS.ProcessEnv,
    );

    expect(first).toEqual(second);
    expect(first?.cacheKeyVersion).toBe(ANALYSIS_CACHE_KEY_VERSION);
  });

  it("invalidates the key when prompt or model inputs change", () => {
    const baseKey = buildAnalyzeCacheKey(
      baseInput,
      {
        NODE_ENV: "test",
      } as NodeJS.ProcessEnv,
    );
    const changedPrompt = buildAnalyzeCacheKey(
      {
        ...baseInput,
        promptVersion: "product_result_prompt_v0.3",
      },
      {
        NODE_ENV: "test",
      } as NodeJS.ProcessEnv,
    );
    const changedModel = buildAnalyzeCacheKey(
      {
        ...baseInput,
        modelStrategy: "haiku_retry_sonnet_fallback",
        primaryModel: "claude-haiku-4-5-20251001",
      },
      {
        NODE_ENV: "test",
      } as NodeJS.ProcessEnv,
    );

    expect(changedPrompt?.cacheKeyHash).not.toBe(baseKey?.cacheKeyHash);
    expect(changedModel?.cacheKeyHash).not.toBe(baseKey?.cacheKeyHash);
  });

  it("disables caching in production when the secret is missing", () => {
    expect(
      buildAnalyzeCacheKey(
        baseInput,
        {
          NODE_ENV: "production",
        } as NodeJS.ProcessEnv,
      ),
    ).toBeNull();
  });
});
