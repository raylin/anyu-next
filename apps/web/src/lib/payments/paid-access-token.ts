import { createHmac, randomBytes } from "node:crypto";

export const PAID_ACCESS_TOKEN_PREFIX = "pa_";
const PAID_ACCESS_TOKEN_RANDOM_BYTES = 32;
const PAID_ACCESS_TOKEN_PATTERN = /^pa_[A-Za-z0-9_-]{43}$/u;

export function generatePaidAccessToken() {
  return `${PAID_ACCESS_TOKEN_PREFIX}${randomBytes(PAID_ACCESS_TOKEN_RANDOM_BYTES).toString("base64url")}`;
}

export function isPaidAccessToken(value: string) {
  return PAID_ACCESS_TOKEN_PATTERN.test(value);
}

export function hasPaidAccessTokenPrefix(value: string) {
  return value.startsWith(PAID_ACCESS_TOKEN_PREFIX);
}

export function getPaidAccessTokenHashSecret(env: NodeJS.ProcessEnv = process.env) {
  const secret = env.PAID_ACCESS_TOKEN_HASH_SECRET?.trim();

  return secret ? secret : null;
}

export function hashPaidAccessToken(
  rawToken: string,
  env: NodeJS.ProcessEnv = process.env,
) {
  const secret = getPaidAccessTokenHashSecret(env);

  if (!secret) {
    throw new Error("paid_access_token_hash_secret_missing");
  }

  return createHmac("sha256", secret).update(rawToken).digest("hex");
}
