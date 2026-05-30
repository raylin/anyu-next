import {
  getPaymentIntentByMerchantOrderNo,
  markPaymentPaid,
  type PaymentIntent,
} from "@/lib/db/payment-intents";
import { getNewebPayConfig } from "@/lib/payments/newebpay/config";
import {
  verifyNewebPayNotifyPayload,
  type VerifiedNewebPayNotify,
} from "@/lib/payments/newebpay/notify-verification";
import {
  createPaidDeliveryArtifactsForPaymentIntent,
  type PaidDeliveryArtifactError,
  type PaidDeliveryArtifactsResult,
} from "@/lib/payments/paid-delivery-artifacts";
import {
  triggerPaidJobProcessing,
  type PaidJobQueueTriggerResult,
} from "@/lib/payments/paid-job-queue-trigger";

export type NewebPayNotifyCategory =
  | "provider_config_missing"
  | "malformed_payload"
  | "signature_missing"
  | "signature_invalid"
  | "trade_info_decrypt_failed"
  | "merchant_mismatch"
  | "amount_mismatch"
  | "order_not_found"
  | "payment_intent_not_found"
  | "payment_not_success"
  | "duplicate_notify"
  | PaidDeliveryArtifactError
  | "unexpected_error";

export type ProcessNewebPayNotifyResult =
  | {
      ok: true;
      category: "payment_marked_paid" | "duplicate_notify";
      paymentIntent: PaymentIntent;
      paymentIntentStatus: string;
      delivery: Extract<PaidDeliveryArtifactsResult, { ok: true }>;
      queueTrigger: PaidJobQueueTriggerResult;
    }
  | {
      ok: false;
      status: 400 | 404 | 409 | 500 | 503;
      category: NewebPayNotifyCategory;
      missingConfig?: string[];
    };

const PAID_INTENT_INPUT_STATUSES = new Set(["created", "checkout_started"]);

function isProviderSuccess(event: VerifiedNewebPayNotify) {
  return event.status === "SUCCESS" && (!event.responseCode || event.responseCode === "00");
}

async function createNewebPayDelivery(paymentIntent: PaymentIntent) {
  return createPaidDeliveryArtifactsForPaymentIntent({
    paymentIntent,
    entitlementSource: "payment_single",
    generationJobTriggerSource: "payment_success_future",
    operatorTest: false,
    exposeRawPaidAccessToken: false,
  });
}

function deliveryFailure(
  delivery: Extract<PaidDeliveryArtifactsResult, { ok: false }>,
): Extract<ProcessNewebPayNotifyResult, { ok: false }> {
  return {
    ok: false,
    status: delivery.status,
    category: delivery.error,
  };
}

export async function processNewebPayNotify(
  payload: FormData | Record<string, string | undefined>,
  env: NodeJS.ProcessEnv = process.env,
): Promise<ProcessNewebPayNotifyResult> {
  const config = getNewebPayConfig(env);

  if (!config.ok) {
    return {
      ok: false,
      status: 503,
      category: "provider_config_missing",
      missingConfig: config.missing,
    };
  }

  const verification = verifyNewebPayNotifyPayload(payload, config);

  if (!verification.ok) {
    return { ok: false, status: 400, category: verification.error };
  }

  const event = verification.event;
  const paymentIntent = await getPaymentIntentByMerchantOrderNo(event.merchantOrderNo);

  if (!paymentIntent) {
    return { ok: false, status: 404, category: "payment_intent_not_found" };
  }

  if (paymentIntent.provider !== "newebpay") {
    return { ok: false, status: 404, category: "order_not_found" };
  }

  if (paymentIntent.amountMinor !== event.amountMinor || paymentIntent.currency !== "TWD") {
    return { ok: false, status: 409, category: "amount_mismatch" };
  }

  if (!isProviderSuccess(event)) {
    return { ok: false, status: 409, category: "payment_not_success" };
  }

  if (paymentIntent.status === "paid") {
    const delivery = await createNewebPayDelivery(paymentIntent);

    if (!delivery.ok) {
      return deliveryFailure(delivery);
    }

    const queueTrigger = await triggerPaidJobProcessing({
      paymentIntent,
      generationJob: delivery.generationJob,
      triggerSource: "newebpay_notify",
      env,
    });

    return {
      ok: true,
      category: "duplicate_notify",
      paymentIntent,
      paymentIntentStatus: paymentIntent.status,
      delivery,
      queueTrigger,
    };
  }

  if (!PAID_INTENT_INPUT_STATUSES.has(paymentIntent.status)) {
    return { ok: false, status: 409, category: "payment_not_success" };
  }

  try {
    const paidIntent = await markPaymentPaid({
      paymentIntentId: paymentIntent.id,
      paidAt: event.paidAt ?? undefined,
      providerStatus: event.status,
      providerTradeNo: event.tradeNo,
      providerPaymentType: event.paymentType,
      providerResponseCode: event.responseCode,
      providerMessageCategory: event.messageCategory,
      notifyReceivedAt: new Date(),
    });

    if (!paidIntent) {
      return { ok: false, status: 404, category: "payment_intent_not_found" };
    }

    const delivery = await createNewebPayDelivery(paidIntent);

    if (!delivery.ok) {
      return deliveryFailure(delivery);
    }

    const queueTrigger = await triggerPaidJobProcessing({
      paymentIntent: paidIntent,
      generationJob: delivery.generationJob,
      triggerSource: "newebpay_notify",
      env,
    });

    return {
      ok: true,
      category: "payment_marked_paid",
      paymentIntent: paidIntent,
      paymentIntentStatus: paidIntent.status,
      delivery,
      queueTrigger,
    };
  } catch {
    return { ok: false, status: 500, category: "unexpected_error" };
  }
}
