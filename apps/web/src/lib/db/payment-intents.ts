import { eq } from "drizzle-orm";
import { requireDb } from "@/lib/db/client";
import { paymentIntents } from "@/lib/db/schema";

export const PAYMENT_PROVIDERS = ["newebpay"] as const;
export const PAYMENT_PROVIDER_ENVIRONMENTS = [
  "production",
  "staging",
  "sandbox",
  "unknown",
] as const;
export const PAYMENT_INTENT_STATUSES = [
  "created",
  "checkout_started",
  "paid",
  "failed",
  "cancelled",
  "expired",
  "refund_pending",
  "refunded",
] as const;

export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];
export type PaymentProviderEnvironment = (typeof PAYMENT_PROVIDER_ENVIRONMENTS)[number];
export type PaymentIntentStatus = (typeof PAYMENT_INTENT_STATUSES)[number];
export type PaymentIntent = typeof paymentIntents.$inferSelect;

function assertAllowed<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string,
): asserts value is T {
  if (!allowed.includes(value as T)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

export async function createPaymentIntent(input: {
  provider: PaymentProvider;
  providerEnvironment?: PaymentProviderEnvironment;
  merchantOrderNo: string;
  moduleSlug: string;
  analysisRequestId: string;
  analysisResultId: string;
  unlockIntentId?: string | null;
  amountMinor: number;
  currency?: string;
  status?: PaymentIntentStatus;
  expiresAt?: Date | null;
}) {
  assertAllowed(input.provider, PAYMENT_PROVIDERS, "payment provider");
  assertAllowed(
    input.providerEnvironment ?? "unknown",
    PAYMENT_PROVIDER_ENVIRONMENTS,
    "payment provider environment",
  );
  assertAllowed(input.status ?? "created", PAYMENT_INTENT_STATUSES, "payment intent status");

  const db = requireDb();
  const now = new Date();
  const [record] = await db
    .insert(paymentIntents)
    .values({
      provider: input.provider,
      providerEnvironment: input.providerEnvironment ?? "unknown",
      merchantOrderNo: input.merchantOrderNo,
      moduleSlug: input.moduleSlug,
      analysisRequestId: input.analysisRequestId,
      analysisResultId: input.analysisResultId,
      unlockIntentId: input.unlockIntentId ?? null,
      amountMinor: input.amountMinor,
      currency: input.currency ?? "TWD",
      status: input.status ?? "created",
      expiresAt: input.expiresAt ?? null,
      updatedAt: now,
    })
    .returning();

  return record;
}

export async function getPaymentIntentById(id: string) {
  const db = requireDb();
  const [record] = await db
    .select()
    .from(paymentIntents)
    .where(eq(paymentIntents.id, id))
    .limit(1);

  return record ?? null;
}

export async function getPaymentIntentByMerchantOrderNo(merchantOrderNo: string) {
  const db = requireDb();
  const [record] = await db
    .select()
    .from(paymentIntents)
    .where(eq(paymentIntents.merchantOrderNo, merchantOrderNo))
    .limit(1);

  return record ?? null;
}

async function markPaymentIntentStatus(input: {
  paymentIntentId: string;
  status: PaymentIntentStatus;
  atField:
    | "checkoutStartedAt"
    | "paidAt"
    | "failedAt"
    | "cancelledAt"
    | "expiredAt"
    | "refundRequestedAt"
    | "refundedAt";
  at?: Date;
  providerStatus?: string | null;
  providerTradeNo?: string | null;
  providerPaymentType?: string | null;
  providerResponseCode?: string | null;
  providerMessageCategory?: string | null;
  notifyReceivedAt?: Date | null;
  returnReceivedAt?: Date | null;
}) {
  assertAllowed(input.status, PAYMENT_INTENT_STATUSES, "payment intent status");

  const db = requireDb();
  const now = new Date();
  const eventAt = input.at ?? now;
  const [record] = await db
    .update(paymentIntents)
    .set({
      status: input.status,
      [input.atField]: eventAt,
      providerStatus: input.providerStatus ?? undefined,
      providerTradeNo: input.providerTradeNo ?? undefined,
      providerPaymentType: input.providerPaymentType ?? undefined,
      providerResponseCode: input.providerResponseCode ?? undefined,
      providerMessageCategory: input.providerMessageCategory ?? undefined,
      notifyReceivedAt: input.notifyReceivedAt ?? undefined,
      returnReceivedAt: input.returnReceivedAt ?? undefined,
      updatedAt: now,
    })
    .where(eq(paymentIntents.id, input.paymentIntentId))
    .returning();

  return record ?? null;
}

export function markPaymentCheckoutStarted(input: { paymentIntentId: string; at?: Date }) {
  return markPaymentIntentStatus({
    paymentIntentId: input.paymentIntentId,
    status: "checkout_started",
    atField: "checkoutStartedAt",
    at: input.at,
  });
}

export function markPaymentPaid(input: {
  paymentIntentId: string;
  paidAt?: Date;
  providerStatus?: string | null;
  providerTradeNo?: string | null;
  providerPaymentType?: string | null;
  providerResponseCode?: string | null;
  providerMessageCategory?: string | null;
  notifyReceivedAt?: Date | null;
  returnReceivedAt?: Date | null;
}) {
  return markPaymentIntentStatus({
    ...input,
    status: "paid",
    atField: "paidAt",
    at: input.paidAt,
  });
}

export function markPaymentFailed(input: {
  paymentIntentId: string;
  failedAt?: Date;
  providerStatus?: string | null;
  providerResponseCode?: string | null;
  providerMessageCategory?: string | null;
}) {
  return markPaymentIntentStatus({
    ...input,
    status: "failed",
    atField: "failedAt",
    at: input.failedAt,
  });
}

export function markPaymentCancelled(input: { paymentIntentId: string; cancelledAt?: Date }) {
  return markPaymentIntentStatus({
    paymentIntentId: input.paymentIntentId,
    status: "cancelled",
    atField: "cancelledAt",
    at: input.cancelledAt,
  });
}

export function markPaymentExpired(input: { paymentIntentId: string; expiredAt?: Date }) {
  return markPaymentIntentStatus({
    paymentIntentId: input.paymentIntentId,
    status: "expired",
    atField: "expiredAt",
    at: input.expiredAt,
  });
}

export function markPaymentRefundPending(input: {
  paymentIntentId: string;
  refundRequestedAt?: Date;
}) {
  return markPaymentIntentStatus({
    paymentIntentId: input.paymentIntentId,
    status: "refund_pending",
    atField: "refundRequestedAt",
    at: input.refundRequestedAt,
  });
}

export function markPaymentRefunded(input: { paymentIntentId: string; refundedAt?: Date }) {
  return markPaymentIntentStatus({
    paymentIntentId: input.paymentIntentId,
    status: "refunded",
    atField: "refundedAt",
    at: input.refundedAt,
  });
}
