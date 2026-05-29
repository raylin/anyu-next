import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetModuleBySlug,
  mockGetAnalysisResultWithRequestById,
  mockGetPaymentIntentByMerchantOrderNo,
  mockCreatePaymentIntent,
  mockMarkPaymentPaid,
  mockGetEntitlementByPaymentIntentId,
  mockCreatePaymentSingleEntitlement,
  mockCreateOrReusePaidAnalysisJob,
  mockResolvePaidAccessToken,
} = vi.hoisted(() => ({
  mockGetModuleBySlug: vi.fn(),
  mockGetAnalysisResultWithRequestById: vi.fn(),
  mockGetPaymentIntentByMerchantOrderNo: vi.fn(),
  mockCreatePaymentIntent: vi.fn(),
  mockMarkPaymentPaid: vi.fn(),
  mockGetEntitlementByPaymentIntentId: vi.fn(),
  mockCreatePaymentSingleEntitlement: vi.fn(),
  mockCreateOrReusePaidAnalysisJob: vi.fn(),
  mockResolvePaidAccessToken: vi.fn(),
}));

vi.mock("@/lib/modules/registry", () => ({
  getModuleBySlug: mockGetModuleBySlug,
}));

vi.mock("@/lib/db/runtime", () => ({
  getAnalysisResultWithRequestById: mockGetAnalysisResultWithRequestById,
}));

vi.mock("@/lib/db/payment-intents", () => ({
  createPaymentIntent: mockCreatePaymentIntent,
  getPaymentIntentByMerchantOrderNo: mockGetPaymentIntentByMerchantOrderNo,
  markPaymentPaid: mockMarkPaymentPaid,
}));

vi.mock("@/lib/db/entitlements", () => ({
  getEntitlementByPaymentIntentId: mockGetEntitlementByPaymentIntentId,
  createPaymentSingleEntitlement: mockCreatePaymentSingleEntitlement,
}));

vi.mock("@/lib/db/generation-jobs", () => ({
  createOrReusePaidAnalysisJob: mockCreateOrReusePaidAnalysisJob,
}));

vi.mock("@/lib/payments/paid-access-resolver", () => ({
  resolvePaidAccessToken: mockResolvePaidAccessToken,
}));

import { createOperatorFakePaidSuccess } from "@/lib/payments/operator-fake-paid-success";

const moduleConfig = {
  moduleId: "ai-temperature",
  slug: "ambiguous-temperature",
  experimentId: "ambiguous-temperature-fake-door-v0",
};
const record = {
  request: {
    id: "request-1",
  },
  result: {
    id: "result-1",
  },
};
const createdPaymentIntent = {
  id: "payment-1",
  status: "created",
};
const paidPaymentIntent = {
  id: "payment-1",
  status: "paid",
};
const entitlement = {
  id: "entitlement-1",
  status: "active",
  paymentIntentId: "payment-1",
};
const job = {
  id: "job-1",
  status: "queued",
};

