import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetEntitlementByPaymentIntentId,
  mockCreatePaymentSingleEntitlement,
  mockCreateOrReusePaidAnalysisJob,
  mockBindRecoveryContactsToEntitlement,
  mockResolvePaidAccessToken,
} = vi.hoisted(() => ({
  mockGetEntitlementByPaymentIntentId: vi.fn(),
  mockCreatePaymentSingleEntitlement: vi.fn(),
  mockCreateOrReusePaidAnalysisJob: vi.fn(),
  mockBindRecoveryContactsToEntitlement: vi.fn(),
  mockResolvePaidAccessToken: vi.fn(),
}));

vi.mock("@/lib/db/entitlements", () => ({
  getEntitlementByPaymentIntentId: mockGetEntitlementByPaymentIntentId,
  createPaymentSingleEntitlement: mockCreatePaymentSingleEntitlement,
}));

vi.mock("@/lib/db/generation-jobs", () => ({
  createOrReusePaidAnalysisJob: mockCreateOrReusePaidAnalysisJob,
}));

vi.mock("@/lib/db/payment-recovery-contacts", () => ({
  bindRecoveryContactsToEntitlement: mockBindRecoveryContactsToEntitlement,
}));

vi.mock("@/lib/payments/paid-access-resolver", () => ({
  resolvePaidAccessToken: mockResolvePaidAccessToken,
}));

import { createPaidDeliveryArtifactsForPaymentIntent } from "@/lib/payments/paid-delivery-artifacts";

const paymentIntent = {
  id: "payment-1",
  moduleSlug: "ambiguous-temperature",
  analysisRequestId: "request-1",
  analysisResultId: "result-1",
  unlockIntentId: null,
};
const entitlement = {
  id: "entitlement-1",
  paymentIntentId: "payment-1",
  status: "active",
};
const generationJob = {
  id: "job-1",
  status: "queued",
};

