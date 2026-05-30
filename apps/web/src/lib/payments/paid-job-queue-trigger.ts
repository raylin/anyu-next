import type { GenerationJob } from "@/lib/db/generation-jobs";
import type { PaymentIntent } from "@/lib/db/payment-intents";
import { isPaidJobQueueTriggerEnabled } from "@/lib/runtime/feature-flags";

export type PaidJobQueueProvider = "none" | "noop" | "test";

export type PaidJobQueueTriggerSource = "newebpay_notify" | "operator_fake_paid";

export type PaidJobQueueTriggerCategory = "disabled" | "noop" | "enqueued" | "failed";

export type PaidJobQueueTriggerPayload = {
  version: 1;
  type: "paid_analysis_job_available";
  paymentIntentId: string;
  generationJobId: string;
  moduleSlug: string;
  triggerSource: PaidJobQueueTriggerSource;
};

export type PaidJobQueueTriggerResult =
  | {
      ok: true;
      category: Exclude<PaidJobQueueTriggerCategory, "failed">;
      provider: PaidJobQueueProvider;
      payload?: PaidJobQueueTriggerPayload;
    }
  | {
      ok: false;
      category: "failed";
      provider: PaidJobQueueProvider;
    };

export function getPaidJobQueueProvider(env: NodeJS.ProcessEnv = process.env): PaidJobQueueProvider {
  const provider = env.PAID_JOB_QUEUE_PROVIDER?.trim().toLowerCase();

  if (provider === "noop" || provider === "test") {
    return provider;
  }

  return "none";
}

export function buildPaidJobQueueTriggerPayload(input: {
  paymentIntent: Pick<PaymentIntent, "id" | "moduleSlug">;
  generationJob: Pick<GenerationJob, "id">;
  triggerSource: PaidJobQueueTriggerSource;
}): PaidJobQueueTriggerPayload {
  return {
    version: 1,
    type: "paid_analysis_job_available",
    paymentIntentId: input.paymentIntent.id,
    generationJobId: input.generationJob.id,
    moduleSlug: input.paymentIntent.moduleSlug,
    triggerSource: input.triggerSource,
  };
}

export async function triggerPaidJobProcessing(input: {
  paymentIntent: Pick<PaymentIntent, "id" | "moduleSlug">;
  generationJob: Pick<GenerationJob, "id">;
  triggerSource: PaidJobQueueTriggerSource;
  env?: NodeJS.ProcessEnv;
}): Promise<PaidJobQueueTriggerResult> {
  const env = input.env ?? process.env;

  if (!isPaidJobQueueTriggerEnabled(env)) {
    return { ok: true, category: "disabled", provider: "none" };
  }

  const provider = getPaidJobQueueProvider(env);

  if (provider === "none") {
    return { ok: true, category: "disabled", provider };
  }

  const payload = buildPaidJobQueueTriggerPayload(input);

  if (provider === "noop") {
    return { ok: true, category: "noop", provider, payload };
  }

  return { ok: true, category: "enqueued", provider, payload };
}
