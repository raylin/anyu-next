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
import { buildLineLiffUrl, buildModuleUnlockPath } from "@/lib/line/config";
import { parseLineFulfillmentContext } from "@/lib/line/liff-context";
import { getLineLoginChannelId, verifyLineIdToken } from "@/lib/line/liff";
import { verifyLineSignature } from "@/lib/line/webhook";
import {
  buildLineWebhookDedupeKey,
  getLineWebhookRateWindowStart,
  isLineWebhookRateLimited,
} from "@/lib/line/webhook-hardening";

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
        moduleSlug: "ambiguous-temperature",
      }),
    ).toBe(
      "https://liff.line.me/123-abc/line/fulfill?moduleSlug=ambiguous-temperature&unlockIntentId=intent-1&unlockToken=token-1&code=A7K2Q9",
    );
  });

  it("builds global bridge URLs for non-LIFF base URLs too", () => {
    expect(
      buildLineLiffUrl({
        baseUrl: "https://staging.anyu.tw/m/ambiguous-temperature/line/fulfill",
        unlockIntentId: "intent-1",
        unlockToken: "token-1",
        fulfillmentCode: "A7K2Q9",
        moduleSlug: "ambiguous-temperature",
      }),
    ).toBe(
      "https://staging.anyu.tw/line/fulfill?moduleSlug=ambiguous-temperature&unlockIntentId=intent-1&unlockToken=token-1&code=A7K2Q9",
    );
  });

  it("builds root-relative module unlock paths for LIFF bind redirects", () => {
    expect(
      buildModuleUnlockPath({
        moduleSlug: "ambiguous-temperature",
        unlockToken: "token-1",
      }),
    ).toBe("/m/ambiguous-temperature/unlock/token-1");
  });

  it("keeps LIFF fulfillment context from direct query params", () => {
    expect(
      parseLineFulfillmentContext(
        "?moduleSlug=ambiguous-temperature&unlockIntentId=intent-1&unlockToken=token-1&code=A7K2Q9",
      ),
    ).toEqual({
      moduleSlug: "ambiguous-temperature",
      unlockIntentId: "intent-1",
      unlockToken: "token-1",
      code: "A7K2Q9",
      statePath: null,
    });
  });

  it("keeps LIFF fulfillment context from liff.state redirects", () => {
    const state = encodeURIComponent(
      "/line/fulfill?moduleSlug=ambiguous-temperature&unlockIntentId=intent-1&unlockToken=token-1&code=A7K2Q9",
    );

    expect(parseLineFulfillmentContext(`?liff.state=${state}`)).toEqual({
      moduleSlug: "ambiguous-temperature",
      unlockIntentId: "intent-1",
      unlockToken: "token-1",
      code: "A7K2Q9",
      statePath: "/line/fulfill",
    });
  });

  it("keeps compatibility module context from legacy liff.state paths", () => {
    const state = encodeURIComponent(
      "/m/ambiguous-temperature/line/fulfill?unlockIntentId=intent-1&unlockToken=token-1&code=A7K2Q9",
    );

    expect(parseLineFulfillmentContext(`?liff.state=${state}`)).toEqual({
      moduleSlug: "ambiguous-temperature",
      unlockIntentId: "intent-1",
      unlockToken: "token-1",
      code: "A7K2Q9",
      statePath: "/m/ambiguous-temperature/line/fulfill",
    });
  });

  it("uses a compatibility route module slug when query context omits it", () => {
    expect(
      parseLineFulfillmentContext("?unlockIntentId=intent-1&unlockToken=token-1&code=A7K2Q9", {
        defaultModuleSlug: "ambiguous-temperature",
      }),
    ).toEqual({
      moduleSlug: "ambiguous-temperature",
      unlockIntentId: "intent-1",
      unlockToken: "token-1",
      code: "A7K2Q9",
      statePath: null,
    });
  });

  it("returns an empty context when LIFF state is missing instead of inventing a redirect", () => {
    expect(parseLineFulfillmentContext("")).toEqual({
      moduleSlug: "",
      unlockIntentId: "",
      unlockToken: "",
      code: "",
      statePath: null,
    });
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

  it("derives LINE Login channel ID from env or LIFF ID", () => {
    expect(
      getLineLoginChannelId({
        explicitChannelId: "2000000000",
        liffId: "1234567890-abc",
      }),
    ).toBe("2000000000");
    expect(getLineLoginChannelId({ liffId: "1234567890-abc" })).toBe("1234567890");
  });

  it("verifies LINE ID tokens through the LINE verify endpoint", async () => {
    const calls: Array<{ url: string; body: string }> = [];
    const fetchImpl = async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({
        url: String(url),
        body: String(init?.body),
      });

      return Response.json({ sub: "line-user-1", aud: "1234567890" });
    };

    const result = await verifyLineIdToken({
      idToken: "id-token",
      channelId: "1234567890",
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(result).toEqual({
      ok: true,
      lineUserId: "line-user-1",
      audience: "1234567890",
    });
    expect(calls[0]?.url).toBe("https://api.line.me/oauth2/v2.1/verify");
    expect(calls[0]?.body).toContain("id_token=id-token");
    expect(calls[0]?.body).toContain("client_id=1234567890");
  });

  it("rejects missing or unverifiable LINE ID tokens", async () => {
    await expect(verifyLineIdToken({ idToken: "", channelId: "123" })).resolves.toEqual({
      ok: false,
      error: "missing_token",
    });
    await expect(
      verifyLineIdToken({
        idToken: "bad-token",
        channelId: "123",
        fetchImpl: (async () => new Response("bad", { status: 401 })) as typeof fetch,
      }),
    ).resolves.toEqual({
      ok: false,
      error: "line_verify_failed",
    });
  });

  it("builds safe webhook dedupe keys without raw reply tokens", () => {
    expect(
      buildLineWebhookDedupeKey({
        type: "message",
        webhookEventId: "01HARDENED",
        replyToken: "reply-token",
      }),
    ).toBe("event:01HARDENED");

    const derived = buildLineWebhookDedupeKey({
      type: "message",
      timestamp: 123,
      replyToken: "reply-token",
    });

    expect(derived).toMatch(/^derived:[a-f0-9]{64}$/);
    expect(derived).not.toContain("reply-token");
  });

  it("tracks webhook rate windows and limits invalid attempts", () => {
    expect(getLineWebhookRateWindowStart(new Date("2026-05-21T10:12:34Z")).toISOString()).toBe(
      "2026-05-21T10:10:00.000Z",
    );
    expect(isLineWebhookRateLimited({ invalidAttemptCount: 5 })).toBe(false);
    expect(isLineWebhookRateLimited({ invalidAttemptCount: 6 })).toBe(true);
  });
});
