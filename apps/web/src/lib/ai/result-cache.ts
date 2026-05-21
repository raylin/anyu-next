import { createHmac } from "node:crypto";
import type { ModelStrategyName } from "@/lib/ai/types";

export const ANALYSIS_CACHE_KEY_VERSION = "v1";
const DEVELOPMENT_FALLBACK_CACHE_SECRET = "local-dev-analysis-cache-secret-v1";

export function normalizeAnalyzeCacheText(input: string): string {
  return input.normalize("NFKC").replace(/\s+/g, " ").trim();
}

function getAnalysisCacheSecret(env: NodeJS.ProcessEnv = process.env): string | null {
  const configuredSecret = env.ANALYSIS_CACHE_HASH_SECRET?.trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  return env.NODE_ENV === "production" ? null : DEVELOPMENT_FALLBACK_CACHE_SECRET;
}

export function buildAnalyzeCacheKey(input: {
  moduleSlug: string;
  redactedText: string;
  situation: string;
  promptVersion: string;
  schemaVersion: string;
  modelStrategy: ModelStrategyName;
  provider: "anthropic" | "openai";
  primaryModel: string;
}, env: NodeJS.ProcessEnv = process.env) {
  const secret = getAnalysisCacheSecret(env);

  if (!secret) {
    return null;
  }

  const normalizedPayload = JSON.stringify({
    moduleSlug: input.moduleSlug,
    redactedText: normalizeAnalyzeCacheText(input.redactedText),
    situation: input.situation,
    promptVersion: input.promptVersion,
    schemaVersion: input.schemaVersion,
    modelStrategy: input.modelStrategy,
    provider: input.provider,
    primaryModel: input.primaryModel,
  });

  return {
    cacheKeyVersion: ANALYSIS_CACHE_KEY_VERSION,
    cacheKeyHash: createHmac("sha256", secret).update(normalizedPayload).digest("hex"),
  };
}
