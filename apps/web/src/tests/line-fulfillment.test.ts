import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildFulfillmentExpiry,
  generateFulfillmentCode,
  generateUnlockToken,
  hashFulfillmentSecret,
  isExpired,
  isFulfillmentCodeShape,
  normalizeFulfillmentCode,
} from "@/lib/line/fulfillment";
import { buildLineLiffUrl } from "@/lib/line/config";
import { verifyLineSignature } from "@/lib/line/webhook";

describe("LINE fulfillment helpers", () => {
  it("generates short codes with the expected safe shape", () => {
    const code = generateFulfillmentCode();

    expect(code).toHaveLength(6);
    expect(isFulfillmentCodeShape(code)).toBe(true);
    expect(code).not.toMatch(/[01IO]/);
  });

  it("normalizes pasted fulfillment codes", () => {
    expect(normalizeFulfillmentCode(" a7k-2q9 ")).toBe("A7K2Q9");
  });

  it("generates high entropy unlock tokens and deterministic hashes", () => {
    const token = generateUnlockToken();

    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(hashFulfillmentSecret(token, "pepper")).toBe(hashFulfillmentSecret(token, "pepper"));
    expect(hashFulfillmentSecret(token, "pepper")).not.toBe(token);
  });

  it("builds the expected expiration windows", () => {
    const now = new Date("2026-05-21T00:00:00.000Z");
    const expiry = buildFulfillmentExpiry(now);

    expect(expiry.fulfillmentExpiresAt.toISOString()).toBe("2026-05-21T00:30:00.000Z");
    expect(expiry.unlockTokenExpiresAt.toISOString()).toBe("2026-05-22T00:00:00.000Z");
    expect(isExpired(expiry.fulfillmentExpiresAt, now)).toBe(false);
    expect(isExpired(now, expiry.fulfillmentExpiresAt)).toBe(true);
  });

  it("builds LIFF URLs from env-provided base URLs", () => {
    expect(
      buildLineLiffUrl({
        baseUrl: "https://liff.line.me/123-abc",
        unlockIntentId: "intent-1",
        unlockToken: "token-1",
        fulfillmentCode: "A7K2Q9",
      }),
    ).toBe("https://liff.line.me/123-abc?unlockIntentId=intent-1&unlockToken=token-1&code=A7K2Q9");
  });

  it("verifies LINE webhook signatures", () => {
    const body = JSON.stringify({ events: [] });
    const secret = "test-secret";
    const signature = createHmac("sha256", secret).update(body).digest("base64");

    expect(verifyLineSignature({ body, signature, channelSecret: secret })).toBe(true);
    expect(verifyLineSignature({ body, signature: "bad-signature", channelSecret: secret })).toBe(
      false,
    );
  });
});
