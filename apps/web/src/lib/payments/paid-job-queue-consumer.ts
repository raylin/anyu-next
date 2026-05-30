import { isDbConfigured } from "@/lib/db/client";
import {
  processPaidAnalysisJobs,
  type PaidGenerationProcessorResult,
} from "@/lib/modules/paid-generation-processor";
import type { PaidJobQueueTriggerPayload } from "@/lib/payments/paid-job-queue-trigger";
import {
  isPaidGenerationProcessorEnabled,
  isPaidJobQueueTriggerEnabled,
} from "@/lib/runtime/feature-flags";

export type PaidJobQueueConsumerCategory =
  | "processed"
  | "disabled"
  | "processor_disabled"
  | "invalid_payload"
  | "database_config_missing"
  | "unexpected_error";

export type PaidJobQueueConsumerResult =
  | {
      ok: true;
      category: Exclude<PaidJobQueueConsumerCategory, "invalid_payload" | "database_config_missing" | "unexpected_error">;
      processor?: PaidGenerationProcessorResult;
    }
  | {
      ok: false;
      category: "invalid_payload" | "database_config_missing" | "unexpected_error";
    };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parsePaidJobQueuePayload(input: unknown): PaidJobQueueTriggerPayload | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const payload = input as Partial<PaidJobQueueTriggerPayload>;

  if (
    payload.version !== 1 ||
    payload.type !== "paid_analysis_job_available" ||
    !isNonEmptyString(payload.paymentIntentId) ||
    !isNonEmptyString(payload.generationJobId) ||
    !isNonEmptyString(payload.moduleSlug) ||
    (payload.triggerSource !== "newebpay_notify" && payload.triggerSource !== "operator_fake_paid")
  ) {
    return null;
  }

  return {
    version: 1,
    type: "paid_analysis_job_available",
    paymentIntentId: payload.paymentIntentId,
    generationJobId: payload.generationJobId,
    moduleSlug: payload.moduleSlug,
    triggerSource: payload.triggerSource,
  };
}

export async function processPaidJobQueueMessage(input: {
  message: unknown;
  env?: NodeJS.ProcessEnv;
}): Promise<PaidJobQueueConsumerResult> {
  const payload = parsePaidJobQueuePayload(input.message);
  const env = input.env ?? process.env;

  if (!payload) {
    return { ok: false, category: "invalid_payload" };
  }

  if (!isPaidJobQueueTriggerEnabled(env)) {
    return { ok: true, category: "disabled" };
  }

  if (!isPaidGenerationProcessorEnabled(env)) {
    return { ok: true, category: "processor_disabled" };
  }

  if (!isDbConfigured()) {
    return { ok: false, category: "database_config_missing" };
  }

  try {
    const processor = await processPaidAnalysisJobs({
      limit: 1,
      lockedBy: "paid_generation_queue",
    });

    return { ok: true, category: "processed", processor };
  } catch {
    return { ok: false, category: "unexpected_error" };
  }
}
