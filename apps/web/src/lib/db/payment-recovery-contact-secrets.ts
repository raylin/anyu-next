import { and, eq } from "drizzle-orm";
import { requireDb } from "@/lib/db/client";
import { paymentRecoveryContactSecrets } from "@/lib/db/schema";
import {
  decryptLineRecoveryRecipient,
  encryptLineRecoveryRecipient,
  hashLineRecoveryRecipient,
} from "@/lib/payments/line-recovery-recipient-crypto";

export const PAYMENT_RECOVERY_CONTACT_SECRET_CHANNELS = ["line"] as const;
export const PAYMENT_RECOVERY_CONTACT_SECRET_PURPOSES = [
  "recovery_link_delivery",
] as const;
export const PAYMENT_RECOVERY_CONTACT_SECRET_STATUSES = [
  "active",
  "revoked",
  "failed",
] as const;
export const PAYMENT_RECOVERY_CONTACT_SECRET_KEY_VERSION = "v1";

export type PaymentRecoveryContactSecretChannel =
  (typeof PAYMENT_RECOVERY_CONTACT_SECRET_CHANNELS)[number];
export type PaymentRecoveryContactSecretPurpose =
  (typeof PAYMENT_RECOVERY_CONTACT_SECRET_PURPOSES)[number];
export type PaymentRecoveryContactSecretStatus =
  (typeof PAYMENT_RECOVERY_CONTACT_SECRET_STATUSES)[number];
export type PaymentRecoveryContactSecret =
  typeof paymentRecoveryContactSecrets.$inferSelect;

export type SanitizedPaymentRecoveryContactSecret = Pick<
  PaymentRecoveryContactSecret,
  | "id"
  | "recoveryContactId"
  | "channel"
  | "purpose"
  | "status"
  | "keyVersion"
  | "failureCategory"
  | "lastUsedAt"
  | "revokedAt"
  | "createdAt"
  | "updatedAt"
>;

function sanitizePaymentRecoveryContactSecret(
  secret: PaymentRecoveryContactSecret,
): SanitizedPaymentRecoveryContactSecret {
  return {
    id: secret.id,
    recoveryContactId: secret.recoveryContactId,
    channel: secret.channel,
    purpose: secret.purpose,
    status: secret.status,
    keyVersion: secret.keyVersion,
    failureCategory: secret.failureCategory,
    lastUsedAt: secret.lastUsedAt,
    revokedAt: secret.revokedAt,
    createdAt: secret.createdAt,
    updatedAt: secret.updatedAt,
  };
}

export function sanitizeRecoveryContactSecretForTest(
  secret: PaymentRecoveryContactSecret,
) {
  return sanitizePaymentRecoveryContactSecret(secret);
}

export async function getActiveLineRecoveryRecipientSecretByContactId(
  recoveryContactId: string,
) {
  const db = requireDb();
  const [record] = await db
    .select()
    .from(paymentRecoveryContactSecrets)
    .where(
      and(
        eq(paymentRecoveryContactSecrets.recoveryContactId, recoveryContactId),
        eq(paymentRecoveryContactSecrets.channel, "line"),
        eq(paymentRecoveryContactSecrets.purpose, "recovery_link_delivery"),
        eq(paymentRecoveryContactSecrets.status, "active"),
      ),
    )
    .limit(1);

  return record ?? null;
}