describe("operator fake paid success service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAID_ACCESS_TOKEN_HASH_SECRET = "test-only-paid-access-secret";
    mockGetModuleBySlug.mockReturnValue(moduleConfig);
    mockGetAnalysisResultWithRequestById.mockResolvedValue(record);
    mockGetPaymentIntentByMerchantOrderNo.mockResolvedValue(null);
    mockCreatePaymentIntent.mockResolvedValue(createdPaymentIntent);
    mockMarkPaymentPaid.mockResolvedValue(paidPaymentIntent);
    mockGetEntitlementByPaymentIntentId.mockResolvedValue(null);
    mockCreatePaymentSingleEntitlement.mockResolvedValue({
      entitlement,
      paidAccessToken: "pa_test-token",
    });
    mockCreateOrReusePaidAnalysisJob.mockResolvedValue({
      job,
      created: true,
    });
    mockResolvePaidAccessToken.mockResolvedValue({
      ok: true,
      state: "pending",
    });
  });

  it("creates fake paid payment, operator entitlement, pa token, and generation job", async () => {
    const result = await createOperatorFakePaidSuccess({
      moduleSlug: "ambiguous-temperature",
      resultId: "result-1",
    });

    expect(result).toMatchObject({
      ok: true,
      paymentIntentCreated: true,
      entitlementCreated: true,
      generationJobCreated: true,
      accessState: "pending",
      paidAccessTokenReturned: true,
      unlockPath: "/m/ambiguous-temperature/unlock/pa_test-token",
    });
    expect(mockCreatePaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "operator_fake",
        providerEnvironment: "unknown",
        status: "created",
        amountMinor: 49,
        currency: "TWD",
      }),
    );
    expect(mockMarkPaymentPaid).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentIntentId: "payment-1",
        providerStatus: "operator_fake_paid",
      }),
    );
    expect(mockCreatePaymentSingleEntitlement).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "operator_test",
        paymentIntentId: "payment-1",
      }),
    );
    expect(mockCreateOrReusePaidAnalysisJob).toHaveBeenCalledWith(
      expect.objectContaining({
        triggerSource: "operator",
        entitlementRefId: "entitlement-1",
        operatorTest: true,
      }),
    );
  });

  it("is idempotent for existing fake payment and entitlement and does not return raw token again", async () => {
    mockGetPaymentIntentByMerchantOrderNo.mockResolvedValue(paidPaymentIntent);
    mockGetEntitlementByPaymentIntentId.mockResolvedValue(entitlement);
    mockCreateOrReusePaidAnalysisJob.mockResolvedValue({
      job,
      created: false,
    });

    const result = await createOperatorFakePaidSuccess({
      moduleSlug: "ambiguous-temperature",
      resultId: "result-1",
    });

    expect(result).toMatchObject({
      ok: true,
      paymentIntentCreated: false,
      entitlementCreated: false,
      generationJobCreated: false,
      paidAccessToken: null,
      paidAccessTokenReturned: false,
      unlockPath: null,
    });
    expect(mockCreatePaymentIntent).not.toHaveBeenCalled();
    expect(mockMarkPaymentPaid).not.toHaveBeenCalled();
    expect(mockCreatePaymentSingleEntitlement).not.toHaveBeenCalled();
    expect(mockResolvePaidAccessToken).not.toHaveBeenCalled();
  });

  it("recovers a missing generation job through the operator path", async () => {
    mockGetPaymentIntentByMerchantOrderNo.mockResolvedValue(paidPaymentIntent);
    mockGetEntitlementByPaymentIntentId.mockResolvedValue(entitlement);
    mockCreateOrReusePaidAnalysisJob.mockResolvedValue({
      job,
      created: true,
    });

    const result = await createOperatorFakePaidSuccess({
      moduleSlug: "ambiguous-temperature",
      resultId: "result-1",
    });

    expect(result).toMatchObject({
      ok: true,
      entitlementCreated: false,
      generationJobCreated: true,
    });
    expect(mockCreateOrReusePaidAnalysisJob).toHaveBeenCalledWith(
      expect.objectContaining({
        entitlementRefId: "entitlement-1",
      }),
    );
  });

  it("fails safely before payment creation when paid access token hash secret is missing", async () => {
    delete process.env.PAID_ACCESS_TOKEN_HASH_SECRET;

    const result = await createOperatorFakePaidSuccess({
      moduleSlug: "ambiguous-temperature",
      resultId: "result-1",
    });

    expect(result).toEqual({
      ok: false,
      status: 503,
      error: "paid_access_token_config_missing",
    });
    expect(mockGetPaymentIntentByMerchantOrderNo).toHaveBeenCalled();
    expect(mockCreatePaymentIntent).not.toHaveBeenCalled();
    expect(mockCreatePaymentSingleEntitlement).not.toHaveBeenCalled();
    expect(mockCreateOrReusePaidAnalysisJob).not.toHaveBeenCalled();
  });

  it("returns a safe token creation category if entitlement hashing fails", async () => {
    mockCreatePaymentSingleEntitlement.mockRejectedValue(
      new Error("paid_access_token_hash_secret_missing"),
    );

    const result = await createOperatorFakePaidSuccess({
      moduleSlug: "ambiguous-temperature",
      resultId: "result-1",
    });

    expect(result).toEqual({
      ok: false,
      status: 500,
      error: "paid_access_token_create_failed",
    });
    expect(mockCreateOrReusePaidAnalysisJob).not.toHaveBeenCalled();
  });
});
