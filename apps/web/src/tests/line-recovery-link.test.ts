import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreatePaidResultRecoveryLink,
  mockGetRecentPaidResultRecoveryLinkForContact,
  mockMarkPaidResultRecoveryLinkFailed,
  mockMarkPaidResultRecoveryLinkSent,
  mockIsPaidResultRecoveryLinkExpired,
} = vi.hoisted(() => ({
  mockCreatePaidResultRecoveryLink: vi.fn(),
  mockGetRecentPaidResultRecoveryLinkForContact: vi.fn(),
  mockMarkPaidResultRecoveryLinkFailed: vi.fn(),
  mockMarkPaidResultRecoveryLinkSent: vi.fn(),
  mockIsPaidResultRecoveryLinkExpired: vi.fn(),
}));

vi.mock("@/lib/db/paid-result-recovery-links", () => ({
  createPaidResultRecoveryLink: mockCreatePaidResultRecoveryLink,
  getRecentPaidResultRecoveryLinkForContact: mockGetRecentPaidResultRecoveryLinkForContact,
  isPaidResultRecoveryLinkExpired: mockIsPaidResultRecoveryLinkExpired,
  markPaidResultRecoveryLinkFailed: mockMarkPaidResultRecoveryLinkFailed,
  markPaidResultRecoveryLinkSent: mockMarkPaidResultRecoveryLinkSent,
}));

import {
  buildRecoveryLinkLineMessage,
  createAndSendLineRecoveryLink,
  sendRecoveryLineMessage,
} from "@/lib/notifications/line-recovery-link";

const RAW_TOKEN = "prl_" + "b".repeat(43);

function lineContact(overrides: Record<string, unknown> = {}) {
  return {
    id: "line-contact-1",
    moduleSlug: "ambiguous-temperature",
    analysisResultId: "result-1",
    paymentIntentId: "payment-1",
    entitlementId: "entitlement-1",
    contactType: "line",
    contactHash: "redacted-line-contact-hash",
    contactEncrypted: null,
    lineUserHash: "redacted-line-user-hash",
    emailHash: null,
    transactionalConsentAt: new Date("2026-06-01T00:00:00.000Z"),
    marketingOptInAt: null,
    source: "checkout_start",
    status: "bound",
    createdAt: new Date("2026-06-01T00:00:00.000Z"),
    updatedAt: new Date("2026-06-01T00:00:00.000Z"),
    lastUsedAt: null,
    ...overrides,
  };
}

