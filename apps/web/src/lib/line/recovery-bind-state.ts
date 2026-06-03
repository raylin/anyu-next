import crypto from "node:crypto";
import { createOrUpdateLineRecoveryRecipientSecret } from "@/lib/db/payment-recovery-contact-secrets";
import {
  createOrUpdateLineRecoveryContact,
  type PaymentRecoveryContactSource,
} from "@/lib/db/payment-recovery-contacts";
import { RecoveryContactConfigError } from "@/lib/payments/recovery-contact-crypto";
import { LineRecoveryRecipientConfigError } from "@/lib/payments/line-recovery-recipient-crypto";

export const LINE_RECOVERY_BIND_STATE_PREFIX = "rlb_";
const LINE_RECOVERY_BIND_STATE_TTL_SECONDS = 10 * 60;
const LINE_RECOVERY_BIND_PURPOSE = "recovery_line_bind:v1";
const HASH_SECRET_ENV = "PAYMENT_RECOVERY_CONTACT_HASH_SECRET";
const ALLOWED_LINE_RECOVERY_BIND_SOURCES = [
  "checkout_start",
  "paid_ready",
  "completed_result",
] as const satisfies readonly PaymentRecoveryContactSource[];

export type LineRecoveryBindSource = (typeof ALLOWED_LINE_RECOVERY_BIND_SOURCES)[number];

export type LineRecoveryBindStatePayload = {
  moduleSlug: string;
  resultId: string;
  paymentIntentId?: string | null;
  entitlementId?: string | null;
  source: LineRecoveryBindSource;
  returnPath: string;
  marketingOptIn: boolean;
  iat: number;
  exp: number;
  nonce: string;
  stateId: string;
  purpose: typeof LINE_RECOVERY_BIND_PURPOSE;
};

export type LineRecoveryBindStateResolution =
  | { ok: true; payload: LineRecoveryBindStatePayload }
  | {
      ok: false;
      error: "state_missing" | "state_expired" | "state_invalid" | "config_missing";
    };

export type LineRecoveryBindResult =
  | {
      ok: true;
      category: "success";
      recoveryContactId: string | null;
      status: "verified" | "bound";
    }
  | {
      ok: false;
      category:
        | "state_invalid"
        | "line_user_missing"
        | "line_hash_failed"
        | "recovery_contact_write_failed"
        | "recipient_secret_write_failed";
    };

