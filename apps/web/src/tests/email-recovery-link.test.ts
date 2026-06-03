import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreatePaidResultRecoveryLink,
  mockFindActivePaidResultAccessLinkForContact,
  mockMarkPaidResultRecoveryLinkFailed,
  mockMarkPaidResultRecoveryLinkSent,
  mockDecryptRecoveryContactValue,
  mockGetEligibleEmailRecoveryContactsForCompletedPaidResult,
  mockGetEligibleLineRecoveryContactsForCompletedPaidResult,
  mockResolveLineRecoveryRecipientForSending,
  mockMarkLineRecoveryRecipientSecretUsed,
} = vi.hoisted(() => ({
  mockCreatePaidResultRecoveryLink: vi.fn(),
  mockFindActivePaidResultAccessLinkForContact: vi.fn(),
  mockMarkPaidResultRecoveryLinkFailed: vi.fn(),
  mockMarkPaidResultRecoveryLinkSent: vi.fn(),
  mockDecryptRecoveryContactValue: vi.fn(),
  mockGetEligibleEmailRecoveryContactsForCompletedPaidResult: vi.fn(),
  mockGetEligibleLineRecoveryContactsForCompletedPaidResult: vi.fn(),
  mockResolveLineRecoveryRecipientForSending: vi.fn(),
  mockMarkLineRecoveryRecipientSecretUsed: vi.fn(),
}));

vi.mock("@/lib/db/paid-result-recovery-links", () => ({
  createPaidResultRecoveryLink: mockCreatePaidResultRecoveryLink,
  findActivePaidResultAccessLinkForContact: mockFindActivePaidResultAccessLinkForContact,
  markPaidResultRecoveryLinkFailed: mockMarkPaidResultRecoveryLinkFailed,
  markPaidResultRecoveryLinkSent: mockMarkPaidResultRecoveryLinkSent,
}));

vi.mock("@/lib/payments/recovery-contact-crypto", () => ({
  decryptRecoveryContactValue: mockDecryptRecoveryContactValue,
}));

vi.mock("@/lib/db/payment-recovery-contacts", () => ({
  getEligibleEmailRecoveryContactsForCompletedPaidResult:
    mockGetEligibleEmailRecoveryContactsForCompletedPaidResult,
  getEligibleLineRecoveryContactsForCompletedPaidResult:
    mockGetEligibleLineRecoveryContactsForCompletedPaidResult,
}));

vi.mock("@/lib/db/payment-recovery-contact-secrets", () => ({
  resolveLineRecoveryRecipientForSending: mockResolveLineRecoveryRecipientForSending,
  markLineRecoveryRecipientSecretUsed: mockMarkLineRecoveryRecipientSecretUsed,
}));

import {
  buildRecoveryLinkEmail,
  buildRecoveryLinkUrl,
  createAndSendEmailRecoveryLink,
  sendRecoveryEmail,
  sendRecoveryLinksForCompletedPaidResult,
} from "@/lib/notifications/email-recovery-link";

const RAW_TOKEN = "prl_" + "a".repeat(43);

function emailContact(overrides: Record<string, unknown> = {}) {
  return {
    id: "contact-1",
    moduleSlug: "ambiguous-temperature",
    analysisResultId: "result-1",
    paymentIntentId: "payment-1",
    entitlementId: "entitlement-1",
    contactType: "email",
    contactHash: "redacted-contact-hash",
    contactEncrypted: "encrypted-email",
    lineUserHash: null,
    emailHash: "redacted-email-hash",
    transactionalConsentAt: new Date("2026-06-01T00:00:00.000Z"),
    marketingOptInAt: null,
    source: "completed_result",
    status: "bound",
    createdAt: new Date("2026-06-01T00:00:00.000Z"),
    updatedAt: new Date("2026-06-01T00:00:00.000Z"),
    lastUsedAt: null,
    ...overrides,
  };
}

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

