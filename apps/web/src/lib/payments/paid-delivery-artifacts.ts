import {
  PAID_RESULT_PROMPT_VERSION,
  PAID_RESULT_SCHEMA_VERSION,
} from "@/lib/ai/paid-result-generation";
import {
  createPaymentSingleEntitlement,
  getEntitlementByPaymentIntentId,
  type Entitlement,
  type EntitlementSource,
} from "@/lib/db/entitlements";
import {
  createOrReusePaidAnalysisJob,
  type GenerationJob,
  type GenerationJobTriggerSource,
} from "@/lib/db/generation-jobs";
import type { PaymentIntent } from "@/lib/db/payment-intents";
import { bindRecoveryContactsToEntitlement } from "@/lib/db/payment-recovery-contacts";
import { type PaidAccessResolutionState, resolvePaidAccessToken } from "@/lib/payments/paid-access-resolver";
import { getPaidAccessTokenHashSecret } from "@/lib/payments/paid-access-token";

export type PaidDeliveryArtifactError =
  | "paid_access_token_config_missing"
  | "paid_access_token_create_failed"
  | "entitlement_create_failed"
  | "entitlement_unavailable"
  | "generation_job_create_failed";

export type PaidDeliveryArtifactsResult =
  | {
      ok: true;
      entitlement: Entitlement;
      entitlementCreated: boolean;
      generationJob: GenerationJob;
      generationJobCreated: boolean;
      accessState: Exclude<PaidAccessResolutionState, "not_found">;
      paidAccessToken: string | null;
      paidAccessTokenReturned: boolean;
      unlockPath: string | null;
    }
  | {
      ok: false;
      status: 500 | 503;
      error: PaidDeliveryArtifactError;
    };

function accessStateFromJob(job: GenerationJob): Exclude<PaidAccessResolutionState, "not_found"> {
  if (job.status === "processing") {
    return "processing";
  }

  if (job.status === "failed_final") {
    return "failed";
  }

  if (job.status === "completed") {
    return "ready";
  }

  return "pending";
}

function isPaymentIntentEntitlementUniqueConflict(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    code?: unknown;
    constraint?: unknown;
    constraint_name?: unknown;
    cause?: unknown;
    message?: unknown;
  };

  const constraint =
    typeof candidate.constraint === "string"
      ? candidate.constraint
      : typeof candidate.constraint_name === "string"
        ? candidate.constraint_name
        : typeof candidate.message === "string" &&
            candidate.message.includes("entitlements_payment_intent_unique_idx")
          ? "entitlements_payment_intent_unique_idx"
          : null;

  if (
    candidate.code === "23505" &&
    constraint === "entitlements_payment_intent_unique_idx"
  ) {
    return true;
  }

  return isPaymentIntentEntitlementUniqueConflict(candidate.cause);
}

export async function createPaidDeliveryArtifactsForPaymentIntent(input: {
  paymentIntent: PaymentIntent;
  entitlementSource: EntitlementSource;
  generationJobTriggerSource: GenerationJobTriggerSource;
  operatorTest?: boolean;
  exposeRawPaidAccessToken?: boolean;
}): Promise<PaidDeliveryArtifactsResult> {
  const existingEntitlement = await getEntitlementByPaymentIntentId(input.paymentIntent.id);

  if (!existingEntitlement && !getPaidAccessTokenHashSecret()) {
    return { ok: false, status: 503, error: "paid_access_token_config_missing" };
  }

  let entitlementCreated = false;
  let paidAccessToken: string | null = null;
  let entitlement = existingEntitlement;

  if (!entitlement) {
    try {
      const created = await createPaymentSingleEntitlement({
        moduleSlug: input.paymentIntent.moduleSlug,
        analysisRequestId: input.paymentIntent.analysisRequestId,
        analysisResultId: input.paymentIntent.analysisResultId,
        paymentIntentId: input.paymentIntent.id,
        source: input.entitlementSource,
        unlockIntentId: input.paymentIntent.unlockIntentId,
        activatedAt: new Date(),
      });
      entitlement = created.entitlement;
      paidAccessToken = input.exposeRawPaidAccessToken ? created.paidAccessToken : null;
      entitlementCreated = true;
    } catch (error) {
      if (isPaymentIntentEntitlementUniqueConflict(error)) {
        entitlement = await getEntitlementByPaymentIntentId(input.paymentIntent.id);
        entitlementCreated = false;
      } else {
        return {
          ok: false,
          status: 500,
          error:
            error instanceof Error && error.message === "paid_access_token_hash_secret_missing"
              ? "paid_access_token_create_failed"
              : "entitlement_create_failed",
        };
      }
    }
  }

  if (!entitlement) {
    return { ok: false, status: 500, error: "entitlement_unavailable" };
  }

  try {
    await bindRecoveryContactsToEntitlement({
      paymentIntentId: input.paymentIntent.id,
      entitlementId: entitlement.id,
    });
  } catch {
    // Recovery identity is support infrastructure; it must not fail paid delivery.
  }

  let generationJobResult: Awaited<ReturnType<typeof createOrReusePaidAnalysisJob>>;

  try {
    generationJobResult = await createOrReusePaidAnalysisJob({
      moduleSlug: input.paymentIntent.moduleSlug,
      analysisResultId: input.paymentIntent.analysisResultId,
      triggerSource: input.generationJobTriggerSource,
      entitlementRefId: entitlement.id,
      promptVersion: PAID_RESULT_PROMPT_VERSION,
      schemaVersion: PAID_RESULT_SCHEMA_VERSION,
      operatorTest: input.operatorTest ?? false,
    });
  } catch {
    return { ok: false, status: 500, error: "generation_job_create_failed" };
  }

  let accessState = accessStateFromJob(generationJobResult.job);

  if (paidAccessToken) {
    const resolution = await resolvePaidAccessToken({
      moduleSlug: input.paymentIntent.moduleSlug,
      rawToken: paidAccessToken,
    });

    if (resolution.ok) {
      accessState = resolution.state;
    }
  }

  return {
    ok: true,
    entitlement,
    entitlementCreated,
    generationJob: generationJobResult.job,
    generationJobCreated: generationJobResult.created,
    accessState,
    paidAccessToken,
    paidAccessTokenReturned: Boolean(paidAccessToken),
    unlockPath: paidAccessToken
      ? `/m/${input.paymentIntent.moduleSlug}/unlock/${encodeURIComponent(paidAccessToken)}`
      : null,
  };
}
