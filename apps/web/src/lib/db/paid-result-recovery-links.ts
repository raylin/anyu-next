import { and, desc, eq } from "drizzle-orm";
import { requireDb } from "@/lib/db/client";
import { getEntitlementById, type Entitlement } from "@/lib/db/entitlements";
import { paidResultRecoveryLinks } from "@/lib/db/schema";
import {
  generatePaidResultRecoveryToken,
  getDefaultPaidResultRecoveryLinkExpiresAt,
  hashPaidResultRecoveryToken,
  isPaidResultRecoveryToken,
  PAID_RESULT_RECOVERY_LINK_PURPOSE,
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

export type PaidResultRecoveryLinkChannel =
  (typeof PAID_RESULT_RECOVERY_LINK_CHANNELS)[number];
export type PaidResultRecoveryLinkStatus =
  (typeof PAID_RESULT_RECOVERY_LINK_STATUSES)[number];
export type PaidResultRecoveryLink = typeof paidResultRecoveryLinks.$inferSelect;

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
    .insert(paidResultRecoveryLinks)
    .values({
      moduleSlug: input.moduleSlug,
      analysisResultId: input.analysisResultId,
      paymentIntentId: input.paymentIntentId ?? null,
      entitlementId: input.entitlementId,
      recoveryContactId: input.recoveryContactId ?? null,
      tokenHash,
      purpose: PAID_RESULT_RECOVERY_LINK_PURPOSE,
      channel: input.channel,
      status: "created",
      expiresAt,
      updatedAt: now,
    })
    .returning();

  return { link, rawToken };
}

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
    .from(paidResultRecoveryLinks)
    .where(
      and(
        eq(paidResultRecoveryLinks.tokenHash, tokenHash),
        eq(paidResultRecoveryLinks.purpose, PAID_RESULT_RECOVERY_LINK_PURPOSE),
      ),
    )
    .limit(1);

  return record ?? null;
}

export async function markPaidResultRecoveryLinkUsed(linkId: string, usedAt = new Date()) {
  const db = requireDb();
  const [record] = await db
    .update(paidResultRecoveryLinks)
    .set({
      status: "used",
      usedAt,
      updatedAt: usedAt,
    })
    .where(eq(paidResultRecoveryLinks.id, linkId))
    .returning();

  return record ?? null;
}

export async function revokePaidResultRecoveryLink(input: {
  linkId: string;
  revokedAt?: Date;
}) {
  const revokedAt = input.revokedAt ?? new Date();
  const db = requireDb();
  const [record] = await db
    .update(paidResultRecoveryLinks)
    .set({
      status: "revoked",
      revokedAt,
      updatedAt: revokedAt,
    })
    .where(eq(paidResultRecoveryLinks.id, input.linkId))
    .returning();

  return record ?? null;
}

export async function markPaidResultRecoveryLinkSent(input: {
  linkId: string;
  sentAt?: Date;
}) {
  const sentAt = input.sentAt ?? new Date();
  const db = requireDb();
  const [record] = await db
    .update(paidResultRecoveryLinks)
    .set({
      status: "sent",
      sentAt,
      updatedAt: sentAt,
    })
    .where(eq(paidResultRecoveryLinks.id, input.linkId))
    .returning();

  return record ?? null;
}

export async function markPaidResultRecoveryLinkFailed(input: {
  linkId: string;
  failedAt?: Date;
}) {
  const failedAt = input.failedAt ?? new Date();
  const db = requireDb();
  const [record] = await db
    .update(paidResultRecoveryLinks)
    .set({
      status: "failed",
      updatedAt: failedAt,
    })
    .where(eq(paidResultRecoveryLinks.id, input.linkId))
    .returning();

  return record ?? null;
}

export async function getRecentPaidResultRecoveryLinkForContact(input: {
  entitlementId: string;
  recoveryContactId: string;
  channel: PaidResultRecoveryLinkChannel;
}) {
  const db = requireDb();
  const [record] = await db
    .select()
    .from(paidResultRecoveryLinks)
    .where(
      and(
        eq(paidResultRecoveryLinks.entitlementId, input.entitlementId),
        eq(paidResultRecoveryLinks.recoveryContactId, input.recoveryContactId),
        eq(paidResultRecoveryLinks.channel, input.channel),
        eq(paidResultRecoveryLinks.purpose, PAID_RESULT_RECOVERY_LINK_PURPOSE),
      ),
    )
    .orderBy(desc(paidResultRecoveryLinks.createdAt))
    .limit(1);

  return record ?? null;
}

export async function findActivePaidResultAccessLinkForContact(input: {
  entitlementId: string;
  recoveryContactId: string;
  channel: PaidResultRecoveryLinkChannel;
  now?: Date;
}) {
  const db = requireDb();
  const records = await db
    .select()
    .from(paidResultRecoveryLinks)
    .where(
      and(
        eq(paidResultRecoveryLinks.entitlementId, input.entitlementId),
        eq(paidResultRecoveryLinks.recoveryContactId, input.recoveryContactId),
        eq(paidResultRecoveryLinks.channel, input.channel),
        eq(paidResultRecoveryLinks.purpose, PAID_RESULT_RECOVERY_LINK_PURPOSE),
      ),
    )
    .orderBy(desc(paidResultRecoveryLinks.createdAt))
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
