import { afterEach, describe, expect, it } from "vitest";
import { ANTHROPIC_MAX_OUTPUT_TOKENS } from "@/lib/ai/provider";
import { PaidResultSemanticValidationError } from "@/lib/ai/paid-result-semantic-validation";
import { isOutputValidationError, resolveRuntimeStrategy } from "@/lib/ai/runtime";

const originalModelStrategy = process.env.MODEL_STRATEGY;
const originalFastModel = process.env.ANTHROPIC_FAST_MODEL;
const originalFallbackModel = process.env.ANTHROPIC_FALLBACK_MODEL;

afterEach(() => {
  if (originalModelStrategy === undefined) {
    delete process.env.MODEL_STRATEGY;
  } else {
    process.env.MODEL_STRATEGY = originalModelStrategy;
  }

  if (originalFastModel === undefined) {
    delete process.env.ANTHROPIC_FAST_MODEL;
  } else {
    process.env.ANTHROPIC_FAST_MODEL = originalFastModel;
  }

  if (originalFallbackModel === undefined) {
    delete process.env.ANTHROPIC_FALLBACK_MODEL;
  } else {
    process.env.ANTHROPIC_FALLBACK_MODEL = originalFallbackModel;
  }
});

describe("runtime model strategy", () => {
  it("keeps Anthropic output budget bounded for synchronous analyze requests", () => {
    expect(ANTHROPIC_MAX_OUTPUT_TOKENS).toBeLessThanOrEqual(4096);
  });

  it("treats paid result semantic validation failures as retryable output validation", () => {
    expect(
      isOutputValidationError(
        new PaidResultSemanticValidationError("paid_result contains forbidden phrasing."),
      ),
    ).toBe(true);
  });

  it("defaults to same-model retry on output validation when no guarded strategy is requested", () => {
    delete process.env.MODEL_STRATEGY;

    expect(
      resolveRuntimeStrategy(
        { provider: "anthropic", model: "claude-sonnet-4-20250514" },
        process.env,
      ),
    ).toEqual({
      strategy: "sonnet_default",
      provider: "anthropic",
      primaryModel: "claude-sonnet-4-20250514",
      retryOnInvalid: true,
      fallbackModel: null,
    });
  });

  it("resolves the guarded Haiku strategy when preview env vars are present", () => {
    process.env.MODEL_STRATEGY = "haiku_retry_sonnet_fallback";
    process.env.ANTHROPIC_FAST_MODEL = "claude-haiku-4-5-20251001";
    process.env.ANTHROPIC_FALLBACK_MODEL = "claude-sonnet-4-20250514";

    expect(
      resolveRuntimeStrategy(
        { provider: "anthropic", model: "claude-sonnet-4-20250514" },
        process.env,
      ),
    ).toEqual({
      strategy: "haiku_retry_sonnet_fallback",
      provider: "anthropic",
      primaryModel: "claude-haiku-4-5-20251001",
      retryOnInvalid: true,
      fallbackModel: "claude-sonnet-4-20250514",
    });
  });

  it("falls back to the default strategy for non-Anthropic providers", () => {
    process.env.MODEL_STRATEGY = "haiku_retry_sonnet_fallback";
    process.env.ANTHROPIC_FAST_MODEL = "claude-haiku-4-5-20251001";
    process.env.ANTHROPIC_FALLBACK_MODEL = "claude-sonnet-4-20250514";

    expect(
      resolveRuntimeStrategy(
        { provider: "openai", model: "gpt-5.5" },
        process.env,
      ),
    ).toEqual({
      strategy: "sonnet_default",
      provider: "openai",
      primaryModel: "gpt-5.5",
      retryOnInvalid: true,
      fallbackModel: null,
    });
  });
});
