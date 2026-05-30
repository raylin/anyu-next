import { describe, expect, it } from "vitest";
import {
  buildPaidJobQueueTriggerPayload,
  getPaidJobQueueProvider,
  triggerPaidJobProcessing,
} from "@/lib/payments/paid-job-queue-trigger";

const paymentIntent = {
  id: "payment-1",
  moduleSlug: "ambiguous-temperature",
};

const generationJob = {
  id: "job-1",
};

describe("paid job queue trigger", () => {
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
      ok: true,
      category: "disabled",
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
