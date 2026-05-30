import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildPaidJobQueueTriggerPayload,
  getPaidJobQueueProvider,
  triggerPaidJobProcessing,
} from "@/lib/payments/paid-job-queue-trigger";

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

vi.mock("@vercel/queue", async () => {
  const actual = await vi.importActual<typeof import("@vercel/queue")>("@vercel/queue");

  return {
    ...actual,
    send: mockSend,
  };
});

const paymentIntent = {
  id: "payment-1",
  moduleSlug: "ambiguous-temperature",
};

const generationJob = {
  id: "job-1",
};

describe("paid job queue trigger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({ messageId: "queue-message-1" });
  });

  it("is disabled by default", async () => {
    await expect(
      triggerPaidJobProcessing({
        paymentIntent,
        generationJob,
        triggerSource: "newebpay_notify",
        env: {} as NodeJS.ProcessEnv,
      }),
    ).resolves.toEqual({
      ok: true,
      category: "disabled",
      provider: "none",
    });
  });

  it("fails closed for unknown providers", async () => {
    expect(
      getPaidJobQueueProvider({ PAID_JOB_QUEUE_PROVIDER: "qstash" } as NodeJS.ProcessEnv),
    ).toBe("none");

    await expect(
      triggerPaidJobProcessing({
        paymentIntent,
        generationJob,
        triggerSource: "newebpay_notify",
        env: {
          ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
          PAID_JOB_QUEUE_PROVIDER: "qstash",
        } as NodeJS.ProcessEnv,
      }),
    ).resolves.toEqual({
      ok: false,
      category: "unsupported_provider",
      provider: "none",
    });
  });

  it("returns a no-op result with a safe trigger-only payload", async () => {
    const result = await triggerPaidJobProcessing({
      paymentIntent,
      generationJob,
      triggerSource: "newebpay_notify",
      env: {
        ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
        PAID_JOB_QUEUE_PROVIDER: "noop",
      } as NodeJS.ProcessEnv,
    });

    expect(result).toEqual({
      ok: true,
      category: "noop",
      provider: "noop",
      payload: {
        version: 1,
        type: "paid_analysis_job_available",
        paymentIntentId: "payment-1",
        generationJobId: "job-1",
        moduleSlug: "ambiguous-temperature",
        triggerSource: "newebpay_notify",
      },
    });

    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("pa_");
    expect(serialized).not.toContain("pcs_");
    expect(serialized).not.toContain("/unlock/");
    expect(serialized).not.toContain("TradeInfo");
    expect(serialized).not.toContain("TradeSha");
    expect(serialized).not.toContain("rawInput");
    expect(serialized).not.toContain("providerPayload");
  });

  it("uses the test adapter as an in-memory enqueued result only", async () => {
    await expect(
      triggerPaidJobProcessing({
        paymentIntent,
        generationJob,
        triggerSource: "operator_fake_paid",
        env: {
          ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
          PAID_JOB_QUEUE_PROVIDER: "test",
        } as NodeJS.ProcessEnv,
      }),
    ).resolves.toMatchObject({
      ok: true,
      category: "enqueued",
      provider: "test",
      payload: {
        paymentIntentId: "payment-1",
        generationJobId: "job-1",
        triggerSource: "operator_fake_paid",
      },
    });
  });

  it("does not enqueue to Vercel Queues when the trigger flag is off", async () => {
    await expect(
      triggerPaidJobProcessing({
        paymentIntent,
        generationJob,
        triggerSource: "newebpay_notify",
        env: {
          PAID_JOB_QUEUE_PROVIDER: "vercel_queue",
          PAID_JOB_QUEUE_TOPIC: "paid-generation-jobs",
        } as NodeJS.ProcessEnv,
      }),
    ).resolves.toEqual({
      ok: true,
      category: "disabled",
      provider: "none",
    });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns provider_config_missing when Vercel Queue topic config is absent", async () => {
    await expect(
      triggerPaidJobProcessing({
        paymentIntent,
        generationJob,
        triggerSource: "newebpay_notify",
        env: {
          ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
          PAID_JOB_QUEUE_PROVIDER: "vercel_queue",
        } as NodeJS.ProcessEnv,
      }),
    ).resolves.toEqual({
      ok: false,
      category: "provider_config_missing",
      provider: "vercel_queue",
    });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("enqueues a safe Vercel Queue payload with an idempotency key", async () => {
    const result = await triggerPaidJobProcessing({
      paymentIntent,
      generationJob,
      triggerSource: "newebpay_notify",
      env: {
        ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
        PAID_JOB_QUEUE_PROVIDER: "vercel_queue",
        PAID_JOB_QUEUE_TOPIC: "paid-generation-jobs",
      } as NodeJS.ProcessEnv,
    });

    expect(result).toMatchObject({
      ok: true,
      category: "enqueued",
      provider: "vercel_queue",
      payload: {
        paymentIntentId: "payment-1",
        generationJobId: "job-1",
        moduleSlug: "ambiguous-temperature",
        triggerSource: "newebpay_notify",
      },
    });
    expect(mockSend).toHaveBeenCalledWith(
      "paid-generation-jobs",
      expect.objectContaining({
        paymentIntentId: "payment-1",
        generationJobId: "job-1",
      }),
      expect.objectContaining({
        idempotencyKey: "paid-job:job-1",
        retentionSeconds: 86400,
      }),
    );

    const serialized = JSON.stringify(mockSend.mock.calls[0]);

    expect(serialized).not.toContain("pa_");
    expect(serialized).not.toContain("pcs_");
    expect(serialized).not.toContain("/unlock/");
    expect(serialized).not.toContain("TradeInfo");
    expect(serialized).not.toContain("TradeSha");
    expect(serialized).not.toContain("rawInput");
    expect(serialized).not.toContain("providerPayload");
  });

  it("returns provider_error when Vercel Queue enqueue fails", async () => {
    mockSend.mockRejectedValueOnce(new Error("queue unavailable"));

    await expect(
      triggerPaidJobProcessing({
        paymentIntent,
        generationJob,
        triggerSource: "operator_fake_paid",
        env: {
          ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
          PAID_JOB_QUEUE_PROVIDER: "vercel_queue",
          PAID_JOB_QUEUE_TOPIC: "paid-generation-jobs",
        } as NodeJS.ProcessEnv,
      }),
    ).resolves.toEqual({
      ok: false,
      category: "provider_error",
      provider: "vercel_queue",
    });
  });

  it("builds payloads from DB references only", () => {
    expect(
      buildPaidJobQueueTriggerPayload({
        paymentIntent,
        generationJob,
        triggerSource: "newebpay_notify",
      }),
    ).toEqual({
      version: 1,
      type: "paid_analysis_job_available",
      paymentIntentId: "payment-1",
      generationJobId: "job-1",
      moduleSlug: "ambiguous-temperature",
      triggerSource: "newebpay_notify",
    });
  });
});