describe("LINE recovery link sending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRecentPaidResultRecoveryLinkForContact.mockResolvedValue(null);
    mockIsPaidResultRecoveryLinkExpired.mockReturnValue(false);
    mockCreatePaidResultRecoveryLink.mockResolvedValue({
      rawToken: RAW_TOKEN,
      link: { id: "recovery-link-1", status: "created" },
    });
  });

  it("builds a link-only LINE message without report body or access tokens", () => {
    const recoveryUrl = `https://staging.anyu.tw/r/${RAW_TOKEN}`;
    const message = buildRecoveryLinkLineMessage({
      to: "line-recipient-test-only",
      recoveryUrl,
      moduleTitle: "曖昧溫度計",
    });

    expect(message.text).toContain("曖昧溫度計");
    expect(message.text).toContain(recoveryUrl);
    expect(message.text).toContain("此找回連結將保留 90 天");
    expect(message.text).toContain("hello@anyu.tw");
    expect(message.text).not.toContain("pa_");
    expect(message.text).not.toContain("pcs_");
    expect(message.text).not.toContain("原始輸入");
    expect(message.text).not.toContain("完整摘要內容");
  });

  it("uses noop adapter by default and does not claim a real LINE message was sent", async () => {
    await expect(
      sendRecoveryLineMessage({
        message: buildRecoveryLinkLineMessage({
          to: "line-recipient-test-only",
          recoveryUrl: `https://staging.anyu.tw/r/${RAW_TOKEN}`,
        }),
        env: {} as NodeJS.ProcessEnv,
      }),
    ).resolves.toEqual({ ok: true, provider: "noop", status: "noop" });
  });

  it("sends through LINE Messaging API when explicitly configured with a sendable recipient", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    const message = buildRecoveryLinkLineMessage({
      to: "line-recipient-test-only",
      recoveryUrl: `https://staging.anyu.tw/r/${RAW_TOKEN}`,
    });

    await expect(
      sendRecoveryLineMessage({
        message,
        env: {
          LINE_RECOVERY_MESSAGE_PROVIDER: "line",
          LINE_CHANNEL_ACCESS_TOKEN: "test-only-line-token",
        } as NodeJS.ProcessEnv,
        fetchImpl: fetchImpl as never,
      }),
    ).resolves.toEqual({ ok: true, provider: "line", status: "sent" });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.line.me/v2/bot/message/push",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-only-line-token",
          "Content-Type": "application/json",
        }),
      }),
    );
    const body = JSON.parse(fetchImpl.mock.calls[0]?.[1]?.body as string);
    expect(body.to).toBe("line-recipient-test-only");
    expect(body.messages[0].text).toContain(`/r/${RAW_TOKEN}`);
    expect(body.messages[0].text).not.toContain("pa_");
    expect(body.messages[0].text).not.toContain("pcs_");
  });

  it("fails safely when LINE provider config is missing or provider returns an error", async () => {
    await expect(
      sendRecoveryLineMessage({
        message: buildRecoveryLinkLineMessage({
          to: "line-recipient-test-only",
          recoveryUrl: `https://staging.anyu.tw/r/${RAW_TOKEN}`,
        }),
        env: { LINE_RECOVERY_MESSAGE_PROVIDER: "line" } as NodeJS.ProcessEnv,
        fetchImpl: vi.fn() as never,
      }),
    ).resolves.toEqual({
      ok: false,
      provider: "line",
      status: "unavailable",
      category: "missing_config",
    });

    await expect(
      sendRecoveryLineMessage({
        message: buildRecoveryLinkLineMessage({
          to: "line-recipient-test-only",
          recoveryUrl: `https://staging.anyu.tw/r/${RAW_TOKEN}`,
        }),
        env: {
          LINE_RECOVERY_MESSAGE_PROVIDER: "line",
          LINE_CHANNEL_ACCESS_TOKEN: "test-only-line-token",
        } as NodeJS.ProcessEnv,
        fetchImpl: vi.fn(async () => new Response("bad request", { status: 400 })) as never,
      }),
    ).resolves.toEqual({
      ok: false,
      provider: "line",
      status: "failed",
      category: "provider_error",
    });
  });

  it("does not create a recovery link when hash-only contact has no sendable recipient", async () => {
    const result = await createAndSendLineRecoveryLink({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: "result-1",
      paymentIntentId: "payment-1",
      entitlementId: "entitlement-1",
      recoveryContact: lineContact() as never,
      env: {
        NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw",
        LINE_RECOVERY_MESSAGE_PROVIDER: "line",
        LINE_CHANNEL_ACCESS_TOKEN: "test-only-line-token",
      } as NodeJS.ProcessEnv,
    });

    expect(result).toMatchObject({
      ok: false,
      status: "unavailable",
      category: "line_recipient_unavailable",
      recoveryLinkCreated: false,
      lineSent: false,
    });
    expect(mockCreatePaidResultRecoveryLink).not.toHaveBeenCalled();
    expect(mockMarkPaidResultRecoveryLinkSent).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain(RAW_TOKEN);
  });

  it("creates and marks a LINE recovery link sent with an explicit future-safe recipient", async () => {
    const result = await createAndSendLineRecoveryLink({
      moduleSlug: "ambiguous-temperature",
      moduleTitle: "曖昧溫度計",
      analysisResultId: "result-1",
      paymentIntentId: "payment-1",
      entitlementId: "entitlement-1",
      recoveryContact: lineContact() as never,
      lineRecipientId: "line-recipient-test-only",
      env: {
        NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw",
        LINE_RECOVERY_MESSAGE_PROVIDER: "line",
        LINE_CHANNEL_ACCESS_TOKEN: "test-only-line-token",
      } as NodeJS.ProcessEnv,
      fetchImpl: vi.fn(async () => new Response("{}", { status: 200 })) as never,
    });

    expect(result).toMatchObject({
      ok: true,
      status: "sent",
      provider: "line",
      recoveryLinkCreated: true,
      lineSent: true,
    });
    expect(mockCreatePaidResultRecoveryLink).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "line",
        entitlementId: "entitlement-1",
        recoveryContactId: "line-contact-1",
      }),
    );
    expect(mockMarkPaidResultRecoveryLinkSent).toHaveBeenCalledWith({
      linkId: "recovery-link-1",
    });
    expect(JSON.stringify(result)).not.toContain(RAW_TOKEN);
  });

  it("prevents duplicate LINE sends when a sent link already exists", async () => {
    mockGetRecentPaidResultRecoveryLinkForContact.mockResolvedValue({
      id: "existing-link-1",
      status: "sent",
      expiresAt: new Date("2026-09-01T00:00:00.000Z"),
    });

    const result = await createAndSendLineRecoveryLink({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: "result-1",
      paymentIntentId: "payment-1",
      entitlementId: "entitlement-1",
      recoveryContact: lineContact() as never,
      lineRecipientId: "line-recipient-test-only",
      env: { NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw" } as NodeJS.ProcessEnv,
    });

    expect(result).toMatchObject({
      ok: true,
      status: "duplicate",
      recoveryLinkCreated: false,
      lineSent: false,
    });
    expect(mockCreatePaidResultRecoveryLink).not.toHaveBeenCalled();
  });
});
