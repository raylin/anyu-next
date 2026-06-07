import validAnalyzeFixture from "./valid-analyze-request.json";
import type { AiTemperatureUserContext } from "@/lib/modules/ai-temperature-context";

export const MODULE01_VALID_ANALYZE_FIXTURE_NAME = validAnalyzeFixture.fixtureName;
export const MODULE01_VALID_ANALYZE_TEXT = validAnalyzeFixture.request.text;
export const MODULE01_VALID_ANALYZE_SITUATION = validAnalyzeFixture.request.situation;
export const MODULE01_VALID_ANALYZE_VALIDITY_NOTE = validAnalyzeFixture.validityNote;
export const MODULE01_SMOKE_RUN_ID_PATTERN =
  /^module01-smoke-[0-9]{8}T[0-9]{6}Z-[a-f0-9]{8}$/u;

export type Module01AnalyzeRequestFixture = {
  text: string;
  situation: string;
  anonymousSessionId: string;
  userContext: AiTemperatureUserContext;
};

export function createValidModule01AnonymousSessionId(prefix = "module01-fixture"): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createModule01SmokeRunId(prefix = "module01-smoke"): string {
  const timestamp = new Date().toISOString().replace(/[-:]/gu, "").replace(/\.\d{3}Z$/u, "Z");
  const randomPart = crypto.randomUUID().replace(/-/gu, "").slice(0, 8);

  return `${prefix}-${timestamp}-${randomPart}`;
}

export function createModule01SmokeRunMarker(smokeRunId: string): string {
  if (!MODULE01_SMOKE_RUN_ID_PATTERN.test(smokeRunId)) {
    throw new Error("invalid_module01_smoke_run_id");
  }

  return `【系統測試批次：${smokeRunId}】`;
}

export function createValidModule01AnalyzeText(suffix?: string): string {
  const trimmedSuffix = suffix?.trim();

  return trimmedSuffix ? `${MODULE01_VALID_ANALYZE_TEXT}\n\n${trimmedSuffix}` : MODULE01_VALID_ANALYZE_TEXT;
}

export function createFreshModule01SmokeAnalyzeText(input: { smokeRunId: string }): string {
  return createValidModule01AnalyzeText(createModule01SmokeRunMarker(input.smokeRunId));
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

export function createFreshModule01SmokeAnalyzeRequest(input: {
  smokeRunId?: string;
  overrides?: Partial<Module01AnalyzeRequestFixture>;
} = {}): Module01AnalyzeRequestFixture & { smokeRunId: string } {
  const smokeRunId = input.smokeRunId ?? createModule01SmokeRunId();

  return {
    ...createValidModule01AnalyzeRequest({
      ...input.overrides,
      text: input.overrides?.text ?? createFreshModule01SmokeAnalyzeText({ smokeRunId }),
      anonymousSessionId:
        input.overrides?.anonymousSessionId ?? `module01-smoke-session-${smokeRunId}`,
    }),
    smokeRunId,
  };
}