export async function createOrUpdateLineRecoveryRecipientSecret(input: {
  recoveryContactId: string;
  lineUserId: string;
  env?: NodeJS.ProcessEnv;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const recipientHash = hashLineRecoveryRecipient({
    lineUserId: input.lineUserId,
    env: input.env,
  });
  const encryptedRecipient = encryptLineRecoveryRecipient({
    lineUserId: input.lineUserId,
    env: input.env,
  });
  const db = requireDb();
  const existing = await getActiveLineRecoveryRecipientSecretByContactId(
    input.recoveryContactId,
  );

  if (existing) {
    const [record] = await db
      .update(paymentRecoveryContactSecrets)
      .set({
        recipientHash,
        encryptedRecipient,
        keyVersion: PAYMENT_RECOVERY_CONTACT_SECRET_KEY_VERSION,
        status: "active",
        failureCategory: null,
        revokedAt: null,
        updatedAt: now,
      })
      .where(eq(paymentRecoveryContactSecrets.id, existing.id))
      .returning();

    return record ? sanitizePaymentRecoveryContactSecret(record) : null;
  }

  const [record] = await db
    .insert(paymentRecoveryContactSecrets)
    .values({
      recoveryContactId: input.recoveryContactId,
      channel: "line",
      purpose: "recovery_link_delivery",
      recipientHash,
      encryptedRecipient,
      keyVersion: PAYMENT_RECOVERY_CONTACT_SECRET_KEY_VERSION,
      status: "active",
      updatedAt: now,
    })
    .returning();

  return record ? sanitizePaymentRecoveryContactSecret(record) : null;
}

export async function resolveLineRecoveryRecipientForSending(input: {
  recoveryContactId: string;
  env?: NodeJS.ProcessEnv;
}) {
  const secret = await getActiveLineRecoveryRecipientSecretByContactId(
    input.recoveryContactId,
  );

  if (!secret) {
    return null;
  }

  return decryptLineRecoveryRecipient({
    encryptedRecipient: secret.encryptedRecipient,
    env: input.env,
  });
}

export async function markLineRecoveryRecipientSecretUsed(input: {
  recoveryContactId: string;
  usedAt?: Date;
}) {
  const usedAt = input.usedAt ?? new Date();
  const db = requireDb();
  const [record] = await db
    .update(paymentRecoveryContactSecrets)
    .set({
      lastUsedAt: usedAt,
      updatedAt: usedAt,
    })
    .where(
      and(
        eq(paymentRecoveryContactSecrets.recoveryContactId, input.recoveryContactId),
        eq(paymentRecoveryContactSecrets.channel, "line"),
        eq(paymentRecoveryContactSecrets.purpose, "recovery_link_delivery"),
        eq(paymentRecoveryContactSecrets.status, "active"),
      ),
    )
    .returning();

  return record ? sanitizePaymentRecoveryContactSecret(record) : null;
}

export async function revokeLineRecoveryRecipientSecret(input: {
  recoveryContactId: string;
  revokedAt?: Date;
}) {
  const revokedAt = input.revokedAt ?? new Date();
  const db = requireDb();
  const [record] = await db
    .update(paymentRecoveryContactSecrets)
    .set({
      status: "revoked",
      revokedAt,
      updatedAt: revokedAt,
    })
    .where(
      and(
        eq(paymentRecoveryContactSecrets.recoveryContactId, input.recoveryContactId),
        eq(paymentRecoveryContactSecrets.channel, "line"),
        eq(paymentRecoveryContactSecrets.purpose, "recovery_link_delivery"),
        eq(paymentRecoveryContactSecrets.status, "active"),
      ),
    )
    .returning();

  return record ? sanitizePaymentRecoveryContactSecret(record) : null;
}

export async function markLineRecoveryRecipientSecretFailed(input: {
  recoveryContactId: string;
  failureCategory?: string | null;
  failedAt?: Date;
}) {
  const failedAt = input.failedAt ?? new Date();
  const db = requireDb();
  const [record] = await db
    .update(paymentRecoveryContactSecrets)
    .set({
      status: "failed",
      failureCategory: input.failureCategory ?? "send_failed",
      updatedAt: failedAt,
    })
    .where(
      and(
        eq(paymentRecoveryContactSecrets.recoveryContactId, input.recoveryContactId),
        eq(paymentRecoveryContactSecrets.channel, "line"),
        eq(paymentRecoveryContactSecrets.purpose, "recovery_link_delivery"),
        eq(paymentRecoveryContactSecrets.status, "active"),
      ),
    )
    .returning();

  return record ? sanitizePaymentRecoveryContactSecret(record) : null;
}
