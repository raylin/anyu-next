import { describe, expect, it } from "vitest";
import {
  isOperatorEmailRecoverySmokeEnabled,
  isOperatorFakePaidSuccessEnabled,
  isOperatorRecoveryLinkSmokeEnabled,
  isPaidJobQueueTriggerEnabled,
  isPaidGenerationJobsEnabled,
  isPaidGenerationProcessorEnabled,
} from "@/lib/runtime/feature-flags";

describe("runtime feature flags", () => {
  it("keeps paid generation jobs disabled by default", () => {
    expect(isPaidGenerationJobsEnabled({} as NodeJS.ProcessEnv)).toBe(false);
  });

  it("enables paid generation jobs only for explicit truthy values", () => {
    expect(isPaidGenerationJobsEnabled({ ENABLE_PAID_GENERATION_JOBS: "true" } as NodeJS.ProcessEnv)).toBe(
      true,
    );
    expect(isPaidGenerationJobsEnabled({ ENABLE_PAID_GENERATION_JOBS: "1" } as NodeJS.ProcessEnv)).toBe(
      true,
    );
    expect(isPaidGenerationJobsEnabled({ ENABLE_PAID_GENERATION_JOBS: "false" } as NodeJS.ProcessEnv)).toBe(
      false,
    );
  });

  it("keeps the paid generation processor disabled unless explicitly enabled", () => {
    expect(isPaidGenerationProcessorEnabled({} as NodeJS.ProcessEnv)).toBe(false);
    expect(
      isPaidGenerationProcessorEnabled({ ENABLE_PAID_GENERATION_PROCESSOR: "true" } as NodeJS.ProcessEnv),
    ).toBe(true);
    expect(
      isPaidGenerationProcessorEnabled({ ENABLE_PAID_GENERATION_PROCESSOR: "0" } as NodeJS.ProcessEnv),
    ).toBe(false);
  });

  it("keeps operator fake paid success disabled unless explicitly enabled", () => {
    expect(isOperatorFakePaidSuccessEnabled({} as NodeJS.ProcessEnv)).toBe(false);
    expect(
      isOperatorFakePaidSuccessEnabled({ ENABLE_OPERATOR_FAKE_PAID_SUCCESS: "true" } as NodeJS.ProcessEnv),
    ).toBe(true);
    expect(
      isOperatorFakePaidSuccessEnabled({ ENABLE_OPERATOR_FAKE_PAID_SUCCESS: "0" } as NodeJS.ProcessEnv),
    ).toBe(false);
  });

  it("allows recovery link operator smoke only on Preview(staging) with explicit flag", () => {
    expect(isOperatorRecoveryLinkSmokeEnabled({} as NodeJS.ProcessEnv)).toBe(false);
    expect(
      isOperatorRecoveryLinkSmokeEnabled({
        VERCEL_ENV: "preview",
        VERCEL_GIT_COMMIT_REF: "staging",
        ENABLE_OPERATOR_RECOVERY_LINK_SMOKE: "true",
      } as NodeJS.ProcessEnv),
    ).toBe(true);
    expect(
      isOperatorRecoveryLinkSmokeEnabled({
        VERCEL_ENV: "production",
        VERCEL_GIT_COMMIT_REF: "staging",
        ENABLE_OPERATOR_RECOVERY_LINK_SMOKE: "true",
      } as NodeJS.ProcessEnv),
    ).toBe(false);
    expect(
      isOperatorRecoveryLinkSmokeEnabled({
        VERCEL_ENV: "preview",
        VERCEL_GIT_COMMIT_REF: "feature",
        ENABLE_OPERATOR_RECOVERY_LINK_SMOKE: "true",
      } as NodeJS.ProcessEnv),
    ).toBe(false);
  });

  it("allows email recovery operator smoke only on Preview(staging) with explicit flag", () => {
    expect(isOperatorEmailRecoverySmokeEnabled({} as NodeJS.ProcessEnv)).toBe(false);
    expect(
      isOperatorEmailRecoverySmokeEnabled({
        VERCEL_ENV: "preview",
        VERCEL_GIT_COMMIT_REF: "staging",
        ENABLE_OPERATOR_EMAIL_RECOVERY_SMOKE: "true",
      } as NodeJS.ProcessEnv),
    ).toBe(true);
    expect(
      isOperatorEmailRecoverySmokeEnabled({
        VERCEL_ENV: "production",
        VERCEL_GIT_COMMIT_REF: "staging",
        ENABLE_OPERATOR_EMAIL_RECOVERY_SMOKE: "true",
      } as NodeJS.ProcessEnv),
    ).toBe(false);
    expect(
      isOperatorEmailRecoverySmokeEnabled({
        VERCEL_ENV: "preview",
        VERCEL_GIT_COMMIT_REF: "feature",
        ENABLE_OPERATOR_EMAIL_RECOVERY_SMOKE: "true",
      } as NodeJS.ProcessEnv),
    ).toBe(false);
  });

  it("keeps paid job queue trigger disabled unless explicitly enabled", () => {
    expect(isPaidJobQueueTriggerEnabled({} as NodeJS.ProcessEnv)).toBe(false);
    expect(
      isPaidJobQueueTriggerEnabled({ ENABLE_PAID_JOB_QUEUE_TRIGGER: "true" } as NodeJS.ProcessEnv),
    ).toBe(true);
    expect(
      isPaidJobQueueTriggerEnabled({ ENABLE_PAID_JOB_QUEUE_TRIGGER: "yes" } as NodeJS.ProcessEnv),
    ).toBe(true);
    expect(
      isPaidJobQueueTriggerEnabled({ ENABLE_PAID_JOB_QUEUE_TRIGGER: "false" } as NodeJS.ProcessEnv),
    ).toBe(false);
  });
});