describe("paid delivery artifacts service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAID_ACCESS_TOKEN_HASH_SECRET = "test-only-paid-access-secret";
    mockGetEntitlementByPaymentIntentId.mockResolvedValue(null);
    mockCreatePaymentSingleEntitlement.mockResolvedValue({
      entitlement,
      paidAccessToken: "synthetic-paid-access-token",
    });
    mockCreateOrReusePaidAnalysisJob.mockResolvedValue({
      job: generationJob,
      created: true,
    });
    mockBindRecoveryContactsToEntitlement.mockResolvedValue([]);
    mockResolvePaidAccessToken.mockResolvedValue({
      ok: true,
      state: "pending",
    });
  });

  it("creates entitlement, hash-at-rest paid token, and generation job for provider payments without exposing raw token", async () => {
    const result = await createPaidDeliveryArtifactsForPaymentIntent({
      paymentIntent,
      entitlementSource: "payment_single",
      generationJobTriggerSource: "payment_success_future",
      exposeRawPaidAccessToken: false,
    });

    expect(result).toMatchObject({
      ok: true,
      entitlementCreated: true,
      generationJobCreated: true,
      accessState: "pending",
      paidAccessToken: null,
      paidAccessTokenReturned: false,
      unlockPath: null,
    });
    expect(mockCreatePaymentSingleEntitlement).toHaveBeenCalledWith(
      expect.objectContaining({
        moduleSlug: "ambiguous-temperature",
        analysisRequestId: "request-1",
        analysisResultId: "result-1",
        paymentIntentId: "payment-1",
        source: "payment_single",
      }),
    );
    expect(mockCreateOrReusePaidAnalysisJob).toHaveBeenCalledWith(
      expect.objectContaining({
        moduleSlug: "ambiguous-temperature",
        analysisResultId: "result-1",
        triggerSource: "payment_success_future",
        entitlementRefId: "entitlement-1",
        operatorTest: false,
      }),
    );
    expect(mockBindRecoveryContactsToEntitlement).toHaveBeenCalledWith({
      paymentIntentId: "payment-1",
      entitlementId: "entitlement-1",
    });
    expect(mockResolvePaidAccessToken).not.toHaveBeenCalled();
  });

  it("does not fail paid delivery if recovery contact binding fails", async () => {
    mockBindRecoveryContactsToEntitlement.mockRejectedValueOnce(
      new Error("recovery_binding_failed"),
    );

    const result = await createPaidDeliveryArtifactsForPaymentIntent({
      paymentIntent,
      entitlementSource: "payment_single",
      generationJobTriggerSource: "newebpay_notify",
      exposeRawPaidAccessToken: false,
    });

    expect(result).toMatchObject({
      ok: true,
      entitlementCreated: true,
      generationJobCreated: true,
    });
    expect(mockCreateOrReusePaidAnalysisJob).toHaveBeenCalled();
  });

  it("can expose the raw token only for explicit operator-controlled paths", async () => {
    const result = await createPaidDeliveryArtifactsForPaymentIntent({
      paymentIntent,
      entitlementSource: "operator_test",
      generationJobTriggerSource: "operator",
      operatorTest: true,
      exposeRawPaidAccessToken: true,
    });

    expect(result).toMatchObject({
      ok: true,
      paidAccessToken: "synthetic-paid-access-token",
      paidAccessTokenReturned: true,
      unlockPath: "/m/ambiguous-temperature/unlock/synthetic-paid-access-token",
    });
    expect(mockResolvePaidAccessToken).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      rawToken: "synthetic-paid-access-token",
    });
  });

  it("reuses existing entitlement and generation job idempotently", async () => {
    mockGetEntitlementByPaymentIntentId.mockResolvedValue(entitlement);
    mockCreateOrReusePaidAnalysisJob.mockResolvedValue({
      job: generationJob,
      created: false,
    });

    const result = await createPaidDeliveryArtifactsForPaymentIntent({
      paymentIntent,
      entitlementSource: "payment_single",
      generationJobTriggerSource: "payment_success_future",
    });

    expect(result).toMatchObject({
      ok: true,
      entitlementCreated: false,
      generationJobCreated: false,
      paidAccessTokenReturned: false,
    });
    expect(mockCreatePaymentSingleEntitlement).not.toHaveBeenCalled();
  });

  it("reuses an existing entitlement after a payment-intent unique conflict", async () => {
    mockGetEntitlementByPaymentIntentId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...entitlement, status: "refunded" });
    mockCreatePaymentSingleEntitlement.mockRejectedValueOnce({
      code: "23505",
      constraint: "entitlements_payment_intent_unique_idx",
    });
    mockCreateOrReusePaidAnalysisJob.mockResolvedValue({
      job: generationJob,
      created: false,
    });

    const result = await createPaidDeliveryArtifactsForPaymentIntent({
      paymentIntent,
      entitlementSource: "payment_single",
      generationJobTriggerSource: "newebpay_notify",
      exposeRawPaidAccessToken: true,
    });

    expect(result).toMatchObject({
      ok: true,
      entitlement: { id: "entitlement-1", status: "refunded" },
      entitlementCreated: false,
      generationJobCreated: false,
      paidAccessToken: null,
      paidAccessTokenReturned: false,
      unlockPath: null,
    });
    expect(mockGetEntitlementByPaymentIntentId).toHaveBeenCalledTimes(2);
    expect(mockCreateOrReusePaidAnalysisJob).toHaveBeenCalledWith(
      expect.objectContaining({
        triggerSource: "newebpay_notify",
        entitlementRefId: "entitlement-1",
      }),
    );
  });

  it("returns entitlement unavailable if unique conflict cannot be resolved by reread", async () => {
    mockGetEntitlementByPaymentIntentId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    mockCreatePaymentSingleEntitlement.mockRejectedValueOnce({
      cause: {
        code: "23505",
        constraint: "entitlements_payment_intent_unique_idx",
      },
    });

    const result = await createPaidDeliveryArtifactsForPaymentIntent({
      paymentIntent,
      entitlementSource: "payment_single",
      generationJobTriggerSource: "newebpay_notify",
    });

    expect(result).toEqual({
      ok: false,
      status: 500,
      error: "entitlement_unavailable",
    });
    expect(mockCreateOrReusePaidAnalysisJob).not.toHaveBeenCalled();
  });

  it("fails before creating artifacts when paid access token hash config is missing", async () => {
    delete process.env.PAID_ACCESS_TOKEN_HASH_SECRET;

    const result = await createPaidDeliveryArtifactsForPaymentIntent({
      paymentIntent,
      entitlementSource: "payment_single",
      generationJobTriggerSource: "payment_success_future",
    });

    expect(result).toEqual({
      ok: false,
      status: 503,
      error: "paid_access_token_config_missing",
    });
    expect(mockCreatePaymentSingleEntitlement).not.toHaveBeenCalled();
    expect(mockCreateOrReusePaidAnalysisJob).not.toHaveBeenCalled();
  });
});
