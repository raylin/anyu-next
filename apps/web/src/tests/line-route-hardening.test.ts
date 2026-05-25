import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockBindUnlockIntentToLine,
  mockGetUnlockIntentByCodeHash,
  mockGetUnlockIntentByTokenHash,
  mockInsertEvent,
  mockMarkLineWebhookEventProcessed,
  mockMarkUnlockIntentDeliveryAttempt,
  mockRecordLineWebhookInvalidAttempt,
  mockReplyLineText,
  mockTryCreateLineWebhookEvent,
  mockVerifyLineIdToken,
} = vi.hoisted(() => ({
  mockBindUnlockIntentToLine: vi.fn(),
  mockGetUnlockIntentByCodeHash: vi.fn(),
  mockGetUnlockIntentByTokenHash: vi.fn(),
  mockInsertEvent: vi.fn(),
  mockMarkLineWebhookEventProcessed: vi.fn(),
  mockMarkUnlockIntentDeliveryAttempt: vi.fn(),
  mockRecordLineWebhookInvalidAttempt: vi.fn(),
  mockReplyLineText: vi.fn(),
  mockTryCreateLineWebhookEvent: vi.fn(),
  mockVerifyLineIdToken: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: () => true,
}));

vi.mock("@/lib/db/runtime", () => ({
  bindUnlockIntentToLine: mockBindUnlockIntentToLine,
  getUnlockIntentByCodeHash: mockGetUnlockIntentByCodeHash,
  getUnlockIntentByTokenHash: mockGetUnlockIntentByTokenHash,
  insertEvent: mockInsertEvent,
  markLineWebhookEventProcessed: mockMarkLineWebhookEventProcessed,
  markUnlockIntentDeliveryAttempt: mockMarkUnlockIntentDeliveryAttempt,
  recordLineWebhookInvalidAttempt: mockRecordLineWebhookInvalidAttempt,
  tryCreateLineWebhookEvent: mockTryCreateLineWebhookEvent,
}));

vi.mock("@/lib/line/liff", () => ({
  verifyLineIdToken: mockVerifyLineIdToken,
}));

vi.mock("@/lib/line/webhook", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/line/webhook")>();

  return {
    ...actual,
    replyLineText: mockReplyLineText,
  };
});

import { POST as bindLiffPost } from "@/app/api/line/fulfillment/bind-liff/route";
import { POST as webhookPost } from "@/app/api/line/webhook/route";

function signLineBody(body: string) {
  return createHmac("sha256", "test-secret").update(body).digest("base64");
}

function buildRuntimeRecord() {
  return {
    unlockIntent: {
      id: "unlock-intent-1",
      resultId: "result-1",
      moduleId: "ai-temperature",
      themeSlug: "ambiguous-temperature",
      anonymousSessionId: "session-1",
      fulfillmentExpiresAt: new Date(Date.now() + 60_000),
      unlockTokenExpiresAt: new Date(Date.now() + 60_000),
      fulfillmentToken: "unlock-token-1",
    },
    result: {
      visualVariant: "B",
      promptVersion: "product_result_prompt_v0.4",
      schemaVersion: "product_result_schema_v2",
      scoreBucket: "warm",
    },
  };
}

