import type { GenerationJob } from "@/lib/db/generation-jobs";
import type { PaymentIntent } from "@/lib/db/payment-intents";
import { isPaidJobQueueTriggerEnabled } from "@/lib/runtime/feature-flags";

export type PaidJobQueueProvider = "none" | "noop" | "test" | "vercel_queue";

export type PaidJobQueueTriggerSource = "newebpay_notify" | "operator_fake_paid";

export type PaidJobQueueTriggerSuccessCategory = "disabled" | "noop" | "enqueued";

export type PaidJobQueueTriggerFailureCategory =
  | "provider_config_missing"
  | "provider_error"
  | "unsupported_provider"
  | "unexpected_error";

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
      category: PaidJobQueueTriggerSuccessCategory;
      provider: PaidJobQueueProvider;
      payload?: PaidJobQueueTriggerPayload;
    }
  | {
      ok: false;
      category: PaidJobQueueTriggerFailureCategory;
      provider: PaidJobQueueProvider;
    };

export function getPaidJobQueueProvider(env: NodeJS.ProcessEnv = process.env): PaidJobQueueProvider {
  const provider = env.PAID_JOB_QUEUE_PROVIDER?.trim().toLowerCase();

  if (provider === "noop" || provider === "test" || provider === "vercel_queue") {
    return provider;
  }

  return "none";
}

function hasUnsupportedPaidJobQueueProvider(env: NodeJS.ProcessEnv) {
  const provider = env.PAID_JOB_QUEUE_PROVIDER?.trim().toLowerCase();

  return Boolean(provider && provider !== "none" && getPaidJobQueueProvider(env) === "none");
}

function getPaidJobQueueTopic(env: NodeJS.ProcessEnv) {
  return env.PAID_JOB_QUEUE_TOPIC?.trim() || null;
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

async function triggerVercelQueue(input: {
  payload: PaidJobQueueTriggerPayload;
  env: NodeJS.ProcessEnv;
}): Promise<PaidJobQueueTriggerResult> {
  const topic = getPaidJobQueueTopic(input.env);

  if (!topic) {
    return { ok: false, category: "provider_config_missing", provider: "vercel_queue" };
  }

  try {
    const { send } = await import("@vercel/queue");

    await send(topic, input.payload, {
      idempotencyKey: `paid-job:${input.payload.generationJobId}`,
      retentionSeconds: 24 * 60 * 60,
    });

    return {
      ok: true,
      category: "enqueued",
      provider: "vercel_queue",
      payload: input.payload,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "DuplicateMessageError") {
      return {
        ok: true,
        category: "enqueued",
        provider: "vercel_queue",
        payload: input.payload,
      };
    }

    return { ok: false, category: "provider_error", provider: "vercel_queue" };
  }
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

  if (hasUnsupportedPaidJobQueueProvider(env)) {
    return { ok: false, category: "unsupported_provider", provider: "none" };
  }

  const provider = getPaidJobQueueProvider(env);

  if (provider === "none") {
    return { ok: true, category: "disabled", provider };
  }

  const payload = buildPaidJobQueueTriggerPayload(input);

  if (provider === "noop") {
    return { ok: true, category: "noop", provider, payload };
  }

  if (provider === "vercel_queue") {
    return triggerVercelQueue({ payload, env });
  }

  return { ok: true, category: "enqueued", provider, payload };
}
