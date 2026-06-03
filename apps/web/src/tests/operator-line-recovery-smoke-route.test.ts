import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockIsOperatorLineRecoverySmokeEnabled,
  mockIsDbConfigured,
  mockGetLatestLineRecoveryContactWithActiveRecipientSecret,
  mockBindRecoveryContactToPaymentContext,
  mockCreateOperatorFakePaidSuccess,
  mockProcessPaidAnalysisJobById,
  mockGetRecentPaidResultRecoveryLinkForContact,
} = vi.hoisted(() => ({
  mockIsOperatorLineRecoverySmokeEnabled: vi.fn(),
  mockIsDbConfigured: vi.fn(),
  mockGetLatestLineRecoveryContactWithActiveRecipientSecret: vi.fn(),
  mockBindRecoveryContactToPaymentContext: vi.fn(),
  mockCreateOperatorFakePaidSuccess: vi.fn(),
  mockProcessPaidAnalysisJobById: vi.fn(),
  mockGetRecentPaidResultRecoveryLinkForContact: vi.fn(),
}));

vi.mock("@/lib/runtime/feature-flags", () => ({
  isOperatorLineRecoverySmokeEnabled: mockIsOperatorLineRecoverySmokeEnabled,
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/db/payment-recovery-contacts", () => ({
  getLatestLineRecoveryContactWithActiveRecipientSecret:
    mockGetLatestLineRecoveryContactWithActiveRecipientSecret,
  bindRecoveryContactToPaymentContext: mockBindRecoveryContactToPaymentContext,
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

import { POST } from "@/app/api/operator/line-recovery-smoke/route";

const RESULT_ID = "22222222-2222-4222-8222-222222222222";
const PAYMENT_INTENT_ID = "33333333-3333-4333-8333-333333333333";
const ENTITLEMENT_ID = "44444444-4444-4444-8444-444444444444";

function request(input: {
  secret?: string;
  body?: Record<string, unknown>;
}) {
  return new Request("http://localhost/api/operator/line-recovery-smoke", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(input.secret ? { "x-operator-test-secret": input.secret } : {}),
    },
    body: JSON.stringify(input.body ?? {
      moduleSlug: "ambiguous-temperature",
      idempotencyKey: "operator-line-recovery-smoke",
    }),
  });
}

describe("operator LINE recovery smoke route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPERATOR_TEST_SECRET = "operator-secret";
    mockIsOperatorLineRecoverySmokeEnabled.mockReturnValue(true);
    mockIsDbConfigured.mockReturnValue(true);
    mockGetLatestLineRecoveryContactWithActiveRecipientSecret.mockResolvedValue({
      id: "line-contact-1",
      analysisResultId: RESULT_ID,
      contactType: "line",
      lineUserHash: "redacted-line-user-hash",
    });
    mockCreateOperatorFakePaidSuccess.mockResolvedValue({
      ok: true,
      paymentIntent: { id: PAYMENT_INTENT_ID, status: "paid" },
      entitlement: { id: ENTITLEMENT_ID, status: "active" },
      generationJob: { id: "job-1" },
    });
    mockBindRecoveryContactToPaymentContext.mockResolvedValue({
      id: "line-contact-1",
      entitlementId: ENTITLEMENT_ID,
    });
    mockProcessPaidAnalysisJobById.mockResolvedValue({
      ok: true,
      category: "processed",
      jobId: "job-1",
      jobResult: "completed",
    });
    mockGetRecentPaidResultRecoveryLinkForContact.mockResolvedValue({
      id: "line-link-1",
      status: "sent",
    });
  });

  it("is disabled when Preview(staging)-only flag is off", async () => {
    mockIsOperatorLineRecoverySmokeEnabled.mockReturnValue(false);

    const response = await POST(request({ secret: "operator-secret" }));

    expect(response.status).toBe(404);
    expect(mockCreateOperatorFakePaidSuccess).not.toHaveBeenCalled();
  });

  it("rejects missing or invalid operator secret", async () => {
    await expect(POST(request({}))).resolves.toMatchObject({ status: 401 });
    await expect(POST(request({ secret: "wrong-secret" }))).resolves.toMatchObject({
      status: 401,
    });
    expect(mockCreateOperatorFakePaidSuccess).not.toHaveBeenCalled();
  });

  it("returns safe recipient-missing category without private values", async () => {
    mockGetLatestLineRecoveryContactWithActiveRecipientSecret.mockResolvedValue(null);

    const response = await POST(request({ secret: "operator-secret" }));
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data).toMatchObject({
      ok: false,
      error: "recipient_secret_missing",
    });
    expect(JSON.stringify(data)).not.toContain("line-user");
    expect(JSON.stringify(data)).not.toContain("recipientHash");
  });

  it("runs sanitized real LINE message smoke response without tokens or LINE identifiers", async () => {
    const response = await POST(request({ secret: "operator-secret" }));
    const data = await response.json();
    const serialized = JSON.stringify(data);

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      autoSendHookExercised: true,
      fakePaidCreated: true,
      lineContactBound: true,
      recipientSecretResolvedServerSide: true,
      processorCategory: "processed",
      processorJobResult: "completed",
      lineMessageSent: true,
      recoveryLinkCreated: true,
      recoveryLinkStatus: "sent",
      rawRecoveryTokenReturned: false,
      tokenHashReturned: false,
      rawLineUserIdReturned: false,
      privateRecipientReturned: false,
      privateRecipientHashReturned: false,
      rawPaidAccessTokenReturned: false,
      rawCheckoutSessionTokenReturned: false,
      reportContentReturned: false,
    });
    expect(mockCreateOperatorFakePaidSuccess).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      resultId: RESULT_ID,
      idempotencyKey: "operator-line-recovery-smoke",
    });
    expect(mockBindRecoveryContactToPaymentContext).toHaveBeenCalledWith({
      recoveryContactId: "line-contact-1",
      paymentIntentId: PAYMENT_INTENT_ID,
      entitlementId: ENTITLEMENT_ID,
    });
    expect(mockGetRecentPaidResultRecoveryLinkForContact).toHaveBeenCalledWith({
      entitlementId: ENTITLEMENT_ID,
      recoveryContactId: "line-contact-1",
      channel: "line",
    });
    expect(serialized).not.toContain("operator-secret");
    expect(serialized).not.toContain("line-user");
    expect(serialized).not.toContain("idToken");
    expect(serialized).not.toContain("encryptedRecipient");
    expect(serialized).not.toContain("recipientHash");
    expect(serialized).not.toContain("prl_");
    expect(serialized).not.toContain("pa_");
    expect(serialized).not.toContain("pcs_");
  });
});
