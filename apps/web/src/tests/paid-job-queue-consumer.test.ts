import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  parsePaidJobQueuePayload,
  processPaidJobQueueMessage,
} from "@/lib/payments/paid-job-queue-consumer";

const { mockProcessPaidAnalysisJobs } = vi.hoisted(() => ({
  mockProcessPaidAnalysisJobs: vi.fn(),
}));

vi.mock("@/lib/modules/paid-generation-processor", () => ({
  processPaidAnalysisJobs: mockProcessPaidAnalysisJobs,
}));

const payload = {
  version: 1,
  type: "paid_analysis_job_available",
  paymentIntentId: "payment-1",
  generationJobId: "job-1",
  moduleSlug: "ambiguous-temperature",
  triggerSource: "newebpay_notify",
};

describe("paid job queue consumer", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_URL = "postgres://example.invalid/db";
    mockProcessPaidAnalysisJobs.mockResolvedValue({
      ok: true,
      dryRun: false,
      processed: 1,
      completed: 1,
      retryScheduled: 0,
      failedFinal: 0,
      staleRecovered: 0,
      skipped: 0,
    });
  });

  afterEach(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it("validates the trigger-only queue payload shape", () => {
    expect(parsePaidJobQueuePayload(payload)).toEqual(payload);
    expect(parsePaidJobQueuePayload({ ...payload, paymentIntentId: "" })).toBeNull();
    expect(parsePaidJobQueuePayload({ ...payload, triggerSource: "return_url" })).toBeNull();
    expect(parsePaidJobQueuePayload({ ...payload, paidAccessToken: "redacted-paid-token" })).toEqual(payload);
  });

  it("rejects invalid queue messages without invoking the processor", async () => {
    await expect(
      processPaidJobQueueMessage({
        message: { type: "bad" },
        env: {
          ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
          ENABLE_PAID_GENERATION_PROCESSOR: "true",
        } as NodeJS.ProcessEnv,
      }),
    ).resolves.toEqual({ ok: false, category: "invalid_payload" });
    expect(mockProcessPaidAnalysisJobs).not.toHaveBeenCalled();
  });

  it("does not process messages when the queue trigger flag is disabled", async () => {
    await expect(
      processPaidJobQueueMessage({
        message: payload,
        env: {
          ENABLE_PAID_GENERATION_PROCESSOR: "true",
        } as NodeJS.ProcessEnv,
      }),
    ).resolves.toEqual({ ok: true, category: "disabled" });
    expect(mockProcessPaidAnalysisJobs).not.toHaveBeenCalled();
  });

  it("does not process messages when the processor flag is disabled", async () => {
    await expect(
      processPaidJobQueueMessage({
        message: payload,
        env: {
          ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
        } as NodeJS.ProcessEnv,
      }),
    ).resolves.toEqual({ ok: true, category: "processor_disabled" });
    expect(mockProcessPaidAnalysisJobs).not.toHaveBeenCalled();
  });

  it("fails safely when database configuration is missing", async () => {
    delete process.env.DATABASE_URL;

    await expect(
      processPaidJobQueueMessage({
        message: payload,
        env: {
          ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
          ENABLE_PAID_GENERATION_PROCESSOR: "true",
        } as NodeJS.ProcessEnv,
      }),
    ).resolves.toEqual({ ok: false, category: "database_config_missing" });
    expect(mockProcessPaidAnalysisJobs).not.toHaveBeenCalled();
  });

  it("delegates processing to the idempotent paid generation processor", async () => {
    const result = await processPaidJobQueueMessage({
      message: payload,
      env: {
        ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
        ENABLE_PAID_GENERATION_PROCESSOR: "true",
      } as NodeJS.ProcessEnv,
    });

    expect(result).toMatchObject({
      ok: true,
      category: "processed",
      processor: {
        processed: 1,
        completed: 1,
      },
    });
    expect(mockProcessPaidAnalysisJobs).toHaveBeenCalledWith({
      limit: 1,
      lockedBy: "paid_generation_queue",
    });
  });

  it("does not include raw tokens or provider payload in consumer results", async () => {
    const result = await processPaidJobQueueMessage({
      message: {
        ...payload,
        paidAccessToken: "redacted-paid-token",
        checkoutSessionToken: "redacted-checkout-session",
        providerPayload: { TradeInfo: "raw-provider-payload" },
      },
      env: {
        ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
        ENABLE_PAID_GENERATION_PROCESSOR: "true",
      } as NodeJS.ProcessEnv,
    });
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("redacted-paid-token");
    expect(serialized).not.toContain("redacted-checkout-session");
    expect(serialized).not.toContain("raw-provider-payload");
    expect(serialized).not.toContain("TradeInfo");
  });
});
