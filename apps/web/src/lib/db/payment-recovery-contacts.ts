import { and, eq, ne } from "drizzle-orm";
import { requireDb } from "@/lib/db/client";
import { paymentRecoveryContacts } from "@/lib/db/schema";
import {
  assertNoRecoveryBearerToken,
  encryptRecoveryContactValue,
  hashRecoveryContact,
  normalizeRecoveryEmail,
} from "@/lib/payments/recovery-contact-crypto";

export const PAYMENT_RECOVERY_CONTACT_TYPES = ["line", "email"] as const;
export const PAYMENT_RECOVERY_CONTACT_SOURCES = [
  "checkout_start",
  "return_waiting",
  "paid_ready",
  "completed_result",
  "support",
  "operator_test",
] as const;
export const PAYMENT_RECOVERY_CONTACT_STATUSES = [
  "pending",
  "verified",
  "bound",
  "failed",
  "revoked",
] as const;

export type PaymentRecoveryContactType = (typeof PAYMENT_RECOVERY_CONTACT_TYPES)[number];
export type PaymentRecoveryContactSource = (typeof PAYMENT_RECOVERY_CONTACT_SOURCES)[number];
export type PaymentRecoveryContactStatus = (typeof PAYMENT_RECOVERY_CONTACT_STATUSES)[number];
export type PaymentRecoveryContact = typeof paymentRecoveryContacts.$inferSelect;

