import { createHmac, randomBytes } from "node:crypto";

export const PAID_RESULT_ACCESS_LINK_TOKEN_PREFIX = "pal_";
export const PAID_RESULT_LEGACY_RECOVERY_LINK_TOKEN_PREFIX = "prl_";
export const PAID_RESULT_RECOVERY_LINK_TOKEN_PREFIX =
  PAID_RESULT_LEGACY_RECOVERY_LINK_TOKEN_PREFIX;
export const PAID_RESULT_RECOVERY_LINK_PURPOSE = "paid_result_recovery";
export const PAID_RESULT_RECOVERY_LINK_TTL_DAYS = 90;
export const PAID_RESULT_ACCESS_LINK_PURPOSE_ALIAS = "paid_result_access_link";
export const PAID_RESULT_ACCESS_LINK_TTL_DAYS = PAID_RESULT_RECOVERY_LINK_TTL_DAYS;

const RECOVERY_LINK_TOKEN_RANDOM_BYTES = 32;
const ACCESS_LINK_TOKEN_PATTERN = /^(?:pal|prl)_[A-Za-z0-9_-]{43}$/u;
const RECOVERY_LINK_HASH_PURPOSE = "paid_result_recovery_link:v1";
const ACCESS_LINK_HASH_PURPOSE = "paid_result_access_link:v1";

export function generatePaidResultRecoveryToken() {
  return `${PAID_RESULT_ACCESS_LINK_TOKEN_PREFIX}${randomBytes(
    RECOVERY_LINK_TOKEN_RANDOM_BYTES,
  ).toString("base64url")}`;
}

export function isPaidResultRecoveryToken(value: string) {
  return ACCESS_LINK_TOKEN_PATTERN.test(value);
}

export function hasPaidResultRecoveryTokenPrefix(value: string) {
  return (
    value.startsWith(PAID_RESULT_ACCESS_LINK_TOKEN_PREFIX) ||
    value.startsWith(PAID_RESULT_LEGACY_RECOVERY_LINK_TOKEN_PREFIX)
  );
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

  const hashPurpose = rawToken.startsWith(PAID_RESULT_ACCESS_LINK_TOKEN_PREFIX)
    ? ACCESS_LINK_HASH_PURPOSE
    : RECOVERY_LINK_HASH_PURPOSE;

  return createHmac("sha256", secret)
    .update(`${hashPurpose}:${rawToken}`)
    .digest("hex");
}

export function getDefaultPaidResultRecoveryLinkExpiresAt(
  now = new Date(),
  ttlDays = PAID_RESULT_RECOVERY_LINK_TTL_DAYS,
) {
  return new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);
}

export const generatePaidResultAccessLinkToken = generatePaidResultRecoveryToken;
export const isPaidResultAccessLinkToken = isPaidResultRecoveryToken;
export const hasPaidResultAccessLinkTokenPrefix = hasPaidResultRecoveryTokenPrefix;
export const getPaidResultAccessLinkTokenSecret = getPaidResultRecoveryLinkTokenSecret;
export const hashPaidResultAccessLinkToken = hashPaidResultRecoveryToken;
export const getDefaultPaidResultAccessLinkExpiresAt =
  getDefaultPaidResultRecoveryLinkExpiresAt;
