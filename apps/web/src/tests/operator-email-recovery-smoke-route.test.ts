import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockIsOperatorEmailRecoverySmokeEnabled,
  mockIsDbConfigured,
  mockCreateOrUpdatePostPaymentEmailRecoveryContact,
  mockCreateAndSendEmailRecoveryLink,
  mockCreateOperatorFakePaidSuccess,
  mockProcessPaidAnalysisJobById,
  mockGetRecentPaidResultRecoveryLinkForContact,
} = vi.hoisted(() => ({
  mockIsOperatorEmailRecoverySmokeEnabled: vi.fn(),
  mockIsDbConfigured: vi.fn(),
  mockCreateOrUpdatePostPaymentEmailRecoveryContact: vi.fn(),
  mockCreateAndSendEmailRecoveryLink: vi.fn(),
  mockCreateOperatorFakePaidSuccess: vi.fn(),
  mockProcessPaidAnalysisJobById: vi.fn(),
  mockGetRecentPaidResultRecoveryLinkForContact: vi.fn(),
}));

vi.mock("@/lib/runtime/feature-flags", () => ({
  isOperatorEmailRecoverySmokeEnabled: mockIsOperatorEmailRecoverySmokeEnabled,
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/db/payment-recovery-contacts", () => ({
  createOrUpdatePostPaymentEmailRecoveryContact: mockCreateOrUpdatePostPaymentEmailRecoveryContact,
}));

vi.mock("@/lib/notifications/email-recovery-link", () => ({
  createAndSendEmailRecoveryLink: mockCreateAndSendEmailRecoveryLink,
}));

vi.mock("@/lib/payments/operator-fake-paid-success", () => ({
  createOperatorFakePaidSuccess: mockCreateOperatorFakePaidSuccess,
}));

vi.mock("@/lib/modules/paid-generation-processor", () => ({
  processPaidAnalysisJobById: mockProcessPaidAnalysisJobById,
}));

vi.mock("@/lib/db/paid-result-recovery-links", () => ({
  getRecentPaidResultRecoveryLinkForContact: mockGetRecentPaidResultRecoveryLinkForContact,
}));

import { POST, PUT } from "@/app/api/operator/email-recovery-smoke/route";

const RESULT_ID = "22222222-2222-4222-8222-222222222222";
const PAYMENT_INTENT_ID = "33333333-3333-4333-8333-333333333333";
const ENTITLEMENT_ID = "44444444-4444-4444-8444-444444444444";

function request(input: {
  secret?: string;
  body?: Record<string, unknown>;
}) {
  return new Request("http://localhost/api/operator/email-recovery-smoke", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(input.secret ? { "x-operator-test-secret": input.secret } : {}),
    },
    body: JSON.stringify(input.body ?? {
      moduleSlug: "ambiguous-temperature",
      resultId: RESULT_ID,
      paymentIntentId: PAYMENT_INTENT_ID,
      entitlementId: ENTITLEMENT_ID,
      email: "owner@example.invalid",
    }),
  });
}