function getRecoveryBindStateSecret(env: NodeJS.ProcessEnv = process.env) {
  return env[HASH_SECRET_ENV]?.trim() || "";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string, secret: string) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${LINE_RECOVERY_BIND_PURPOSE}.${payload}`)
    .digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function isAllowedSource(value: string): value is LineRecoveryBindSource {
  return ALLOWED_LINE_RECOVERY_BIND_SOURCES.includes(value as LineRecoveryBindSource);
}

function assertNoForbiddenStateValue(value: string | null | undefined) {
  if (!value) {
    return;
  }

  if (/(^|[^A-Za-z0-9_-])(pa_|pcs_)[A-Za-z0-9_-]+/u.test(value)) {
    throw new Error("line_recovery_bind_state_forbidden_bearer_token");
  }

  if (/unlockToken|fulfillmentCode|TradeInfo|TradeSha/iu.test(value)) {
    throw new Error("line_recovery_bind_state_forbidden_payload");
  }
}

export function isSafeLineRecoveryReturnPath(returnPath: string) {
  if (!returnPath.startsWith("/") || returnPath.startsWith("//")) {
    return false;
  }

  try {
    const url = new URL(returnPath, "https://anyu.tw");

    if (url.origin !== "https://anyu.tw") {
      return false;
    }

    const serialized = `${url.pathname}${url.search}`;

    if (/\/unlock\//u.test(url.pathname)) {
      return false;
    }

    assertNoForbiddenStateValue(serialized);
    return true;
  } catch {
    return false;
  }
}

export function createLineRecoveryBindStateToken(input: {
  moduleSlug: string;
  resultId: string;
  paymentIntentId?: string | null;
  entitlementId?: string | null;
  source: LineRecoveryBindSource;
  returnPath: string;
  marketingOptIn?: boolean;
  env?: NodeJS.ProcessEnv;
  now?: Date;
  ttlSeconds?: number;
}) {
  const secret = getRecoveryBindStateSecret(input.env);

  if (!secret) {
    return { ok: false as const, error: "config_missing" as const };
  }

  if (!isAllowedSource(input.source) || !isSafeLineRecoveryReturnPath(input.returnPath)) {
    return { ok: false as const, error: "state_invalid" as const };
  }

  try {
    for (const value of [
      input.moduleSlug,
      input.resultId,
      input.paymentIntentId,
      input.entitlementId,
      input.returnPath,
    ]) {
      assertNoForbiddenStateValue(value);
    }
  } catch {
    return { ok: false as const, error: "state_invalid" as const };
  }

  const now = input.now ?? new Date();
  const iat = Math.floor(now.getTime() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({
      moduleSlug: input.moduleSlug,
      resultId: input.resultId,
      paymentIntentId: input.paymentIntentId ?? null,
      entitlementId: input.entitlementId ?? null,
      source: input.source,
      returnPath: input.returnPath,
      marketingOptIn: Boolean(input.marketingOptIn),
      iat,
      exp: iat + (input.ttlSeconds ?? LINE_RECOVERY_BIND_STATE_TTL_SECONDS),
      nonce: crypto.randomBytes(12).toString("base64url"),
      stateId: crypto.randomUUID(),
      purpose: LINE_RECOVERY_BIND_PURPOSE,
    } satisfies LineRecoveryBindStatePayload),
  );

  return {
    ok: true as const,
    token: `${LINE_RECOVERY_BIND_STATE_PREFIX}${payload}.${sign(payload, secret)}`,
  };
}

export function resolveLineRecoveryBindStateToken(input: {
  token?: string | null;
  env?: NodeJS.ProcessEnv;
  now?: Date;
}): LineRecoveryBindStateResolution {
  const token = input.token?.trim();

  if (!token) {
    return { ok: false, error: "state_missing" };
  }

  const secret = getRecoveryBindStateSecret(input.env);

  if (!secret) {
    return { ok: false, error: "config_missing" };
  }

  if (!token.startsWith(LINE_RECOVERY_BIND_STATE_PREFIX)) {
    return { ok: false, error: "state_invalid" };
  }

  const unsigned = token.slice(LINE_RECOVERY_BIND_STATE_PREFIX.length);
  const [payloadPart, signaturePart] = unsigned.split(".");

  if (!payloadPart || !signaturePart || !safeEqual(sign(payloadPart, secret), signaturePart)) {
    return { ok: false, error: "state_invalid" };
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payloadPart)) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, error: "state_invalid" };
    }

    const payload = parsed as Partial<LineRecoveryBindStatePayload>;

    if (
      payload.purpose !== LINE_RECOVERY_BIND_PURPOSE ||
      typeof payload.moduleSlug !== "string" ||
      typeof payload.resultId !== "string" ||
      typeof payload.source !== "string" ||
      !isAllowedSource(payload.source) ||
      typeof payload.returnPath !== "string" ||
      !isSafeLineRecoveryReturnPath(payload.returnPath) ||
      typeof payload.marketingOptIn !== "boolean" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number" ||
      typeof payload.nonce !== "string" ||
      typeof payload.stateId !== "string"
    ) {
      return { ok: false, error: "state_invalid" };
    }

    for (const value of [
      payload.moduleSlug,
      payload.resultId,
      payload.paymentIntentId,
      payload.entitlementId,
      payload.returnPath,
    ]) {
      assertNoForbiddenStateValue(typeof value === "string" ? value : null);
    }

    const now = input.now ?? new Date();

    if (payload.exp <= Math.floor(now.getTime() / 1000)) {
      return { ok: false, error: "state_expired" };
    }

    return {
      ok: true,
      payload: {
        moduleSlug: payload.moduleSlug,
        resultId: payload.resultId,
        paymentIntentId: payload.paymentIntentId ?? null,
        entitlementId: payload.entitlementId ?? null,
        source: payload.source,
        returnPath: payload.returnPath,
        marketingOptIn: payload.marketingOptIn,
        iat: payload.iat,
        exp: payload.exp,
        nonce: payload.nonce,
        stateId: payload.stateId,
        purpose: LINE_RECOVERY_BIND_PURPOSE,
      },
    };
  } catch {
    return { ok: false, error: "state_invalid" };
  }
}

export async function bindVerifiedLineUserToRecoveryContact(input: {
  state: LineRecoveryBindStatePayload;
  lineUserId?: string | null;
  env?: NodeJS.ProcessEnv;
  now?: Date;
}): Promise<LineRecoveryBindResult> {
  const lineUserId = input.lineUserId?.trim();

  if (!input.state || input.state.purpose !== LINE_RECOVERY_BIND_PURPOSE) {
    return { ok: false, category: "state_invalid" };
  }

  if (!lineUserId) {
    return { ok: false, category: "line_user_missing" };
  }

  try {
    const record = await createOrUpdateLineRecoveryContact({
      moduleSlug: input.state.moduleSlug,
      analysisResultId: input.state.resultId,
      paymentIntentId: input.state.paymentIntentId,
      entitlementId: input.state.entitlementId,
      lineUserId,
      source: input.state.source,
      status: input.state.entitlementId ? "bound" : "verified",
      transactionalConsentAt: input.now ?? new Date(),
      marketingOptInAt: input.state.marketingOptIn ? (input.now ?? new Date()) : null,
      env: input.env,
    });
    const recoveryContactId = record?.id ?? null;

    if (!recoveryContactId) {
      return { ok: false, category: "recovery_contact_write_failed" };
    }

    try {
      const secret = await createOrUpdateLineRecoveryRecipientSecret({
        recoveryContactId,
        lineUserId,
        env: input.env,
        now: input.now,
      });

      if (!secret) {
        return { ok: false, category: "recipient_secret_write_failed" };
      }
    } catch (error) {
      if (error instanceof LineRecoveryRecipientConfigError) {
        return { ok: false, category: "recipient_secret_write_failed" };
      }

      return { ok: false, category: "recipient_secret_write_failed" };
    }

    return {
      ok: true,
      category: "success",
      recoveryContactId,
      status: input.state.entitlementId ? "bound" : "verified",
    };
  } catch (error) {
    if (error instanceof RecoveryContactConfigError) {
      return { ok: false, category: "line_hash_failed" };
    }

    return { ok: false, category: "recovery_contact_write_failed" };
  }
}
