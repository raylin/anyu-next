import crypto from "node:crypto";
import {
  createPaymentIntent,
  getPaymentIntentByMerchantOrderNo,
  markPaymentCheckoutStarted,
  type PaymentIntent,
} from "@/lib/db/payment-intents";
import { getAnalysisResultWithRequestById } from "@/lib/db/runtime";
import type { ProductModuleConfig } from "@/lib/modules/types";
import { buildNewebPayCheckoutContract } from "@/lib/payments/newebpay/checkout-payload";
import { getNewebPayConfig } from "@/lib/payments/newebpay/config";
import { createPaymentCheckoutSessionToken } from "@/lib/payments/payment-checkout-session";

const MODULE_01_PRICE_MINOR = 49;

export type CreateNewebPayCheckoutResult =
  | {
      ok: true;
      paymentIntent: PaymentIntent;
      paymentIntentCreated: boolean;
      checkoutContract: ReturnType<typeof buildNewebPayCheckoutContract>;
    }
  | {
      ok: false;
      status: 404 | 500 | 503;
      error:
        | "source_result_not_found"
        | "missing_newebpay_config"
        | "invalid_newebpay_config"
        | "payment_checkout_session_config_missing"
        | "payment_intent_create_failed"
        | "payment_intent_update_failed";
      missingConfig?: string[];
    };

function buildMerchantOrderNo(input: {
  moduleSlug: string;
  resultId: string;
  idempotencyKey?: string | null;
}) {
  const idempotencyPart = input.idempotencyKey?.trim() || input.resultId;
  const digest = crypto
    .createHash("sha256")
    .update(`${input.moduleSlug}:${idempotencyPart}`)
    .digest("hex")
    .slice(0, 24)
    .toUpperCase();

  return `ANYUNP${digest}`;
}

export async function createNewebPayCheckout(input: {
  moduleConfig: ProductModuleConfig;
  resultId: string;
  idempotencyKey?: string | null;
  env?: NodeJS.ProcessEnv;
}): Promise<CreateNewebPayCheckoutResult> {
  const record = await getAnalysisResultWithRequestById(
    input.resultId,
    input.moduleConfig.moduleId,
    input.moduleConfig.slug,
  );

  if (!record) {
    return { ok: false, status: 404, error: "source_result_not_found" };
  }

  const config = getNewebPayConfig(input.env);

  if (!config.ok) {
    return {
      ok: false,
      status: 503,
      error: config.error,
      missingConfig: config.missing,
    };
  }

  const merchantOrderNo = buildMerchantOrderNo({
    moduleSlug: input.moduleConfig.slug,
    resultId: input.resultId,
    idempotencyKey: input.idempotencyKey,
  });
  const checkoutSession = createPaymentCheckoutSessionToken({
    moduleSlug: input.moduleConfig.slug,
    merchantOrderNo,
    env: input.env,
  });

  if (!checkoutSession.ok) {
    return {
      ok: false,
      status: 503,
      error: "payment_checkout_session_config_missing",
    };
  }

  let paymentIntent = await getPaymentIntentByMerchantOrderNo(merchantOrderNo);
  let paymentIntentCreated = false;

  if (!paymentIntent) {
    try {
      paymentIntent = await createPaymentIntent({
        provider: "newebpay",
        providerEnvironment: config.providerEnvironment,
        merchantOrderNo,
        moduleSlug: input.moduleConfig.slug,
        analysisRequestId: record.request.id,
        analysisResultId: record.result.id,
        amountMinor: MODULE_01_PRICE_MINOR,
        currency: "TWD",
        status: "created",
      });
      paymentIntentCreated = true;
    } catch {
      return { ok: false, status: 500, error: "payment_intent_create_failed" };
    }
  }

  if (paymentIntent.status === "created") {
    try {
      paymentIntent =
        (await markPaymentCheckoutStarted({ paymentIntentId: paymentIntent.id })) ??
        paymentIntent;
    } catch {
      return { ok: false, status: 500, error: "payment_intent_update_failed" };
    }
  }

  const returnUrl = `${config.returnUrlBase}/payment/newebpay/return?merchantOrderNo=${encodeURIComponent(
    merchantOrderNo,
  )}&checkoutToken=${encodeURIComponent(
    checkoutSession.token,
  )}`;

  return {
    ok: true,
    paymentIntent,
    paymentIntentCreated,
    checkoutContract: buildNewebPayCheckoutContract({
      config,
      merchantOrderNo,
      amountMinor: MODULE_01_PRICE_MINOR,
      itemDescription: "ANYU ambiguous temperature full analysis",
      returnUrl,
    }),
  };
}
