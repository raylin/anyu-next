import crypto from "node:crypto";

export const PAYMENT_CHECKOUT_SESSION_TOKEN_PREFIX = "pcs_";
const CHECKOUT_SESSION_TTL_SECONDS = 60 * 60 * 24;

export type PaymentCheckoutSessionPayload = {
  moduleSlug: string;
  merchantOrderNo: string;
  exp: number;
  nonce: string;
};

export type PaymentCheckoutSessionResolution =
  | { ok: true; payload: PaymentCheckoutSessionPayload }
  | { ok: false; error: "missing_config" | "invalid_session" | "expired" };

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getPaymentCheckoutSessionSecret(env: NodeJS.ProcessEnv = process.env) {
  return (
    env.PAYMENT_CHECKOUT_SESSION_SECRET?.trim() ||
    env.PAID_ACCESS_TOKEN_HASH_SECRET?.trim() ||
    ""
  );
}

function sign(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function createPaymentCheckoutSessionToken(input: {
  moduleSlug: string;
  merchantOrderNo: string;
  env?: NodeJS.ProcessEnv;
  now?: Date;
}) {
  const secret = getPaymentCheckoutSessionSecret(input.env);

  if (!secret) {
    return { ok: false as const, error: "missing_config" as const };
  }

  const now = input.now ?? new Date();
  const payload = base64UrlEncode(
    JSON.stringify({
      moduleSlug: input.moduleSlug,
      merchantOrderNo: input.merchantOrderNo,
      exp: Math.floor(now.getTime() / 1000) + CHECKOUT_SESSION_TTL_SECONDS,
      nonce: crypto.randomBytes(12).toString("base64url"),
    } satisfies PaymentCheckoutSessionPayload),
  );

  return {
    ok: true as const,
    token: `${PAYMENT_CHECKOUT_SESSION_TOKEN_PREFIX}${payload}.${sign(payload, secret)}`,
  };
}

export function resolvePaymentCheckoutSessionToken(input: {
  token: string;
  env?: NodeJS.ProcessEnv;
  now?: Date;
}): PaymentCheckoutSessionResolution {
  const secret = getPaymentCheckoutSessionSecret(input.env);

  if (!secret) {
    return { ok: false, error: "missing_config" };
  }

  if (!input.token.startsWith(PAYMENT_CHECKOUT_SESSION_TOKEN_PREFIX)) {
    return { ok: false, error: "invalid_session" };
  }

  const unsigned = input.token.slice(PAYMENT_CHECKOUT_SESSION_TOKEN_PREFIX.length);
  const [payloadPart, signaturePart] = unsigned.split(".");

  if (!payloadPart || !signaturePart || !safeEqual(sign(payloadPart, secret), signaturePart)) {
    return { ok: false, error: "invalid_session" };
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payloadPart)) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, error: "invalid_session" };
    }

    const payload = parsed as Partial<PaymentCheckoutSessionPayload>;

    if (
      typeof payload.moduleSlug !== "string" ||
      typeof payload.merchantOrderNo !== "string" ||
      typeof payload.exp !== "number" ||
      typeof payload.nonce !== "string"
    ) {
      return { ok: false, error: "invalid_session" };
    }

    const now = input.now ?? new Date();

    if (payload.exp <= Math.floor(now.getTime() / 1000)) {
      return { ok: false, error: "expired" };
    }

    return {
      ok: true,
      payload: {
        moduleSlug: payload.moduleSlug,
        merchantOrderNo: payload.merchantOrderNo,
        exp: payload.exp,
        nonce: payload.nonce,
      },
    };
  } catch {
    return { ok: false, error: "invalid_session" };
  }
}

