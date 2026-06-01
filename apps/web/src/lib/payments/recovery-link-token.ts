import { createHmac, randomBytes } from "node:crypto";

export const PAID_RESULT_RECOVERY_LINK_TOKEN_PREFIX = "prl_";
export const PAID_RESULT_RECOVERY_LINK_PURPOSE = "paid_result_recovery";
export const PAID_RESULT_RECOVERY_LINK_TTL_DAYS = 90;

const RECOVERY_LINK_TOKEN_RANDOM_BYTES = 32;
const RECOVERY_LINK_TOKEN_PATTERN = /^prl_[A-Za-z0-9_-]{43}$/u;
const RECOVERY_LINK_HASH_PURPOSE = "paid_result_recovery_link:v1";

export function generatePaidResultRecoveryToken() {
  return `${PAID_RESULT_RECOVERY_LINK_TOKEN_PREFIX}${randomBytes(
    RECOVERY_LINK_TOKEN_RANDOM_BYTES,
  ).toString("base64url")}`;
}

export function isPaidResultRecoveryToken(value: string) {
  return RECOVERY_LINK_TOKEN_PATTERN.test(value);
}

export function hasPaidResultRecoveryTokenPrefix(value: string) {
  return value.startsWith(PAID_RESULT_RECOVERY_LINK_TOKEN_PREFIX);
}

export function getPaidResultRecoveryLinkTokenSecret(
  env: NodeJS.ProcessEnv = process.env,
) {
  const secret = env.PAYMENT_RECOVERY_LINK_TOKEN_SECRET?.trim();

  return secret ? secret : null;
}

export function hashPaidResultRecoveryToken(
  rawToken: string,
  env: NodeJS.ProcessEnv = process.env,
) {
  const secret = getPaidResultRecoveryLinkTokenSecret(env);

  if (!secret) {
    throw new Error("payment_recovery_link_token_secret_missing");
  }

  return createHmac("sha256", secret)
    .update(`${RECOVERY_LINK_HASH_PURPOSE}:${rawToken}`)
    .digest("hex");
}

export function getDefaultPaidResultRecoveryLinkExpiresAt(
  now = new Date(),
  ttlDays = PAID_RESULT_RECOVERY_LINK_TTL_DAYS,
) {
  return new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);
}
