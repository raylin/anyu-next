import crypto from "node:crypto";

const RECOVERY_LINK_TOKEN_PREFIX = "prl_";
const RECOVERY_LINK_TOKEN_RANDOM_BYTES = 32;
const RECOVERY_LINK_TOKEN_PATTERN = /^prl_[A-Za-z0-9_-]{43}$/u;
const RECOVERY_LINK_HASH_PURPOSE = "paid_result_recovery_link:v1";
const RECOVERY_LINK_TTL_DAYS = 90;
const RECOVERY_LINK_PURPOSE = "paid_result_recovery";
const RECOVERY_LINK_CHANNEL = "operator_test";
const TOKEN_LIKE_PATTERNS = [
  /prl_[A-Za-z0-9_-]{8,}/u,
  /pa_[A-Za-z0-9_-]{8,}/u,
  /pcs_[A-Za-z0-9_-]{8,}/u,
  /\/r\/prl_[A-Za-z0-9_-]{8,}/u,
];

function generateOperatorRecoveryToken() {
  return `${RECOVERY_LINK_TOKEN_PREFIX}${crypto
    .randomBytes(RECOVERY_LINK_TOKEN_RANDOM_BYTES)
    .toString("base64url")}`;
}

function isRecoveryLinkToken(value) {
  return typeof value === "string" && RECOVERY_LINK_TOKEN_PATTERN.test(value);
}

function hashOperatorRecoveryToken(rawToken, secret) {
  if (!isRecoveryLinkToken(rawToken)) {
    throw new Error("invalid_recovery_link_token");
  }

  if (typeof secret !== "string" || secret.trim().length === 0) {
    throw new Error("payment_recovery_link_token_secret_missing");
  }

  return crypto
    .createHmac("sha256", secret.trim())
    .update(`${RECOVERY_LINK_HASH_PURPOSE}:${rawToken}`)
    .digest("hex");
}

function getDefaultOperatorRecoveryLinkExpiresAt(now = new Date()) {
  return new Date(now.getTime() + RECOVERY_LINK_TTL_DAYS * 24 * 60 * 60 * 1000);
}

function redactRecoveryLinkPath(value) {
  if (typeof value !== "string") {
    return null;
  }

  return value.replace(/\/r\/[^/?#\s"']+/gu, "/r/[REDACTED]");
}

function containsRecoverySmokeTokenLikeValue(value) {
  const serialized = typeof value === "string" ? value : JSON.stringify(value);

  return TOKEN_LIKE_PATTERNS.some((pattern) => pattern.test(serialized));
}

function summarizeRecoveryLinkHtml(html, rawToken) {
  const tokenExposed = typeof rawToken === "string" && rawToken.length > 0 && html.includes(rawToken);
  const paidAccessOrCheckoutTokenExposed = /(?:pa|pcs)_[A-Za-z0-9_-]{8,}/u.test(html);

  return {
    completedContentSignal:
      html.includes("完整分析") || html.includes("48 小時") || html.includes("可直接使用"),
    rawRecoveryTokenExposed: tokenExposed,
    rawPaidAccessOrCheckoutTokenExposed: paidAccessOrCheckoutTokenExposed,
  };
}

function sanitizeRecoverySmokeRecord(value) {
  if (containsRecoverySmokeTokenLikeValue(value)) {
    throw new Error("unsafe_recovery_smoke_output_detected");
  }

  return value;
}

export {
  RECOVERY_LINK_CHANNEL,
  RECOVERY_LINK_PURPOSE,
  RECOVERY_LINK_TTL_DAYS,
  containsRecoverySmokeTokenLikeValue,
  generateOperatorRecoveryToken,
  getDefaultOperatorRecoveryLinkExpiresAt,
  hashOperatorRecoveryToken,
  isRecoveryLinkToken,
  redactRecoveryLinkPath,
  sanitizeRecoverySmokeRecord,
  summarizeRecoveryLinkHtml,
};
