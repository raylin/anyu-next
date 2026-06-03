import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { requireDb } from "@/lib/db/client";
import { getEntitlementById, type Entitlement } from "@/lib/db/entitlements";
import { paidResultAccessLinks } from "@/lib/db/schema";
import {
  generatePaidResultAccessLinkToken,
  generatePaidResultRecoveryToken,
  getDefaultPaidResultAccessLinkExpiresAt,
  getDefaultPaidResultRecoveryLinkExpiresAt,
  hashPaidResultAccessLinkToken,
  hashPaidResultRecoveryToken,
  isPaidResultAccessLinkToken,
  isPaidResultRecoveryToken,
  PAID_RESULT_ACCESS_LINK_PURPOSE_ALIAS,
} from "@/lib/payments/recovery-link-token";

export const PAID_RESULT_RECOVERY_LINK_CHANNELS = [
  "email",
  "line",
  "support",
  "operator_test",
] as const;
export const PAID_RESULT_RECOVERY_LINK_STATUSES = [
  "created",
  "sent",
  "used",
  "expired",
  "revoked",
  "failed",
] as const;
export const PAID_RESULT_RECOVERY_LINK_FAILURE_CATEGORIES = [
  "provider_config_missing",
  "provider_request_failed",
  "provider_rejected",
  "rate_limited",
  "recipient_unavailable",
  "recipient_blocked_or_unreachable",
  "unknown",
] as const;

export type PaidResultRecoveryLinkChannel =
  (typeof PAID_RESULT_RECOVERY_LINK_CHANNELS)[number];
export type PaidResultRecoveryLinkStatus =
  (typeof PAID_RESULT_RECOVERY_LINK_STATUSES)[number];
export type PaidResultRecoveryLinkFailureCategory =
  (typeof PAID_RESULT_RECOVERY_LINK_FAILURE_CATEGORIES)[number];
export type PaidResultRecoveryLink = typeof paidResultAccessLinks.$inferSelect;
export type PaidResultAccessLinkChannel = PaidResultRecoveryLinkChannel;
export type PaidResultAccessLinkStatus = PaidResultRecoveryLinkStatus;
export type PaidResultAccessLinkFailureCategory =
  PaidResultRecoveryLinkFailureCategory;
export type PaidResultAccessLink = PaidResultRecoveryLink;

export type PaidResultRecoveryLinkResolution =
  | {
      ok: true;
      link: PaidResultRecoveryLink;
      entitlement: Entitlement;
    }
  | {
      ok: false;
      category:
        | "invalid_token"
        | "not_found"
        | "expired"
        | "revoked"
        | "failed"
        | "entitlement_missing"
        | "entitlement_inactive"
        | "config_unavailable";
    };
export type PaidResultAccessLinkResolution = PaidResultRecoveryLinkResolution;

export const PAID_RESULT_ACCESS_LINK_CHANNELS = PAID_RESULT_RECOVERY_LINK_CHANNELS;
export const PAID_RESULT_ACCESS_LINK_STATUSES = PAID_RESULT_RECOVERY_LINK_STATUSES;
export const PAID_RESULT_ACCESS_LINK_FAILURE_CATEGORIES =
  PAID_RESULT_RECOVERY_LINK_FAILURE_CATEGORIES;
export const PAID_RESULT_ACCESS_LINK_PURPOSE = PAID_RESULT_ACCESS_LINK_PURPOSE_ALIAS;
const PAID_RESULT_ACCESS_LINK_COMPATIBLE_PURPOSES = [
  PAID_RESULT_ACCESS_LINK_PURPOSE,
] as const;

