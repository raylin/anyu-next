import {
  PAID_RESULT_PROMPT_VERSION,
  PAID_RESULT_SCHEMA_VERSION,
} from "@/lib/ai/paid-result-generation";
import {
  createOrReusePaidAnalysisJob,
  type GenerationJob,
} from "@/lib/db/generation-jobs";
import {
  createPaymentSingleEntitlement,
  getEntitlementByPaymentIntentId,
  type Entitlement,
} from "@/lib/db/entitlements";
import {
  createPaymentIntent,
  getPaymentIntentByMerchantOrderNo,
  markPaymentPaid,
  type PaymentIntent,
} from "@/lib/db/payment-intents";
import { getAnalysisResultWithRequestById } from "@/lib/db/runtime";
import { resolvePaidAccessToken, type PaidAccessResolutionState } from "@/lib/payments/paid-access-resolver";
import { getModuleBySlug } from "@/lib/modules/registry";

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
    }
  | {
      ok: false;
      status: 404 | 409 | 500;
      error: "module_not_found" | "result_not_found" | "entitlement_unavailable";
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
  let paymentIntentCreated = false;
  let paymentIntent =
    existingPaymentIntent ??
    (await createPaymentIntent({
      provider: "operator_fake",
      providerEnvironment: "unknown",
      merchantOrderNo,
      moduleSlug: moduleConfig.slug,
      analysisRequestId: record.request.id,
      analysisResultId: record.result.id,
      amountMinor: OPERATOR_FAKE_AMOUNT_MINOR,
      currency: "TWD",
      status: "created",
    }));

  if (!existingPaymentIntent) {
    paymentIntentCreated = true;
  }

  if (paymentIntent.status !== "paid") {
    paymentIntent =
      (await markPaymentPaid({
        paymentIntentId: paymentIntent.id,
        providerStatus: "operator_fake_paid",
        providerMessageCategory: "operator_fake_success",
      })) ?? paymentIntent;
  }

  const existingEntitlement = await getEntitlementByPaymentIntentId(paymentIntent.id);
  let entitlementCreated = false;
  let paidAccessToken: string | null = null;
  let entitlement = existingEntitlement;

  if (!entitlement) {
    const created = await createPaymentSingleEntitlement({
      moduleSlug: moduleConfig.slug,
      analysisRequestId: record.request.id,
      analysisResultId: record.result.id,
      paymentIntentId: paymentIntent.id,
      source: "operator_test",
      activatedAt: new Date(),
    });
    entitlement = created.entitlement;
    paidAccessToken = created.paidAccessToken;
    entitlementCreated = true;
  }

  if (!entitlement) {
    return { ok: false, status: 500, error: "entitlement_unavailable" };
  }

  const generationJobResult = await createOrReusePaidAnalysisJob({
    moduleSlug: moduleConfig.slug,
    analysisResultId: record.result.id,
    triggerSource: "operator",
    entitlementRefId: entitlement.id,
    promptVersion: PAID_RESULT_PROMPT_VERSION,
    schemaVersion: PAID_RESULT_SCHEMA_VERSION,
    operatorTest: true,
  });
  let accessState: Exclude<PaidAccessResolutionState, "not_found"> = "pending";

  if (paidAccessToken) {
    const resolution = await resolvePaidAccessToken({
      moduleSlug: moduleConfig.slug,
      rawToken: paidAccessToken,
    });

    if (resolution.ok) {
      accessState = resolution.state;
    }
  } else if (generationJobResult.job.status === "processing") {
    accessState = "processing";
  } else if (generationJobResult.job.status === "failed_final") {
    accessState = "failed";
  }

  return {
    ok: true,
    moduleSlug: moduleConfig.slug,
    resultId: record.result.id,
    paymentIntent,
    paymentIntentCreated,
    entitlement,
    entitlementCreated,
    generationJob: generationJobResult.job,
    generationJobCreated: generationJobResult.created,
    accessState,
    paidAccessToken,
    paidAccessTokenReturned: Boolean(paidAccessToken),
    unlockPath: paidAccessToken
      ? `/m/${moduleConfig.slug}/unlock/${encodeURIComponent(paidAccessToken)}`
      : null,
  };
}
