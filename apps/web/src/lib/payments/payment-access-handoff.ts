import {
  PAID_RESULT_PROMPT_VERSION,
  PAID_RESULT_SCHEMA_VERSION,
} from "@/lib/ai/paid-result-generation";
import { getEntitlementByPaymentIntentId, type Entitlement } from "@/lib/db/entitlements";
import {
  buildPaidAnalysisJobDedupeKey,
  getGenerationJobByDedupeKey,
  type GenerationJob,
} from "@/lib/db/generation-jobs";
import { getPaidResultForAnalysisResult } from "@/lib/db/paid-results";
import { getPaymentIntentByMerchantOrderNo, type PaymentIntent } from "@/lib/db/payment-intents";
import { getAnalysisResultWithRequestById } from "@/lib/db/runtime";
import { getModuleBySlug } from "@/lib/modules/registry";
import {
  resolvePaymentCheckoutSessionToken,
  type PaymentCheckoutSessionResolution,
} from "@/lib/payments/payment-checkout-session";

export type PaymentAccessHandoffState =
  | "waiting_for_payment"
  | "paid_processing"
  | "paid_ready"
  | "paid_failed"
  | "expired"
  | "invalid_session";

export type PaymentAccessHandoffResolution =
  | {
      ok: true;
      state: Exclude<PaymentAccessHandoffState, "invalid_session" | "expired">;
      moduleSlug: string;
      paymentIntent: PaymentIntent;
      entitlement?: Entitlement | null;
      accessPath: string | null;
      retryable: boolean;
      record?: NonNullable<Awaited<ReturnType<typeof getAnalysisResultWithRequestById>>>;
      storedPaidResult?: Awaited<ReturnType<typeof getPaidResultForAnalysisResult>>;
      generationJob?: GenerationJob | null;
    }
  | {
      ok: false;
      state: "invalid_session" | "expired";
      errorCategory: "invalid_session" | "expired" | "config_unavailable" | "module_not_found";
    };

function mapSessionError(
  session: Extract<PaymentCheckoutSessionResolution, { ok: false }>,
): PaymentAccessHandoffResolution {
  if (session.error === "expired") {
    return { ok: false, state: "expired", errorCategory: "expired" };
  }

  if (session.error === "missing_config") {
    return { ok: false, state: "invalid_session", errorCategory: "config_unavailable" };
  }

  return { ok: false, state: "invalid_session", errorCategory: "invalid_session" };
}

async function getPaidGenerationJob(input: { moduleSlug: string; analysisResultId: string }) {
  try {
    return await getGenerationJobByDedupeKey(
      buildPaidAnalysisJobDedupeKey({
        moduleSlug: input.moduleSlug,
        analysisResultId: input.analysisResultId,
        promptVersion: PAID_RESULT_PROMPT_VERSION,
        schemaVersion: PAID_RESULT_SCHEMA_VERSION,
      }),
    );
  } catch {
    return null;
  }
}

function isPaymentTerminalFailure(status: string) {
  return (
    status === "failed" ||
    status === "cancelled" ||
    status === "expired" ||
    status === "refund_pending" ||
    status === "refunded"
  );
}

export async function resolvePaymentAccessHandoff(input: {
  moduleSlug: string;
  checkoutToken: string;
  env?: NodeJS.ProcessEnv;
  now?: Date;
}): Promise<PaymentAccessHandoffResolution> {
  const session = resolvePaymentCheckoutSessionToken({
    token: input.checkoutToken,
    env: input.env,
    now: input.now,
  });

  if (!session.ok) {
    return mapSessionError(session);
  }

  if (session.payload.moduleSlug !== input.moduleSlug) {
    return { ok: false, state: "invalid_session", errorCategory: "module_not_found" };
  }

  const moduleConfig = getModuleBySlug(input.moduleSlug);

  if (!moduleConfig) {
    return { ok: false, state: "invalid_session", errorCategory: "module_not_found" };
  }

  const paymentIntent = await getPaymentIntentByMerchantOrderNo(session.payload.merchantOrderNo);

  if (!paymentIntent || paymentIntent.moduleSlug !== moduleConfig.slug) {
    return { ok: false, state: "invalid_session", errorCategory: "invalid_session" };
  }

  if (paymentIntent.status !== "paid") {
    return {
      ok: true,
      state: isPaymentTerminalFailure(paymentIntent.status)
        ? "paid_failed"
        : "waiting_for_payment",
      moduleSlug: moduleConfig.slug,
      paymentIntent,
      entitlement: null,
      accessPath: null,
      retryable: !isPaymentTerminalFailure(paymentIntent.status),
    };
  }

  const entitlement = await getEntitlementByPaymentIntentId(paymentIntent.id);

  if (!entitlement) {
    return {
      ok: true,
      state: "paid_processing",
      moduleSlug: moduleConfig.slug,
      paymentIntent,
      entitlement: null,
      accessPath: null,
      retryable: true,
    };
  }

  const record = await getAnalysisResultWithRequestById(
    entitlement.analysisResultId,
    moduleConfig.moduleId,
    moduleConfig.slug,
  );

  if (!record) {
    return {
      ok: true,
      state: "paid_failed",
      moduleSlug: moduleConfig.slug,
      paymentIntent,
      entitlement,
      accessPath: null,
      retryable: false,
    };
  }

  const currentPaidResult = await getPaidResultForAnalysisResult({
    analysisResultId: entitlement.analysisResultId,
    promptVersion: PAID_RESULT_PROMPT_VERSION,
    schemaVersion: PAID_RESULT_SCHEMA_VERSION,
  });
  const storedPaidResult =
    currentPaidResult ??
    (await getPaidResultForAnalysisResult({
      analysisResultId: entitlement.analysisResultId,
      status: "completed",
    }));
  const generationJob = await getPaidGenerationJob({
    moduleSlug: moduleConfig.slug,
    analysisResultId: entitlement.analysisResultId,
  });

  if (storedPaidResult?.status === "completed" && storedPaidResult.paidResultJson) {
    return {
      ok: true,
      state: "paid_ready",
      moduleSlug: moduleConfig.slug,
      paymentIntent,
      entitlement,
      accessPath: `/m/${moduleConfig.slug}/payment/access?checkoutToken=${encodeURIComponent(
        input.checkoutToken,
      )}`,
      retryable: false,
      record,
      storedPaidResult,
      generationJob,
    };
  }

  if (storedPaidResult?.status === "failed" || generationJob?.status === "failed_final") {
    return {
      ok: true,
      state: "paid_failed",
      moduleSlug: moduleConfig.slug,
      paymentIntent,
      entitlement,
      accessPath: null,
      retryable: false,
      record,
      storedPaidResult,
      generationJob,
    };
  }

  return {
    ok: true,
    state: "paid_processing",
    moduleSlug: moduleConfig.slug,
    paymentIntent,
    entitlement,
    accessPath: null,
    retryable: true,
    record,
    storedPaidResult,
    generationJob,
  };
}