describe("email recovery link sending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindActivePaidResultAccessLinkForContact.mockResolvedValue(null);
    mockCreatePaidResultRecoveryLink.mockResolvedValue({
      rawToken: RAW_TOKEN,
      link: { id: "recovery-link-1", status: "created" },
    });
    mockDecryptRecoveryContactValue.mockReturnValue("qa-recovery@example.invalid");
    mockGetEligibleEmailRecoveryContactsForCompletedPaidResult.mockResolvedValue([
      emailContact(),
    ]);
    mockGetEligibleLineRecoveryContactsForCompletedPaidResult.mockResolvedValue([]);
    mockResolveLineRecoveryRecipientForSending.mockResolvedValue(null);
    mockMarkLineRecoveryRecipientSecretUsed.mockResolvedValue({ id: "secret-1" });
  });

  it("builds a recovery link URL using /r/[token]", () => {
    expect(
      buildRecoveryLinkUrl({
        rawToken: RAW_TOKEN,
        env: { NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw/some/path" } as NodeJS.ProcessEnv,
      }),
    ).toBe(`https://staging.anyu.tw/r/${RAW_TOKEN}`);
  });

  it("builds a link-only recovery email template without report body or access tokens", () => {
    const recoveryUrl = `https://staging.anyu.tw/r/${RAW_TOKEN}`;
    const message = buildRecoveryLinkEmail({
      to: "qa-recovery@example.invalid",
      recoveryUrl,
      moduleTitle: "曖昧溫度計",
    });

    expect(message.subject).toBe("你的 ANYU 完整報告已準備好");
    expect(message.text).toContain("曖昧溫度計");
    expect(message.text).toContain(recoveryUrl);
    expect(message.text).toContain("此專屬查看連結將保留 90 天");
    expect(message.text).toContain("點此回到 ANYU 查看完整報告");
    expect(message.text).toContain("hello@anyu.tw");
    expect(message.html).toContain(recoveryUrl);
    expect(message.text).not.toContain("pa_");
    expect(message.text).not.toContain("pcs_");
    expect(message.text).not.toContain("原始輸入");
    expect(message.text).not.toContain("完整摘要內容");
  });

  it("escapes html fields in the recovery email template", () => {
    const message = buildRecoveryLinkEmail({
      to: "qa-recovery@example.invalid",
      recoveryUrl: `https://staging.anyu.tw/r/${RAW_TOKEN}?x=<unsafe>`,
      moduleTitle: '曖昧<溫度計>"',
    });

    expect(message.html).toContain("曖昧&lt;溫度計&gt;&quot;");
    expect(message.html).toContain("&lt;unsafe&gt;");
    expect(message.html).not.toContain("<unsafe>");
  });

  it("uses noop adapter by default and does not claim a real email was sent", async () => {
    await expect(
      sendRecoveryEmail({
        message: buildRecoveryLinkEmail({
          to: "qa-recovery@example.invalid",
          recoveryUrl: `https://staging.anyu.tw/r/${RAW_TOKEN}`,
        }),
        env: {} as NodeJS.ProcessEnv,
      }),
    ).resolves.toEqual({ ok: true, provider: "noop", status: "noop" });
  });

  it("sends through Resend when configured with a mocked safe payload", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ id: "email-1" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    const message = buildRecoveryLinkEmail({
      to: "qa-recovery@example.invalid",
      recoveryUrl: `https://staging.anyu.tw/r/${RAW_TOKEN}`,
      moduleTitle: "曖昧溫度計",
    });

    await expect(
      sendRecoveryEmail({
        message,
        idempotencyKey: "paid-result-recovery-link/recovery-link-1",
        env: {
          EMAIL_PROVIDER: "resend",
          RESEND_API_KEY: "test-only-api-key",
        } as NodeJS.ProcessEnv,
        fetchImpl: fetchImpl as never,
      }),
    ).resolves.toEqual({ ok: true, provider: "resend", status: "sent" });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-only-api-key",
          "Content-Type": "application/json",
          "Idempotency-Key": "paid-result-recovery-link/recovery-link-1",
        }),
      }),
    );
    const body = JSON.parse(fetchImpl.mock.calls[0]?.[1]?.body as string);
    expect(body).toMatchObject({
      from: "hello@anyu.tw",
      to: "qa-recovery@example.invalid",
      subject: "你的 ANYU 完整報告已準備好",
    });
    expect(body.html).toContain(`/r/${RAW_TOKEN}`);
    expect(body.html).not.toContain("pa_");
    expect(body.html).not.toContain("pcs_");
    expect(body.html).not.toContain("原始輸入");
  });

  it("fails safely when Resend config is missing or provider returns an error", async () => {
    await expect(
      sendRecoveryEmail({
        message: buildRecoveryLinkEmail({
          to: "qa-recovery@example.invalid",
          recoveryUrl: `https://staging.anyu.tw/r/${RAW_TOKEN}`,
        }),
        env: { EMAIL_PROVIDER: "resend" } as NodeJS.ProcessEnv,
        fetchImpl: vi.fn() as never,
      }),
    ).resolves.toEqual({
      ok: false,
      provider: "resend",
      status: "unavailable",
      category: "missing_config",
    });

    await expect(
      sendRecoveryEmail({
        message: buildRecoveryLinkEmail({
          to: "qa-recovery@example.invalid",
          recoveryUrl: `https://staging.anyu.tw/r/${RAW_TOKEN}`,
        }),
        env: {
          EMAIL_PROVIDER: "resend",
          RESEND_API_KEY: "test-only-api-key",
        } as NodeJS.ProcessEnv,
        fetchImpl: vi.fn(async () => new Response("bad request", { status: 400 })) as never,
      }),
    ).resolves.toEqual({
      ok: false,
      provider: "resend",
      status: "failed",
      category: "provider_error",
    });
  });

  it("creates a recovery link for noop sending without returning raw token or marking sent", async () => {
    const result = await createAndSendEmailRecoveryLink({
      moduleSlug: "ambiguous-temperature",
      moduleTitle: "曖昧溫度計",
      analysisResultId: "result-1",
      paymentIntentId: "payment-1",
      entitlementId: "entitlement-1",
      recoveryContact: emailContact() as never,
      env: {
        NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw",
        EMAIL_PROVIDER: "noop",
      } as NodeJS.ProcessEnv,
    });

    expect(result).toMatchObject({
      ok: true,
      status: "noop",
      provider: "noop",
      recoveryLinkCreated: true,
      emailSent: false,
    });
    expect(mockCreatePaidResultRecoveryLink).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "email",
        entitlementId: "entitlement-1",
        recoveryContactId: "contact-1",
      }),
    );
    expect(mockMarkPaidResultRecoveryLinkSent).not.toHaveBeenCalled();
    expect(mockMarkPaidResultRecoveryLinkFailed).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain(RAW_TOKEN);
  });

  it("marks recovery link as sent after mocked Resend success", async () => {
    const result = await createAndSendEmailRecoveryLink({
      moduleSlug: "ambiguous-temperature",
      moduleTitle: "曖昧溫度計",
      analysisResultId: "result-1",
      paymentIntentId: "payment-1",
      entitlementId: "entitlement-1",
      recoveryContact: emailContact() as never,
      env: {
        NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw",
        EMAIL_PROVIDER: "resend",
        RESEND_API_KEY: "test-only-api-key",
      } as NodeJS.ProcessEnv,
      fetchImpl: vi.fn(async () => new Response(JSON.stringify({ id: "email-1" }), {
        status: 200,
      })) as never,
    });

    expect(result).toMatchObject({
      ok: true,
      status: "sent",
      provider: "resend",
      recoveryLinkCreated: true,
      emailSent: true,
    });
    expect(mockMarkPaidResultRecoveryLinkSent).toHaveBeenCalledWith({
      linkId: "recovery-link-1",
    });
    expect(mockMarkPaidResultRecoveryLinkFailed).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain(RAW_TOKEN);
  });

  it("marks recovery link failed after mocked provider failure", async () => {
    const result = await createAndSendEmailRecoveryLink({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: "result-1",
      paymentIntentId: "payment-1",
      entitlementId: "entitlement-1",
      recoveryContact: emailContact() as never,
      env: {
        NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw",
        EMAIL_PROVIDER: "resend",
        RESEND_API_KEY: "test-only-api-key",
      } as NodeJS.ProcessEnv,
      fetchImpl: vi.fn(async () => new Response("provider error", { status: 500 })) as never,
    });

    expect(result).toMatchObject({
      ok: false,
      status: "failed",
      provider: "resend",
      recoveryLinkCreated: true,
      emailSent: false,
    });
    expect(mockMarkPaidResultRecoveryLinkFailed).toHaveBeenCalledWith({
      linkId: "recovery-link-1",
    });
    expect(mockMarkPaidResultRecoveryLinkSent).not.toHaveBeenCalled();
  });

  it("prevents duplicate sends when a sent link already exists", async () => {
    mockFindActivePaidResultAccessLinkForContact.mockResolvedValue({
      id: "existing-link-1",
      status: "sent",
    });

    const result = await createAndSendEmailRecoveryLink({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: "result-1",
      paymentIntentId: "payment-1",
      entitlementId: "entitlement-1",
      recoveryContact: emailContact() as never,
      env: { NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw" } as NodeJS.ProcessEnv,
    });

    expect(result).toMatchObject({
      ok: true,
      status: "duplicate",
      recoveryLinkCreated: false,
      emailSent: false,
    });
    expect(mockCreatePaidResultRecoveryLink).not.toHaveBeenCalled();
  });

  it("prevents duplicate sends when a used active link already exists", async () => {
    mockFindActivePaidResultAccessLinkForContact.mockResolvedValue({
      id: "existing-link-1",
      status: "used",
      usedAt: new Date("2026-06-01T00:00:00.000Z"),
    });

    const result = await createAndSendEmailRecoveryLink({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: "result-1",
      paymentIntentId: "payment-1",
      entitlementId: "entitlement-1",
      recoveryContact: emailContact() as never,
      env: { NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw" } as NodeJS.ProcessEnv,
    });

    expect(result).toMatchObject({
      ok: true,
      status: "duplicate",
      recoveryLinkCreated: false,
      emailSent: false,
    });
    expect(mockCreatePaidResultRecoveryLink).not.toHaveBeenCalled();
  });

  it("creates a new link when no active link exists", async () => {
    const result = await createAndSendEmailRecoveryLink({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: "result-1",
      paymentIntentId: "payment-1",
      entitlementId: "entitlement-1",
      recoveryContact: emailContact() as never,
      env: {
        NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw",
        EMAIL_PROVIDER: "noop",
      } as NodeJS.ProcessEnv,
    });

    expect(result).toMatchObject({
      ok: true,
      status: "noop",
      recoveryLinkCreated: true,
    });
    expect(mockCreatePaidResultRecoveryLink).toHaveBeenCalled();
  });

  it("fails safely when app URL is unavailable", async () => {
    const result = await createAndSendEmailRecoveryLink({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: "result-1",
      paymentIntentId: "payment-1",
      entitlementId: "entitlement-1",
      recoveryContact: emailContact() as never,
      env: {} as NodeJS.ProcessEnv,
    });

    expect(result).toMatchObject({
      ok: false,
      status: "unavailable",
      category: "app_url_unavailable",
      recoveryLinkCreated: true,
      emailSent: false,
    });
    expect(mockMarkPaidResultRecoveryLinkFailed).toHaveBeenCalledWith({
      linkId: "recovery-link-1",
    });
    expect(JSON.stringify(result)).not.toContain(RAW_TOKEN);
  });

  it("auto-sends eligible checkout-start contacts for a completed paid result", async () => {
    const result = await sendRecoveryLinksForCompletedPaidResult({
      moduleSlug: "ambiguous-temperature",
      moduleTitle: "曖昧溫度計",
      analysisResultId: "result-1",
      entitlementId: "entitlement-1",
      env: {
        NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw",
        EMAIL_PROVIDER: "resend",
        RESEND_API_KEY: "test-only-api-key",
      } as NodeJS.ProcessEnv,
      fetchImpl: vi.fn(async () => new Response(JSON.stringify({ id: "email-1" }), {
        status: 200,
      })) as never,
    });

    expect(mockGetEligibleEmailRecoveryContactsForCompletedPaidResult).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: "result-1",
      entitlementId: "entitlement-1",
    });
    expect(result).toEqual({
      attempted: 1,
      sent: 1,
      noop: 0,
      duplicate: 0,
      failed: 0,
      unavailable: 0,
      email: {
        attempted: 1,
        sent: 1,
        noop: 0,
        duplicate: 0,
        failed: 0,
        unavailable: 0,
      },
      line: {
        attempted: 0,
        sent: 0,
        noop: 0,
        duplicate: 0,
        failed: 0,
        unavailable: 0,
      },
    });
    expect(mockMarkPaidResultRecoveryLinkSent).toHaveBeenCalledWith({
      linkId: "recovery-link-1",
    });
    expect(JSON.stringify(result)).not.toContain(RAW_TOKEN);
    expect(JSON.stringify(result)).not.toContain("qa-recovery@example.invalid");
  });

  it("does not auto-send without an entitlement context", async () => {
    const result = await sendRecoveryLinksForCompletedPaidResult({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: "result-1",
      entitlementId: null,
    });

    expect(result).toEqual({
      attempted: 0,
      sent: 0,
      noop: 0,
      duplicate: 0,
      failed: 0,
      unavailable: 0,
      email: {
        attempted: 0,
        sent: 0,
        noop: 0,
        duplicate: 0,
        failed: 0,
        unavailable: 0,
      },
      line: {
        attempted: 0,
        sent: 0,
        noop: 0,
        duplicate: 0,
        failed: 0,
        unavailable: 0,
      },
    });
    expect(mockGetEligibleEmailRecoveryContactsForCompletedPaidResult).not.toHaveBeenCalled();
  });

  it("keeps noop auto-send non-sending and does not mark sent", async () => {
    const result = await sendRecoveryLinksForCompletedPaidResult({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: "result-1",
      entitlementId: "entitlement-1",
      env: {
        NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw",
        EMAIL_PROVIDER: "noop",
      } as NodeJS.ProcessEnv,
    });

    expect(result).toMatchObject({
      attempted: 1,
      sent: 0,
      noop: 1,
    });
    expect(mockMarkPaidResultRecoveryLinkSent).not.toHaveBeenCalled();
  });

  it("records duplicate auto-send without creating another recovery link", async () => {
    mockFindActivePaidResultAccessLinkForContact.mockResolvedValue({
      id: "existing-link-1",
      status: "sent",
      expiresAt: new Date("2026-09-01T00:00:00.000Z"),
    });

    const result = await sendRecoveryLinksForCompletedPaidResult({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: "result-1",
      entitlementId: "entitlement-1",
      env: { NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw" } as NodeJS.ProcessEnv,
    });

    expect(result).toMatchObject({
      attempted: 1,
      duplicate: 1,
      sent: 0,
    });
    expect(mockCreatePaidResultRecoveryLink).not.toHaveBeenCalled();
  });

  it("summarizes provider failures without returning raw identifiers", async () => {
    const result = await sendRecoveryLinksForCompletedPaidResult({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: "result-1",
      entitlementId: "entitlement-1",
      env: {
        NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw",
        EMAIL_PROVIDER: "resend",
        RESEND_API_KEY: "test-only-api-key",
      } as NodeJS.ProcessEnv,
      fetchImpl: vi.fn(async () => new Response("provider error", { status: 500 })) as never,
    });

    expect(result).toMatchObject({
      attempted: 1,
      failed: 1,
      sent: 0,
    });
    expect(mockMarkPaidResultRecoveryLinkFailed).toHaveBeenCalledWith({
      linkId: "recovery-link-1",
    });
    expect(JSON.stringify(result)).not.toContain(RAW_TOKEN);
    expect(JSON.stringify(result)).not.toContain("qa-recovery@example.invalid");
  });

  it("keeps LINE auto-send non-fatal when only hash-only recovery identity is available", async () => {
    mockGetEligibleEmailRecoveryContactsForCompletedPaidResult.mockResolvedValue([]);
    mockGetEligibleLineRecoveryContactsForCompletedPaidResult.mockResolvedValue([
      lineContact(),
    ]);

    const result = await sendRecoveryLinksForCompletedPaidResult({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: "result-1",
      entitlementId: "entitlement-1",
      env: {
        NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw",
        LINE_RECOVERY_MESSAGE_PROVIDER: "line",
        LINE_CHANNEL_ACCESS_TOKEN: "test-only-line-token",
      } as NodeJS.ProcessEnv,
      fetchImpl: vi.fn() as never,
    });

    expect(result).toMatchObject({
      attempted: 1,
      sent: 0,
      failed: 0,
      unavailable: 1,
      line: {
        attempted: 1,
        sent: 0,
        failed: 0,
        unavailable: 1,
      },
    });
    expect(mockCreatePaidResultRecoveryLink).not.toHaveBeenCalled();
    expect(mockMarkPaidResultRecoveryLinkSent).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain("line-user");
    expect(JSON.stringify(result)).not.toContain(RAW_TOKEN);
  });

  it("auto-sends LINE recovery link when recipient secret resolves server-side", async () => {
    mockGetEligibleEmailRecoveryContactsForCompletedPaidResult.mockResolvedValue([]);
    mockGetEligibleLineRecoveryContactsForCompletedPaidResult.mockResolvedValue([
      lineContact(),
    ]);
    mockResolveLineRecoveryRecipientForSending.mockResolvedValue("line-recipient-test-only");

    const result = await sendRecoveryLinksForCompletedPaidResult({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: "result-1",
      entitlementId: "entitlement-1",
      env: {
        NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw",
        LINE_RECOVERY_MESSAGE_PROVIDER: "line",
        LINE_MESSAGING_CHANNEL_ACCESS_TOKEN: "test-only-line-token",
      } as NodeJS.ProcessEnv,
      fetchImpl: vi.fn(async () => new Response("{}", { status: 200 })) as never,
    });

    expect(result).toMatchObject({
      attempted: 1,
      sent: 1,
      failed: 0,
      unavailable: 0,
      line: {
        attempted: 1,
        sent: 1,
        failed: 0,
        unavailable: 0,
      },
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
    expect(mockMarkLineRecoveryRecipientSecretUsed).toHaveBeenCalledWith({
      recoveryContactId: "line-contact-1",
    });
    expect(JSON.stringify(result)).not.toContain("line-recipient-test-only");
    expect(JSON.stringify(result)).not.toContain(RAW_TOKEN);
  });
});