function assertAllowed<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string,
): asserts value is T {
  if (!allowed.includes(value as T)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

function isPast(date: Date | string | null | undefined, now: Date) {
  if (!date) {
    return false;
  }

  const parsed = date instanceof Date ? date : new Date(date);

  return !Number.isNaN(parsed.getTime()) && parsed.getTime() <= now.getTime();
}

export function isPaidResultRecoveryLinkExpired(input: {
  link: Pick<PaidResultRecoveryLink, "expiresAt">;
  now?: Date;
}) {
  return isPast(input.link.expiresAt, input.now ?? new Date());
}

export function isPaidResultRecoveryLinkActive(input: {
  link: Pick<
    PaidResultRecoveryLink,
    "expiresAt" | "revokedAt" | "sentAt" | "status" | "usedAt"
  >;
  now?: Date;
}) {
  const { link } = input;

  if (link.status === "failed" || link.status === "expired" || link.status === "revoked") {
    return false;
  }

  if (link.revokedAt || isPaidResultRecoveryLinkExpired({ link, now: input.now })) {
    return false;
  }

  return link.status === "sent" || link.status === "used" || Boolean(link.sentAt || link.usedAt);
}

export async function createPaidResultRecoveryLink(input: {
  moduleSlug: string;
  analysisResultId: string;
  entitlementId: string;
  paymentIntentId?: string | null;
  recoveryContactId?: string | null;
  channel: PaidResultRecoveryLinkChannel;
  expiresAt?: Date;
  now?: Date;
  env?: NodeJS.ProcessEnv;
}) {
  assertAllowed(input.channel, PAID_RESULT_RECOVERY_LINK_CHANNELS, "recovery link channel");

  const rawToken = generatePaidResultRecoveryToken();
  const tokenHash = hashPaidResultRecoveryToken(rawToken, input.env);
  const now = input.now ?? new Date();
  const expiresAt = input.expiresAt ?? getDefaultPaidResultRecoveryLinkExpiresAt(now);
  const db = requireDb();
  const [link] = await db
    .insert(paidResultAccessLinks)
    .values({
      moduleSlug: input.moduleSlug,
      analysisResultId: input.analysisResultId,
      paymentIntentId: input.paymentIntentId ?? null,
      entitlementId: input.entitlementId,
      recoveryContactId: input.recoveryContactId ?? null,
      tokenHash,
      purpose: PAID_RESULT_ACCESS_LINK_PURPOSE,
      channel: input.channel,
      status: "created",
      expiresAt,
      updatedAt: now,
    })
    .returning();

  return { link, rawToken };
}

export const createPaidResultAccessLink = createPaidResultRecoveryLink;

export async function getPaidResultRecoveryLinkByRawToken(
  rawToken: string,
  env?: NodeJS.ProcessEnv,
) {
  if (!isPaidResultRecoveryToken(rawToken)) {
    return null;
  }

  const tokenHash = hashPaidResultRecoveryToken(rawToken, env);
  const db = requireDb();
  const [record] = await db
    .select()
    .from(paidResultAccessLinks)
    .where(
      and(
        eq(paidResultAccessLinks.tokenHash, tokenHash),
        inArray(paidResultAccessLinks.purpose, PAID_RESULT_ACCESS_LINK_COMPATIBLE_PURPOSES),
      ),
    )
    .limit(1);

  return record ?? null;
}

export const getPaidResultAccessLinkByRawToken = getPaidResultRecoveryLinkByRawToken;

export async function markPaidResultRecoveryLinkUsed(linkId: string, usedAt = new Date()) {
  const db = requireDb();
  const [record] = await db
    .update(paidResultAccessLinks)
    .set({
      status: "used",
      usedAt,
      updatedAt: usedAt,
    })
    .where(eq(paidResultAccessLinks.id, linkId))
    .returning();

  return record ?? null;
}

export const markPaidResultAccessLinkUsed = markPaidResultRecoveryLinkUsed;

export async function revokePaidResultRecoveryLink(input: {
  linkId: string;
  revokedAt?: Date;
}) {
  const revokedAt = input.revokedAt ?? new Date();
  const db = requireDb();
  const [record] = await db
    .update(paidResultAccessLinks)
    .set({
      status: "revoked",
      revokedAt,
      updatedAt: revokedAt,
    })
    .where(eq(paidResultAccessLinks.id, input.linkId))
    .returning();

  return record ?? null;
}

export const revokePaidResultAccessLink = revokePaidResultRecoveryLink;

export async function markPaidResultRecoveryLinkSent(input: {
  linkId: string;
  sentAt?: Date;
  providerMessageId?: string | null;
  providerStatus?: string | null;
}) {
  const sentAt = input.sentAt ?? new Date();
  const db = requireDb();
  const [record] = await db
    .update(paidResultAccessLinks)
    .set({
      status: "sent",
      sentAt,
      providerMessageId: input.providerMessageId ?? null,
      lastSendAttemptAt: sentAt,
      sendAttemptCount: sql`${paidResultAccessLinks.sendAttemptCount} + 1`,
      lastFailureCategory: null,
      lastProviderStatus: input.providerStatus ?? "accepted",
      updatedAt: sentAt,
    })
    .where(eq(paidResultAccessLinks.id, input.linkId))
    .returning();

  return record ?? null;
}

export const markPaidResultAccessLinkSent = markPaidResultRecoveryLinkSent;

export async function markPaidResultRecoveryLinkFailed(input: {
  linkId: string;
  failedAt?: Date;
  failureCategory?: PaidResultRecoveryLinkFailureCategory;
  providerStatus?: string | null;
}) {
  const failedAt = input.failedAt ?? new Date();
  const db = requireDb();
  const [record] = await db
    .update(paidResultAccessLinks)
    .set({
      status: "failed",
      lastSendAttemptAt: failedAt,
      sendAttemptCount: sql`${paidResultAccessLinks.sendAttemptCount} + 1`,
      lastFailureCategory: input.failureCategory ?? "unknown",
      lastProviderStatus: input.providerStatus ?? null,
      updatedAt: failedAt,
    })
    .where(eq(paidResultAccessLinks.id, input.linkId))
    .returning();

  return record ?? null;
}

export const markPaidResultAccessLinkFailed = markPaidResultRecoveryLinkFailed;

export async function getRecentPaidResultRecoveryLinkForContact(input: {
  entitlementId: string;
  recoveryContactId: string;
  channel: PaidResultRecoveryLinkChannel;
}) {
  const db = requireDb();
  const [record] = await db
    .select()
    .from(paidResultAccessLinks)
    .where(
      and(
        eq(paidResultAccessLinks.entitlementId, input.entitlementId),
        eq(paidResultAccessLinks.recoveryContactId, input.recoveryContactId),
        eq(paidResultAccessLinks.channel, input.channel),
        inArray(paidResultAccessLinks.purpose, PAID_RESULT_ACCESS_LINK_COMPATIBLE_PURPOSES),
      ),
    )
    .orderBy(desc(paidResultAccessLinks.createdAt))
    .limit(1);

  return record ?? null;
}

export const getRecentPaidResultAccessLinkForContact =
  getRecentPaidResultRecoveryLinkForContact;

export async function findActivePaidResultAccessLinkForContact(input: {
  entitlementId: string;
  recoveryContactId: string;
  channel: PaidResultRecoveryLinkChannel;
  now?: Date;
}) {
  const db = requireDb();
  const records = await db
    .select()
    .from(paidResultAccessLinks)
    .where(
      and(
        eq(paidResultAccessLinks.entitlementId, input.entitlementId),
        eq(paidResultAccessLinks.recoveryContactId, input.recoveryContactId),
        eq(paidResultAccessLinks.channel, input.channel),
        inArray(paidResultAccessLinks.purpose, PAID_RESULT_ACCESS_LINK_COMPATIBLE_PURPOSES),
      ),
    )
    .orderBy(desc(paidResultAccessLinks.createdAt))
    .limit(10);

  return (
    records.find((link) =>
      isPaidResultRecoveryLinkActive({
        link,
        now: input.now,
      }),
    ) ?? null
  );
}

export async function createSupportPaidResultAccessLink(input: {
  moduleSlug: string;
  analysisResultId: string;
  entitlementId: string;
  paymentIntentId?: string | null;
  recoveryContactId?: string | null;
  expiresAt?: Date;
  now?: Date;
  env?: NodeJS.ProcessEnv;
}) {
  return createPaidResultRecoveryLink({
    moduleSlug: input.moduleSlug,
    analysisResultId: input.analysisResultId,
    paymentIntentId: input.paymentIntentId,
    entitlementId: input.entitlementId,
    recoveryContactId: input.recoveryContactId,
    channel: "support",
    expiresAt: input.expiresAt,
    now: input.now,
    env: input.env,
  });
}

export const createSupportPaidResultRecoveryLink = createSupportPaidResultAccessLink;

export async function resolvePaidResultRecoveryLink(input: {
  rawToken: string;
  now?: Date;
  env?: NodeJS.ProcessEnv;
}): Promise<PaidResultRecoveryLinkResolution> {
  if (!isPaidResultRecoveryToken(input.rawToken)) {
    return { ok: false, category: "invalid_token" };
  }

  let link: PaidResultRecoveryLink | null;

  try {
    link = await getPaidResultRecoveryLinkByRawToken(input.rawToken, input.env);
  } catch {
    return { ok: false, category: "config_unavailable" };
  }

  if (!link) {
    return { ok: false, category: "not_found" };
  }

  if (link.status === "revoked" || link.revokedAt) {
    return { ok: false, category: "revoked" };
  }

  if (link.status === "failed") {
    return { ok: false, category: "failed" };
  }

  if (link.status === "expired" || isPaidResultRecoveryLinkExpired({ link, now: input.now })) {
    return { ok: false, category: "expired" };
  }

  const entitlement = await getEntitlementById(link.entitlementId);

  if (!entitlement) {
    return { ok: false, category: "entitlement_missing" };
  }

  if (entitlement.status !== "active" && entitlement.status !== "consumed") {
    return { ok: false, category: "entitlement_inactive" };
  }

  await markPaidResultRecoveryLinkUsed(link.id, input.now ?? new Date());

  return { ok: true, link, entitlement };
}

export const resolvePaidResultAccessLink = resolvePaidResultRecoveryLink;
export const isPaidResultAccessLinkExpired = isPaidResultRecoveryLinkExpired;
export const isPaidResultAccessLinkActive = isPaidResultRecoveryLinkActive;
export {
  generatePaidResultAccessLinkToken,
  generatePaidResultRecoveryToken,
  getDefaultPaidResultAccessLinkExpiresAt,
  getDefaultPaidResultRecoveryLinkExpiresAt,
  hashPaidResultAccessLinkToken,
  hashPaidResultRecoveryToken,
  isPaidResultAccessLinkToken,
  isPaidResultRecoveryToken,
};