describe("LINE route hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LINE_CHANNEL_SECRET = "test-secret";
    process.env.LINE_CHANNEL_ACCESS_TOKEN = "test-access-token";
  });

  it("rejects LIFF bind requests that only send a client-provided user id", async () => {
    const response = await bindLiffPost(
      new Request("http://localhost/api/line/fulfillment/bind-liff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unlockIntentId: "unlock-intent-1",
          unlockToken: "unlock-token-1",
          liffUserId: "client-controlled-user",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "invalid_input",
    });
    expect(mockVerifyLineIdToken).not.toHaveBeenCalled();
    expect(mockBindUnlockIntentToLine).not.toHaveBeenCalled();
  });

  it("binds LIFF fulfillment to the verified LINE ID token subject only", async () => {
    mockVerifyLineIdToken.mockResolvedValue({
      ok: true,
      lineUserId: "verified-line-user",
      audience: "1234567890",
    });
    mockGetUnlockIntentByTokenHash.mockResolvedValue(buildRuntimeRecord());
    mockBindUnlockIntentToLine.mockResolvedValue({});
    mockInsertEvent.mockResolvedValue({});

    const response = await bindLiffPost(
      new Request("http://localhost/api/line/fulfillment/bind-liff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unlockIntentId: "unlock-intent-1",
          unlockToken: "unlock-token-1",
          idToken: "line-id-token",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
    expect(mockBindUnlockIntentToLine).toHaveBeenCalledWith(
      expect.objectContaining({
        lineUserId: "verified-line-user",
        channel: "liff",
        delivered: true,
      }),
    );
    expect(mockInsertEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "fulfillment_liff_bound",
        metadata: expect.not.objectContaining({
          lineUserId: expect.anything(),
          idToken: expect.anything(),
        }),
      }),
    );
  });

  it("allows LINE console webhook verification pings with empty events and no signature", async () => {
    const response = await webhookPost(
      new Request("http://localhost/api/line/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: "test",
          events: [],
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
    expect(mockTryCreateLineWebhookEvent).not.toHaveBeenCalled();
    expect(mockReplyLineText).not.toHaveBeenCalled();
    expect(mockInsertEvent).not.toHaveBeenCalled();
    expect(mockBindUnlockIntentToLine).not.toHaveBeenCalled();
    expect(mockMarkLineWebhookEventProcessed).not.toHaveBeenCalled();
  });

  it("rejects non-empty webhook events without a signature", async () => {
    const body = JSON.stringify({
      events: [
        {
          type: "message",
          webhookEventId: "event-missing-signature",
          replyToken: "reply-token",
          source: { userId: "line-user" },
          message: { type: "text", text: "A7K2Q9" },
        },
      ],
    });

    const response = await webhookPost(
      new Request("http://localhost/api/line/webhook", {
        method: "POST",
        body,
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "invalid_signature",
    });
    expect(mockTryCreateLineWebhookEvent).not.toHaveBeenCalled();
    expect(mockInsertEvent).not.toHaveBeenCalled();
  });

  it("rejects non-empty webhook events with an invalid signature", async () => {
    const body = JSON.stringify({
      events: [
        {
          type: "message",
          webhookEventId: "event-invalid-signature",
          replyToken: "reply-token",
          source: { userId: "line-user" },
          message: { type: "text", text: "A7K2Q9" },
        },
      ],
    });

    const response = await webhookPost(
      new Request("http://localhost/api/line/webhook", {
        method: "POST",
        headers: {
          "x-line-signature": "invalid",
        },
        body,
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "invalid_signature",
    });
    expect(mockTryCreateLineWebhookEvent).not.toHaveBeenCalled();
    expect(mockInsertEvent).not.toHaveBeenCalled();
  });

  it("ignores duplicate webhook events without replying twice", async () => {
    mockTryCreateLineWebhookEvent.mockResolvedValue("duplicate");
    const body = JSON.stringify({
      events: [
        {
          type: "message",
          webhookEventId: "event-1",
          replyToken: "reply-token",
          source: { userId: "line-user" },
          message: { type: "text", text: "A7K2Q9" },
        },
      ],
    });

    const response = await webhookPost(
      new Request("http://localhost/api/line/webhook", {
        method: "POST",
        headers: {
          "x-line-signature": signLineBody(body),
        },
        body,
      }),
    );

    expect(response.status).toBe(200);
    expect(mockReplyLineText).not.toHaveBeenCalled();
    expect(mockGetUnlockIntentByCodeHash).not.toHaveBeenCalled();
  });

  it("rate limits repeated invalid webhook code attempts without leaking unsafe metadata", async () => {
    mockTryCreateLineWebhookEvent.mockResolvedValue("created");
    mockRecordLineWebhookInvalidAttempt.mockResolvedValue({ invalidAttemptCount: 6 });
    mockReplyLineText.mockResolvedValue({ ok: true });
    const body = JSON.stringify({
      events: [
        {
          type: "message",
          webhookEventId: "event-2",
          replyToken: "reply-token",
          source: { userId: "line-user" },
          message: { type: "text", text: "not-a-code" },
        },
      ],
    });

    const response = await webhookPost(
      new Request("http://localhost/api/line/webhook", {
        method: "POST",
        headers: {
          "x-line-signature": signLineBody(body),
        },
        body,
      }),
    );

    expect(response.status).toBe(200);
    expect(mockReplyLineText).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("短時間內嘗試太多次"),
      }),
    );
    expect(mockMarkLineWebhookEventProcessed).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "rate_limited",
        errorCode: "rate_limited",
      }),
    );
    expect(mockInsertEvent).not.toHaveBeenCalled();
  });
});