function assertAllowed<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string,
): asserts value is T {
  if (!allowed.includes(value as T)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

function assertNoBearerTokens(values: Array<string | null | undefined>) {
  for (const value of values) {
    if (value) {
      assertNoRecoveryBearerToken(value);
    }
  }
}

async function getActiveRecoveryContactByResult(input: {
  analysisResultId: string;
  contactType: PaymentRecoveryContactType;
  contactHash: string;
}) {
  const db = requireDb();
  const [record] = await db
    .select()
    .from(paymentRecoveryContacts)
    .where(
      and(
        eq(paymentRecoveryContacts.analysisResultId, input.analysisResultId),
        eq(paymentRecoveryContacts.contactType, input.contactType),
        eq(paymentRecoveryContacts.contactHash, input.contactHash),
        ne(paymentRecoveryContacts.status, "revoked"),
      ),
    )
    .limit(1);

  return record ?? null;
}

async function upsertRecoveryContact(input: {
  moduleSlug: string;
  analysisResultId: string;
  paymentIntentId?: string | null;
  entitlementId?: string | null;
  contactType: PaymentRecoveryContactType;
  contactHash: string;
  contactEncrypted?: string | null;
  lineUserHash?: string | null;
  emailHash?: string | null;
  transactionalConsentAt?: Date;
  marketingOptInAt?: Date | null;
  source: PaymentRecoveryContactSource;
  status?: PaymentRecoveryContactStatus;
}) {
  const existing = await getActiveRecoveryContactByResult(input);
  const db = requireDb();
  const now = new Date();

  if (existing) {
    const [updated] = await db
      .update(paymentRecoveryContacts)
      .set({
        paymentIntentId: input.paymentIntentId ?? existing.paymentIntentId,
        entitlementId: input.entitlementId ?? existing.entitlementId,
        contactEncrypted: input.contactEncrypted ?? existing.contactEncrypted,
        lineUserHash: input.lineUserHash ?? existing.lineUserHash,
        emailHash: input.emailHash ?? existing.emailHash,
        transactionalConsentAt:
          input.transactionalConsentAt ?? existing.transactionalConsentAt,
        marketingOptInAt: input.marketingOptInAt ?? existing.marketingOptInAt,
        source: input.source,
        status: input.status ?? existing.status,
        updatedAt: now,
      })
      .where(eq(paymentRecoveryContacts.id, existing.id))
      .returning();

    return updated ?? existing;
  }

  const [created] = await db
    .insert(paymentRecoveryContacts)
    .values({
      moduleSlug: input.moduleSlug,
      analysisResultId: input.analysisResultId,
      paymentIntentId: input.paymentIntentId ?? null,
      entitlementId: input.entitlementId ?? null,
      contactType: input.contactType,
      contactHash: input.contactHash,
      contactEncrypted: input.contactEncrypted ?? null,
      lineUserHash: input.lineUserHash ?? null,
      emailHash: input.emailHash ?? null,
      transactionalConsentAt: input.transactionalConsentAt ?? now,
      marketingOptInAt: input.marketingOptInAt ?? null,
      source: input.source,
      status: input.status ?? "pending",
      updatedAt: now,
    })
    .returning();

  return created;
}

export async function createOrUpdateEmailRecoveryContact(input: {
  moduleSlug: string;
  analysisResultId: string;
  email: string;
  paymentIntentId?: string | null;
  entitlementId?: string | null;
  transactionalConsentAt?: Date;
  marketingOptInAt?: Date | null;
  source: PaymentRecoveryContactSource;
  status?: PaymentRecoveryContactStatus;
  env?: NodeJS.ProcessEnv;
}) {
  assertAllowed(input.source, PAYMENT_RECOVERY_CONTACT_SOURCES, "recovery contact source");
  assertAllowed(input.status ?? "pending", PAYMENT_RECOVERY_CONTACT_STATUSES, "recovery contact status");
  assertNoBearerTokens([input.email]);

  const normalizedEmail = normalizeRecoveryEmail(input.email);
  const emailHash = hashRecoveryContact({
    value: normalizedEmail,
    contactType: "email",
    env: input.env,
  });
  const contactEncrypted = encryptRecoveryContactValue({
    value: normalizedEmail,
    env: input.env,
  });

  return upsertRecoveryContact({
    moduleSlug: input.moduleSlug,
    analysisResultId: input.analysisResultId,
    paymentIntentId: input.paymentIntentId,
    entitlementId: input.entitlementId,
    contactType: "email",
    contactHash: emailHash,
    contactEncrypted,
    emailHash,
    transactionalConsentAt: input.transactionalConsentAt,
    marketingOptInAt: input.marketingOptInAt,
    source: input.source,
    status: input.status,
  });
}

export async function createOrUpdateLineRecoveryContact(input: {
  moduleSlug: string;
  analysisResultId: string;
  lineUserId: string;
  paymentIntentId?: string | null;
  entitlementId?: string | null;
  transactionalConsentAt?: Date;
  marketingOptInAt?: Date | null;
  source: PaymentRecoveryContactSource;
  status?: PaymentRecoveryContactStatus;
  env?: NodeJS.ProcessEnv;
}) {
  assertAllowed(input.source, PAYMENT_RECOVERY_CONTACT_SOURCES, "recovery contact source");
  assertAllowed(input.status ?? "pending", PAYMENT_RECOVERY_CONTACT_STATUSES, "recovery contact status");
  assertNoBearerTokens([input.lineUserId]);

  const lineUserHash = hashRecoveryContact({
    value: input.lineUserId,
    contactType: "line",
    env: input.env,
  });

  return upsertRecoveryContact({
    moduleSlug: input.moduleSlug,
    analysisResultId: input.analysisResultId,
    paymentIntentId: input.paymentIntentId,
    entitlementId: input.entitlementId,
    contactType: "line",
    contactHash: lineUserHash,
    lineUserHash,
    transactionalConsentAt: input.transactionalConsentAt,
    marketingOptInAt: input.marketingOptInAt,
    source: input.source,
    status: input.status,
  });
}

export async function getPaymentRecoveryContactsByPaymentIntentId(paymentIntentId: string) {
  const db = requireDb();

  return db
    .select()
    .from(paymentRecoveryContacts)
    .where(eq(paymentRecoveryContacts.paymentIntentId, paymentIntentId));
}

export async function getPaymentRecoveryContactsByEntitlementId(entitlementId: string) {
  const db = requireDb();

  return db
    .select()
    .from(paymentRecoveryContacts)
    .where(eq(paymentRecoveryContacts.entitlementId, entitlementId));
}

export async function getPaymentRecoveryContactsByResultId(analysisResultId: string) {
  const db = requireDb();

  return db
    .select()
    .from(paymentRecoveryContacts)
    .where(eq(paymentRecoveryContacts.analysisResultId, analysisResultId));
}

export async function bindRecoveryContactsToEntitlement(input: {
  paymentIntentId: string;
  entitlementId: string;
}) {
  const db = requireDb();
  const now = new Date();

  return db
    .update(paymentRecoveryContacts)
    .set({
      entitlementId: input.entitlementId,
      status: "bound",
      updatedAt: now,
    })
    .where(eq(paymentRecoveryContacts.paymentIntentId, input.paymentIntentId))
    .returning();
}

export async function markPaymentRecoveryContactStatus(input: {
  recoveryContactId: string;
  status: PaymentRecoveryContactStatus;
}) {
  assertAllowed(input.status, PAYMENT_RECOVERY_CONTACT_STATUSES, "recovery contact status");

  const db = requireDb();
  const [record] = await db
    .update(paymentRecoveryContacts)
    .set({
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(paymentRecoveryContacts.id, input.recoveryContactId))
    .returning();

  return record ?? null;
}

export async function recordPaymentRecoveryMarketingOptIn(input: {
  recoveryContactId: string;
  marketingOptInAt?: Date;
}) {
  const db = requireDb();
  const [record] = await db
    .update(paymentRecoveryContacts)
    .set({
      marketingOptInAt: input.marketingOptInAt ?? new Date(),
      updatedAt: new Date(),
    })
    .where(eq(paymentRecoveryContacts.id, input.recoveryContactId))
    .returning();

  return record ?? null;
}
