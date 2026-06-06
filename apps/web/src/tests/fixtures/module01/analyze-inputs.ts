import validAnalyzeFixture from "./valid-analyze-request.json";
import type { AiTemperatureUserContext } from "@/lib/modules/ai-temperature-context";

export const MODULE01_VALID_ANALYZE_FIXTURE_NAME = validAnalyzeFixture.fixtureName;
export const MODULE01_VALID_ANALYZE_TEXT = validAnalyzeFixture.request.text;
export const MODULE01_VALID_ANALYZE_SITUATION = validAnalyzeFixture.request.situation;
export const MODULE01_VALID_ANALYZE_VALIDITY_NOTE = validAnalyzeFixture.validityNote;

export type Module01AnalyzeRequestFixture = {
  text: string;
  situation: string;
  anonymousSessionId: string;
  userContext: AiTemperatureUserContext;
};

export function createValidModule01AnonymousSessionId(prefix = "module01-fixture"): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createValidModule01AnalyzeText(suffix?: string): string {
  const trimmedSuffix = suffix?.trim();

  return trimmedSuffix ? `${MODULE01_VALID_ANALYZE_TEXT}\n\n${trimmedSuffix}` : MODULE01_VALID_ANALYZE_TEXT;
}

export function createValidModule01AnalyzeRequest(
  overrides: Partial<Module01AnalyzeRequestFixture> = {},
): Module01AnalyzeRequestFixture {
  return {
    text: overrides.text ?? MODULE01_VALID_ANALYZE_TEXT,
    situation: overrides.situation ?? MODULE01_VALID_ANALYZE_SITUATION,
    anonymousSessionId:
      overrides.anonymousSessionId ?? createValidModule01AnonymousSessionId(),
    userContext: {
      ...validAnalyzeFixture.request.userContext,
      ...overrides.userContext,
    },
  };
}

