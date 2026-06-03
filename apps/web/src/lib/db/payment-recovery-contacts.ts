import { and, eq, ne } from "drizzle-orm";
import { requireDb } from "@/lib/db/client";
import { paymentRecoveryContacts } from "@/lib/db/schema";
import {
  assertNoRecoveryBearerToken,
  decryptRecoveryContactValue,
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
export type PaymentRecoveryContactSummaryStatus = PaymentRecoveryContactStatus | "none";
export type PaymentRecoveryPostPaymentAction =
  | "none"
  | "confirm_saved"
  | "suggest_email_save"
  | "suggest_line_save_later"
  | "retry_email"
  | "add_backup";

export type PaymentRecoveryStatusSummary = {
  hasRecoveryContact: boolean;
  hasEmailRecovery: boolean;
  hasLineRecovery: boolean;
  emailStatus: PaymentRecoveryContactSummaryStatus;
  lineStatus: PaymentRecoveryContactSummaryStatus;
  transactionalConsentPresent: boolean;
  marketingOptInPresent: boolean;
  recommendedPostPaymentAction: PaymentRecoveryPostPaymentAction;
  safeDisplayContact: {
    type: "email";
    maskedValue: string;
  } | null;
};

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

function isActiveRecoveryStatus(status: string | null | undefined) {
  return status !== "failed" && status !== "revoked";
}

function getStatusRank(status: PaymentRecoveryContactStatus) {
  switch (status) {
    case "bound":
      return 5;
    case "verified":
      return 4;
    case "pending":
      return 3;
    case "failed":
      return 2;
    case "revoked":
      return 1;
  }
}

function pickBestStatus(records: PaymentRecoveryContact[]): PaymentRecoveryContactSummaryStatus {
  const statuses = records
    .map((record) => record.status)
    .filter((status): status is PaymentRecoveryContactStatus =>
      PAYMENT_RECOVERY_CONTACT_STATUSES.includes(status as PaymentRecoveryContactStatus),
    );

  if (statuses.length === 0) {
    return "none";
  }

  return statuses.reduce((best, status) =>
    getStatusRank(status) > getStatusRank(best) ? status : best,
  );
}

function maskRecoveryEmail(email: string) {
  const normalized = normalizeRecoveryEmail(email);
  const [localPart, domainPart] = normalized.split("@");

  if (!localPart || !domainPart) {
    return null;
  }

  const [domainName, ...domainSuffix] = domainPart.split(".");
  const maskedLocal = `${localPart[0] ?? "*"}***`;
  const maskedDomain = domainName ? `${domainName[0] ?? "*"}***` : "***";
  const suffix = domainSuffix.length > 0 ? `.${domainSuffix.join(".")}` : "";

  return `${maskedLocal}@${maskedDomain}${suffix}`;
}

function getSafeEmailDisplay(input: {
  records: PaymentRecoveryContact[];
  env?: NodeJS.ProcessEnv;
}) {
  const encryptedValue = input.records.find((record) => record.contactEncrypted)?.contactEncrypted;

  if (!encryptedValue) {
    return null;
  }

  try {
    const maskedValue = maskRecoveryEmail(
      decryptRecoveryContactValue({
        encryptedValue,
        env: input.env,
      }),
    );

    return maskedValue ? { type: "email" as const, maskedValue } : null;
  } catch {
    return null;
  }
}

function dedupeRecoveryContacts(records: PaymentRecoveryContact[]) {
  const byId = new Map<string, PaymentRecoveryContact>();

  for (const record of records) {
    byId.set(record.id, record);
  }

  return [...byId.values()];
}

export function summarizePaymentRecoveryContacts(input: {
  records: PaymentRecoveryContact[];
  moduleSlug?: string;
  env?: NodeJS.ProcessEnv;
}): PaymentRecoveryStatusSummary {
  const records = dedupeRecoveryContacts(input.records).filter((record) =>
    input.moduleSlug ? record.moduleSlug === input.moduleSlug : true,
  );
  const emailRecords = records.filter((record) => record.contactType === "email");
  const lineRecords = records.filter((record) => record.contactType === "line");
  const activeEmailRecords = emailRecords.filter((record) => isActiveRecoveryStatus(record.status));
  const activeLineRecords = lineRecords.filter((record) => isActiveRecoveryStatus(record.status));
  const hasEmailRecovery = activeEmailRecords.length > 0;
  const hasLineRecovery = activeLineRecords.length > 0;
  const hasRecoveryContact = hasEmailRecovery || hasLineRecovery;
  const emailStatus = pickBestStatus(emailRecords);
  const lineStatus = pickBestStatus(lineRecords);
  const transactionalConsentPresent = records.some((record) =>
    Boolean(record.transactionalConsentAt),
  );
  const marketingOptInPresent = records.some((record) => Boolean(record.marketingOptInAt));
  const safeDisplayContact = getSafeEmailDisplay({
    records: activeEmailRecords,
    env: input.env,
  });

  let recommendedPostPaymentAction: PaymentRecoveryPostPaymentAction = "none";

  if (!hasRecoveryContact && emailStatus === "failed") {
    recommendedPostPaymentAction = "retry_email";
  } else if (!hasRecoveryContact) {
    recommendedPostPaymentAction = "suggest_email_save";
  } else if (hasRecoveryContact) {
    recommendedPostPaymentAction = "confirm_saved";
  }

  return {
    hasRecoveryContact,
    hasEmailRecovery,
    hasLineRecovery,
    emailStatus,
    lineStatus,
    transactionalConsentPresent,
    marketingOptInPresent,
    recommendedPostPaymentAction,
    safeDisplayContact,
  };
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

export async function getEligibleEmailRecoveryContactsForCompletedPaidResult(input: {
  moduleSlug: string;
  analysisResultId: string;
  entitlementId: string;
}) {
  const records = await getPaymentRecoveryContactsByEntitlementId(input.entitlementId);

  return records.filter((record) => {
    if (record.moduleSlug !== input.moduleSlug) {
      return false;
    }

    if (record.analysisResultId !== input.analysisResultId) {
      return false;
    }

    if (record.contactType !== "email" || !record.contactEncrypted) {
      return false;
    }

    if (!record.transactionalConsentAt) {
      return false;
    }

    if (record.status !== "bound" && record.status !== "verified") {
      return false;
    }

    return (
      record.source === "checkout_start" ||
      record.source === "return_waiting" ||
      record.source === "paid_ready"
    );
  });
}

export async function getEligibleLineRecoveryContactsForCompletedPaidResult(input: {
  moduleSlug: string;
  analysisResultId: string;
  entitlementId: string;
}) {
  const records = await getPaymentRecoveryContactsByEntitlementId(input.entitlementId);

  return records.filter((record) => {
    if (record.moduleSlug !== input.moduleSlug) {
      return false;
    }

    if (record.analysisResultId !== input.analysisResultId) {
      return false;
    }

    if (record.contactType !== "line" || !record.lineUserHash) {
      return false;
    }

    if (!record.transactionalConsentAt) {
      return false;
    }

    if (record.status !== "bound" && record.status !== "verified") {
      return false;
    }

    return (
      record.source === "checkout_start" ||
      record.source === "return_waiting" ||
      record.source === "paid_ready" ||
      record.source === "completed_result"
    );
  });
}

export async function getPaymentRecoveryContactsByResultId(analysisResultId: string) {
  const db = requireDb();

  return db
    .select()
    .from(paymentRecoveryContacts)
    .where(eq(paymentRecoveryContacts.analysisResultId, analysisResultId));
}

export async function getPaymentRecoveryStatusSummary(input: {
  moduleSlug: string;
  analysisResultId: string;
  paymentIntentId?: string | null;
  entitlementId?: string | null;
  env?: NodeJS.ProcessEnv;
}) {
  const records = await getPaymentRecoveryContactsByResultId(input.analysisResultId);

  return summarizePaymentRecoveryContacts({
    records: records.filter((record) => {
      if (record.moduleSlug !== input.moduleSlug) {
        return false;
      }

      if (
        input.entitlementId &&
        record.entitlementId &&
        record.entitlementId !== input.entitlementId
      ) {
        return false;
      }

      if (
        input.paymentIntentId &&
        record.paymentIntentId &&
        record.paymentIntentId !== input.paymentIntentId
      ) {
        return false;
      }

      return true;
    }),
    moduleSlug: input.moduleSlug,
    env: input.env,
  });
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

export async function createOrUpdatePostPaymentEmailRecoveryContact(input: {
  moduleSlug: string;
  analysisResultId: string;
  email: string;
  source: Extract<PaymentRecoveryContactSource, "paid_ready" | "completed_result" | "support">;
  paymentIntentId?: string | null;
  entitlementId?: string | null;
  transactionalConsentAt?: Date;
  marketingOptInAt?: Date | null;
  env?: NodeJS.ProcessEnv;
}) {
  return createOrUpdateEmailRecoveryContact({
    moduleSlug: input.moduleSlug,
    analysisResultId: input.analysisResultId,
    paymentIntentId: input.paymentIntentId,
    entitlementId: input.entitlementId,
    email: input.email,
    source: input.source,
    status: input.entitlementId ? "bound" : "verified",
    transactionalConsentAt: input.transactionalConsentAt,
    marketingOptInAt: input.marketingOptInAt,
    env: input.env,
  });
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
