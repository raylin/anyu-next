import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEFAULT_CODE_LENGTH = 6;
export const FULFILLMENT_CODE_TTL_MS = 30 * 60 * 1000;
export const UNLOCK_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export type FulfillmentStatus = "pending" | "bound" | "delivered" | "expired" | "failed";
export type FulfillmentChannel = "liff" | "line_code";

export function generateFulfillmentCode(length = DEFAULT_CODE_LENGTH): string {
  const bytes = randomBytes(length);

  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

export function normalizeFulfillmentCode(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]/g, "");
}

export function isFulfillmentCodeShape(value: string): boolean {
  const normalized = normalizeFulfillmentCode(value);

  return /^[A-HJ-NP-Z2-9]{6,8}$/.test(normalized);
}

export function generateUnlockToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashFulfillmentSecret(value: string, pepper = process.env.FULFILLMENT_TOKEN_SECRET): string {
  const normalizedPepper = pepper?.trim() ?? "";

  return createHash("sha256").update(`${normalizedPepper}:${value}`).digest("hex");
}

export function buildFulfillmentExpiry(now = new Date()) {
  return {
    fulfillmentExpiresAt: new Date(now.getTime() + FULFILLMENT_CODE_TTL_MS),
    unlockTokenExpiresAt: new Date(now.getTime() + UNLOCK_TOKEN_TTL_MS),
  };
}

export function isExpired(expiresAt: Date | string | null | undefined, now = new Date()): boolean {
  if (!expiresAt) {
    return true;
  }

  return new Date(expiresAt).getTime() <= now.getTime();
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}