describe("operator email recovery smoke route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPERATOR_TEST_SECRET = "operator-secret";
    mockIsOperatorEmailRecoverySmokeEnabled.mockReturnValue(true);
    mockIsDbConfigured.mockReturnValue(true);
    mockCreateOrUpdatePostPaymentEmailRecoveryContact.mockResolvedValue({
      id: "contact-1",
      contactType: "email",
      contactEncrypted: "encrypted",
    });
    mockCreateAndSendEmailRecoveryLink.mockResolvedValue({
      ok: true,
      provider: "resend",
      status: "sent",
      recoveryLinkCreated: true,
      emailSent: true,
    });
    mockCreateOperatorFakePaidSuccess.mockResolvedValue({
      ok: true,
      generationJob: { id: "job-1" },
      entitlement: { id: ENTITLEMENT_ID, status: "active" },
      recoveryContactId: "contact-1",
    });
    mockProcessPaidAnalysisJobById.mockResolvedValue({
      ok: true,
      category: "processed",
      jobId: "job-1",
      jobResult: "completed",
    });
    mockGetRecentPaidResultRecoveryLinkForContact.mockResolvedValue({
      id: "link-1",
      status: "sent",
    });
  });

  it("is disabled when Preview(staging)-only flag is off", async () => {
    mockIsOperatorEmailRecoverySmokeEnabled.mockReturnValue(false);

    const response = await POST(request({ secret: "operator-secret" }));

    expect(response.status).toBe(404);
    expect(mockCreateAndSendEmailRecoveryLink).not.toHaveBeenCalled();
  });

  it("rejects missing or invalid operator secret", async () => {
    await expect(POST(request({}))).resolves.toMatchObject({ status: 401 });
    await expect(POST(request({ secret: "wrong-secret" }))).resolves.toMatchObject({
      status: 401,
    });
    expect(mockCreateAndSendEmailRecoveryLink).not.toHaveBeenCalled();
  });

  it("rejects invalid payloads safely", async () => {
    const response = await POST(request({
      secret: "operator-secret",
      body: {
        moduleSlug: "ambiguous-temperature",
        resultId: "not-a-uuid",
        paymentIntentId: PAYMENT_INTENT_ID,
        entitlementId: ENTITLEMENT_ID,
        email: "owner@example.invalid",
      },
    }));

    expect(response.status).toBe(400);
    expect(mockCreateAndSendEmailRecoveryLink).not.toHaveBeenCalled();
  });

  it("sends a sanitized real-provider smoke response without token or email values", async () => {
    const response = await POST(request({ secret: "operator-secret" }));
    const data = await response.json();
    const serialized = JSON.stringify(data);

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      provider: "resend",
      sendStatus: "sent",
      category: null,
      recoveryLinkCreated: true,
      emailSent: true,
      autoSendHookExercised: false,
      rawRecoveryTokenReturned: false,
      tokenHashReturned: false,
      rawEmailReturned: false,
      rawPaidAccessTokenReturned: false,
      rawCheckoutSessionTokenReturned: false,
      reportContentReturned: false,
    });
    expect(serialized).not.toContain("operator-secret");
    expect(serialized).not.toContain("owner@example.invalid");
    expect(serialized).not.toContain("prl_");
    expect(serialized).not.toContain("pa_");
    expect(serialized).not.toContain("pcs_");
    expect(serialized).not.toContain("stored-token-hash");
    expect(mockCreateOrUpdatePostPaymentEmailRecoveryContact).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: RESULT_ID,
      paymentIntentId: PAYMENT_INTENT_ID,
      entitlementId: ENTITLEMENT_ID,
      email: "owner@example.invalid",
      source: "completed_result",
      marketingOptInAt: null,
    });
    expect(mockCreateAndSendEmailRecoveryLink).toHaveBeenCalledWith(
      expect.objectContaining({
        moduleSlug: "ambiguous-temperature",
        moduleTitle: "曖昧溫度計",
        analysisResultId: RESULT_ID,
        paymentIntentId: PAYMENT_INTENT_ID,
        entitlementId: ENTITLEMENT_ID,
      }),
    );
  });

  it("returns safe provider failure categories", async () => {
    mockCreateAndSendEmailRecoveryLink.mockResolvedValue({
      ok: false,
      provider: "resend",
      status: "failed",
      category: "provider_error",
      recoveryLinkCreated: true,
      emailSent: false,
    });

    const response = await POST(request({ secret: "operator-secret" }));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toMatchObject({
      ok: false,
      provider: "resend",
      sendStatus: "failed",
      category: "provider_error",
      recoveryLinkCreated: true,
      emailSent: false,
    });
    expect(JSON.stringify(data)).not.toContain("owner@example.invalid");
  });

  it("runs sanitized auto-send smoke through fake-paid and paid generation completion", async () => {
    const response = await PUT(request({
      secret: "operator-secret",
      body: {
        moduleSlug: "ambiguous-temperature",
        resultId: RESULT_ID,
        email: "owner@example.invalid",
        idempotencyKey: "operator-auto-send-smoke",
      },
    }));
    const data = await response.json();
    const serialized = JSON.stringify(data);

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      autoSendHookExercised: true,
      fakePaidCreated: true,
      recoveryContactCreated: true,
      processorCategory: "processed",
      processorJobResult: "completed",
      emailSent: true,
      recoveryLinkCreated: true,
      recoveryLinkStatus: "sent",
      rawRecoveryTokenReturned: false,
      tokenHashReturned: false,
      rawEmailReturned: false,
      rawPaidAccessTokenReturned: false,
      rawCheckoutSessionTokenReturned: false,
      reportContentReturned: false,
    });
    expect(mockCreateOperatorFakePaidSuccess).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      resultId: RESULT_ID,
      idempotencyKey: "operator-auto-send-smoke",
      recoveryEmail: "owner@example.invalid",
    });
    expect(mockProcessPaidAnalysisJobById).toHaveBeenCalledWith({
      generationJobId: "job-1",
      lockedBy: "operator_email_recovery_auto_send_smoke",
    });
    expect(mockGetRecentPaidResultRecoveryLinkForContact).toHaveBeenCalledWith({
      entitlementId: ENTITLEMENT_ID,
      recoveryContactId: "contact-1",
      channel: "email",
    });
    expect(serialized).not.toContain("owner@example.invalid");
    expect(serialized).not.toContain("operator-secret");
    expect(serialized).not.toContain("prl_");
    expect(serialized).not.toContain("pa_");
    expect(serialized).not.toContain("pcs_");
  });

  it("keeps auto-send smoke disabled under the same Preview-only feature gate", async () => {
    mockIsOperatorEmailRecoverySmokeEnabled.mockReturnValue(false);

    const response = await PUT(request({
      secret: "operator-secret",
      body: {
        moduleSlug: "ambiguous-temperature",
        resultId: RESULT_ID,
        email: "owner@example.invalid",
      },
    }));

    expect(response.status).toBe(404);
    expect(mockCreateOperatorFakePaidSuccess).not.toHaveBeenCalled();
  });
});
