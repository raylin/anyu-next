import type { GenerationJob } from "@/lib/db/generation-jobs";
import { getEntitlementByPaymentIntentId, type Entitlement } from "@/lib/db/entitlements";
import {
  createPaymentIntent,
  getPaymentIntentByMerchantOrderNo,
  markPaymentPaid,
  type PaymentIntent,
} from "@/lib/db/payment-intents";
import { getAnalysisResultWithRequestById } from "@/lib/db/runtime";
import { type PaidAccessResolutionState } from "@/lib/payments/paid-access-resolver";
import { getPaidAccessTokenHashSecret } from "@/lib/payments/paid-access-token";
import { getModuleBySlug } from "@/lib/modules/registry";
import { createPaidDeliveryArtifactsForPaymentIntent } from "@/lib/payments/paid-delivery-artifacts";
import { createOrUpdateEmailRecoveryContact } from "@/lib/db/payment-recovery-contacts";
import {
  triggerPaidJobProcessing,
  type PaidJobQueueTriggerResult,
} from "@/lib/payments/paid-job-queue-trigger";

const OPERATOR_FAKE_MERCHANT_ORDER_PREFIX = "ANYUFAKE";
const OPERATOR_FAKE_AMOUNT_MINOR = 49;

export type OperatorFakePaidSuccessResult =
  | {
      ok: true;
      moduleSlug: string;
      resultId: string;
      paymentIntent: PaymentIntent;
      paymentIntentCreated: boolean;
      entitlement: Entitlement;
      entitlementCreated: boolean;
      generationJob: GenerationJob;
      generationJobCreated: boolean;
      accessState: Exclude<PaidAccessResolutionState, "not_found">;
      paidAccessToken: string | null;
      paidAccessTokenReturned: boolean;
      unlockPath: string | null;
      queueTrigger: PaidJobQueueTriggerResult;
      recoveryContactId: string | null;
    }
  | {
      ok: false;
      status: 404 | 409 | 500 | 503;
      error:
        | "module_not_found"
        | "result_not_found"
        | "payment_intent_create_failed"
        | "payment_intent_transition_failed"
        | "paid_access_token_config_missing"
        | "paid_access_token_create_failed"
        | "entitlement_create_failed"
        | "entitlement_unavailable"
        | "generation_job_create_failed"
        | "unexpected_error";
    };

function buildOperatorFakeMerchantOrderNo(input: {
  moduleSlug: string;
  resultId: string;
  idempotencyKey?: string | null;
}) {
  const idempotencyPart = input.idempotencyKey?.trim() || input.resultId;

  return [
    OPERATOR_FAKE_MERCHANT_ORDER_PREFIX,
    input.moduleSlug.replace(/[^a-z0-9-]/giu, "-"),
    idempotencyPart.replace(/[^a-z0-9-]/giu, "-"),
  ].join("-");
}

export async function createOperatorFakePaidSuccess(input: {
  moduleSlug: string;
  resultId: string;
  idempotencyKey?: string | null;
  recoveryEmail?: string | null;
}): Promise<OperatorFakePaidSuccessResult> {
  const moduleConfig = getModuleBySlug(input.moduleSlug);

  if (!moduleConfig) {
    return { ok: false, status: 404, error: "module_not_found" };
  }

  const record = await getAnalysisResultWithRequestById(
    input.resultId,
    moduleConfig.moduleId,
    moduleConfig.slug,
  );

  if (!record) {
    return { ok: false, status: 404, error: "result_not_found" };
  }

  const merchantOrderNo = buildOperatorFakeMerchantOrderNo({
    moduleSlug: moduleConfig.slug,
    resultId: input.resultId,
    idempotencyKey: input.idempotencyKey,
  });
  const existingPaymentIntent = await getPaymentIntentByMerchantOrderNo(merchantOrderNo);
  const existingEntitlement = existingPaymentIntent
    ? await getEntitlementByPaymentIntentId(existingPaymentIntent.id)
    : null;

  if (!existingEntitlement && !getPaidAccessTokenHashSecret()) {
    return { ok: false, status: 503, error: "paid_access_token_config_missing" };
  }

  let paymentIntentCreated = false;
  let paymentIntent = existingPaymentIntent;

  if (!paymentIntent) {
    try {
      paymentIntent = await createPaymentIntent({
        provider: "operator_fake",
        providerEnvironment: "unknown",
        merchantOrderNo,
        moduleSlug: moduleConfig.slug,
        analysisRequestId: record.request.id,
        analysisResultId: record.result.id,
        amountMinor: OPERATOR_FAKE_AMOUNT_MINOR,
        currency: "TWD",
        status: "created",
      });
    } catch {
      return { ok: false, status: 500, error: "payment_intent_create_failed" };
    }
    paymentIntentCreated = true;
  }

  if (paymentIntent.status !== "paid") {
    try {
      paymentIntent =
        (await markPaymentPaid({
          paymentIntentId: paymentIntent.id,
          providerStatus: "operator_fake_paid",
          providerMessageCategory: "operator_fake_success",
        })) ?? paymentIntent;
    } catch {
      return { ok: false, status: 500, error: "payment_intent_transition_failed" };
    }
  }

  const delivery = await createPaidDeliveryArtifactsForPaymentIntent({
    paymentIntent,
    entitlementSource: "operator_test",
    generationJobTriggerSource: "operator",
    operatorTest: true,
    exposeRawPaidAccessToken: true,
  });

  if (!delivery.ok) {
    return delivery;
  }

  let recoveryContactId: string | null = null;

  if (input.recoveryEmail) {
    try {
      const recoveryContact = await createOrUpdateEmailRecoveryContact({
        moduleSlug: moduleConfig.slug,
        analysisResultId: record.result.id,
        paymentIntentId: paymentIntent.id,
        entitlementId: delivery.entitlement.id,
        email: input.recoveryEmail,
        source: "checkout_start",
        status: "bound",
      });
      recoveryContactId = recoveryContact?.id ?? null;
    } catch {
      // Operator smoke recovery contact setup must not fail fake paid delivery.
    }
  }

  const queueTrigger = await triggerPaidJobProcessing({
    paymentIntent,
    generationJob: delivery.generationJob,
    triggerSource: "operator_fake_paid",
  });

  return {
    ok: true,
    moduleSlug: moduleConfig.slug,
    resultId: record.result.id,
    paymentIntent,
    paymentIntentCreated,
    entitlement: delivery.entitlement,
    entitlementCreated: delivery.entitlementCreated,
    generationJob: delivery.generationJob,
    generationJobCreated: delivery.generationJobCreated,
    accessState: delivery.accessState,
    paidAccessToken: delivery.paidAccessToken,
    paidAccessTokenReturned: delivery.paidAccessTokenReturned,
    unlockPath: delivery.unlockPath,
    queueTrigger,
    recoveryContactId,
  };
}
