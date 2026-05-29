import { randomBytes } from "node:crypto";

const MERCHANT_ORDER_PREFIX = "ANYU";
const RANDOM_SUFFIX_LENGTH = 6;
const MERCHANT_ORDER_PATTERN = /^ANYU\d{12}[A-Z0-9]{6}$/u;

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatTimestamp(now: Date) {
  return [
    pad2(now.getUTCFullYear() % 100),
    pad2(now.getUTCMonth() + 1),
    pad2(now.getUTCDate()),
    pad2(now.getUTCHours()),
    pad2(now.getUTCMinutes()),
    pad2(now.getUTCSeconds()),
  ].join("");
}

function randomBase36(length: number) {
  const bytes = randomBytes(length);

  return Array.from(bytes, (byte) => (byte % 36).toString(36).toUpperCase()).join("");
}

export function generateMerchantOrderNo(now = new Date()) {
  return `${MERCHANT_ORDER_PREFIX}${formatTimestamp(now)}${randomBase36(RANDOM_SUFFIX_LENGTH)}`;
}

export function isValidMerchantOrderNo(value: string) {
  return MERCHANT_ORDER_PATTERN.test(value);
}
