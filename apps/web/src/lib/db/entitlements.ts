import { eq } from "drizzle-orm";
import { requireDb } from "@/lib/db/client";
import { entitlements } from "@/lib/db/schema";
import {
  generatePaidAccessToken,
  hashPaidAccessToken,
} from "@/lib/payments/paid-access-token";

export const ENTITLEMENT_TYPES = [
  "single_paid_analysis",
  "future_relationship_pack",
  "future_observation_pass",
] as const;
export const ENTITLEMENT_SOURCES = [
  "payment_single",
  "line_first_free",
  "operator_test",
  "future_pack",
  "future_promo",
] as const;
export const ENTITLEMENT_STATUSES = [
  "active",
  "consumed",
  "expired",
  "revoked",
  "refunded",
] as const;

export type EntitlementType = (typeof ENTITLEMENT_TYPES)[number];
export type EntitlementSource = (typeof ENTITLEMENT_SOURCES)[number];
export type EntitlementStatus = (typeof ENTITLEMENT_STATUSES)[number];
export type Entitlement = typeof entitlements.$inferSelect;

function assertAllowed<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string,
): asserts value is T {
  if (!allowed.includes(value as T)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

export async function createPaymentSingleEntitlement(input: {
  moduleSlug: string;
  analysisRequestId: string;
  analysisResultId: string;
  paymentIntentId: string;
  source?: EntitlementSource;
  unlockIntentId?: string | null;
  generationJobId?: string | null;
  lineUserRef?: string | null;
  paidAccessTokenExpiresAt?: Date | null;
  expiresAt?: Date | null;
  activatedAt?: Date | null;
  env?: NodeJS.ProcessEnv;
}) {
  assertAllowed(input.source ?? "payment_single", ENTITLEMENT_SOURCES, "entitlement source");

  const paidAccessToken = generatePaidAccessToken();
  const paidAccessTokenHash = hashPaidAccessToken(paidAccessToken, input.env);
  const db = requireDb();
  const now = new Date();
  const [entitlement] = await db
    .insert(entitlements)
    .values({
      entitlementType: "single_paid_analysis",
      source: input.source ?? "payment_single",
      status: "active",
      moduleSlug: input.moduleSlug,
      analysisRequestId: input.analysisRequestId,
      analysisResultId: input.analysisResultId,
      paymentIntentId: input.paymentIntentId,
      unlockIntentId: input.unlockIntentId ?? null,
      generationJobId: input.generationJobId ?? null,
      lineUserRef: input.lineUserRef ?? null,
      paidAccessTokenHash,
      paidAccessTokenExpiresAt: input.paidAccessTokenExpiresAt ?? null,
      paidAccessTokenLastRotatedAt: now,
      remainingUses: null,
      expiresAt: input.expiresAt ?? null,
      activatedAt: input.activatedAt ?? now,
      updatedAt: now,
    })
    .returning();

  return { entitlement, paidAccessToken };
}

export async function getEntitlementById(id: string) {
  const db = requireDb();
  const [record] = await db
    .select()
    .from(entitlements)
    .where(eq(entitlements.id, id))
    .limit(1);

  return record ?? null;
}

export async function getEntitlementByPaymentIntentId(paymentIntentId: string) {
  const db = requireDb();
  const [record] = await db
    .select()
    .from(entitlements)
    .where(eq(entitlements.paymentIntentId, paymentIntentId))
    .limit(1);

  return record ?? null;
}

export async function getEntitlementByPaidAccessToken(
  rawToken: string,
  env?: NodeJS.ProcessEnv,
) {
  const db = requireDb();
  const [record] = await db
    .select()
    .from(entitlements)
    .where(eq(entitlements.paidAccessTokenHash, hashPaidAccessToken(rawToken, env)))
    .limit(1);

  return record ?? null;
}

async function markEntitlementStatus(input: {
  entitlementId: string;
  status: EntitlementStatus;
  atField: "refundedAt" | "revokedAt" | "expiresAt";
  at?: Date;
}) {
  assertAllowed(input.status, ENTITLEMENT_STATUSES, "entitlement status");

  const db = requireDb();
  const now = new Date();
  const [record] = await db
    .update(entitlements)
    .set({
      status: input.status,
      [input.atField]: input.at ?? now,
      updatedAt: now,
    })
    .where(eq(entitlements.id, input.entitlementId))
    .returning();

  return record ?? null;
}

export function markEntitlementRefunded(input: { entitlementId: string; refundedAt?: Date }) {
  return markEntitlementStatus({
    entitlementId: input.entitlementId,
    status: "refunded",
    atField: "refundedAt",
    at: input.refundedAt,
  });
}

export function markEntitlementRevoked(input: { entitlementId: string; revokedAt?: Date }) {
  return markEntitlementStatus({
    entitlementId: input.entitlementId,
    status: "revoked",
    atField: "revokedAt",
    at: input.revokedAt,
  });
}

export function markEntitlementExpired(input: { entitlementId: string; expiredAt?: Date }) {
  return markEntitlementStatus({
    entitlementId: input.entitlementId,
    status: "expired",
    atField: "expiresAt",
    at: input.expiredAt,
  });
}

export async function rotatePaidAccessToken(input: {
  entitlementId: string;
  paidAccessTokenExpiresAt?: Date | null;
  env?: NodeJS.ProcessEnv;
}) {
  const paidAccessToken = generatePaidAccessToken();
  const paidAccessTokenHash = hashPaidAccessToken(paidAccessToken, input.env);
  const db = requireDb();
  const now = new Date();
  const [entitlement] = await db
    .update(entitlements)
    .set({
      paidAccessTokenHash,
      paidAccessTokenExpiresAt: input.paidAccessTokenExpiresAt ?? undefined,
      paidAccessTokenLastRotatedAt: now,
      updatedAt: now,
    })
    .where(eq(entitlements.id, input.entitlementId))
    .returning();

  return { entitlement: entitlement ?? null, paidAccessToken };
}
