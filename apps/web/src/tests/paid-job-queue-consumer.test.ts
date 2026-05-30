import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  parsePaidJobQueuePayload,
  processPaidJobQueueMessage,
} from "@/lib/payments/paid-job-queue-consumer";

const { mockProcessPaidAnalysisJobById } = vi.hoisted(() => ({
  mockProcessPaidAnalysisJobById: vi.fn(),
}));

vi.mock("@/lib/modules/paid-generation-processor", () => ({
  processPaidAnalysisJobById: mockProcessPaidAnalysisJobById,
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
    mockProcessPaidAnalysisJobById.mockResolvedValue({
      ok: true,
      category: "processed",
      jobId: "job-1",
      jobResult: "completed",
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
    expect(mockProcessPaidAnalysisJobById).not.toHaveBeenCalled();
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
    expect(mockProcessPaidAnalysisJobById).not.toHaveBeenCalled();
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
    expect(mockProcessPaidAnalysisJobById).not.toHaveBeenCalled();
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
    expect(mockProcessPaidAnalysisJobById).not.toHaveBeenCalled();
  });

  it("processes the exact queued generation job id", async () => {
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
        jobId: "job-1",
        jobResult: "completed",
      },
    });
    expect(mockProcessPaidAnalysisJobById).toHaveBeenCalledWith({
      generationJobId: "job-1",
      lockedBy: "paid_generation_queue",
    });
  });

  it("does not process a different due job when multiple jobs exist", async () => {
    await processPaidJobQueueMessage({
      message: {
        ...payload,
        generationJobId: "job-target",
      },
      env: {
        ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
        ENABLE_PAID_GENERATION_PROCESSOR: "true",
      } as NodeJS.ProcessEnv,
    });

    expect(mockProcessPaidAnalysisJobById).toHaveBeenCalledWith({
      generationJobId: "job-target",
      lockedBy: "paid_generation_queue",
    });
  });

  it("returns safe idempotent categories for completed target jobs", async () => {
    mockProcessPaidAnalysisJobById.mockResolvedValueOnce({
      ok: true,
      category: "already_completed",
      jobId: "job-1",
    });

    await expect(
      processPaidJobQueueMessage({
        message: payload,
        env: {
          ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
          ENABLE_PAID_GENERATION_PROCESSOR: "true",
        } as NodeJS.ProcessEnv,
      }),
    ).resolves.toMatchObject({
      ok: true,
      category: "already_completed",
      processor: {
        jobId: "job-1",
      },
    });
  });

  it("returns safe terminal categories for missing and invalid target jobs", async () => {
    mockProcessPaidAnalysisJobById.mockResolvedValueOnce({
      ok: false,
      category: "not_found",
      jobId: "job-1",
    });

    await expect(
      processPaidJobQueueMessage({
        message: payload,
        env: {
          ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
          ENABLE_PAID_GENERATION_PROCESSOR: "true",
        } as NodeJS.ProcessEnv,
      }),
    ).resolves.toMatchObject({
      ok: true,
      category: "not_found",
    });

    mockProcessPaidAnalysisJobById.mockResolvedValueOnce({
      ok: false,
      category: "invalid_job",
      jobId: "job-1",
    });

    await expect(
      processPaidJobQueueMessage({
        message: payload,
        env: {
          ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
          ENABLE_PAID_GENERATION_PROCESSOR: "true",
        } as NodeJS.ProcessEnv,
      }),
    ).resolves.toMatchObject({
      ok: true,
      category: "invalid_job",
    });
  });

  it("returns retryable errors as queue retry failures", async () => {
    mockProcessPaidAnalysisJobById.mockResolvedValueOnce({
      ok: false,
      category: "retryable_error",
      jobId: "job-1",
    });

    await expect(
      processPaidJobQueueMessage({
        message: payload,
        env: {
          ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
          ENABLE_PAID_GENERATION_PROCESSOR: "true",
        } as NodeJS.ProcessEnv,
      }),
    ).resolves.toMatchObject({
      ok: false,
      category: "retryable_error",
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
