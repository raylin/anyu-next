import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetModuleBySlug,
  mockGetAnalysisResultWithRequestById,
  mockGetPaymentIntentByMerchantOrderNo,
  mockCreatePaymentIntent,
  mockMarkPaymentPaid,
  mockGetEntitlementByPaymentIntentId,
  mockCreatePaidDeliveryArtifactsForPaymentIntent,
} = vi.hoisted(() => ({
  mockGetModuleBySlug: vi.fn(),
  mockGetAnalysisResultWithRequestById: vi.fn(),
  mockGetPaymentIntentByMerchantOrderNo: vi.fn(),
  mockCreatePaymentIntent: vi.fn(),
  mockMarkPaymentPaid: vi.fn(),
  mockGetEntitlementByPaymentIntentId: vi.fn(),
  mockCreatePaidDeliveryArtifactsForPaymentIntent: vi.fn(),
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
}));

vi.mock("@/lib/payments/paid-delivery-artifacts", () => ({
  createPaidDeliveryArtifactsForPaymentIntent: mockCreatePaidDeliveryArtifactsForPaymentIntent,
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
  moduleSlug: "ambiguous-temperature",
};
const paidPaymentIntent = {
  id: "payment-1",
  status: "paid",
  moduleSlug: "ambiguous-temperature",
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
    delete process.env.ENABLE_PAID_JOB_QUEUE_TRIGGER;
    delete process.env.PAID_JOB_QUEUE_PROVIDER;
    mockGetModuleBySlug.mockReturnValue(moduleConfig);
    mockGetAnalysisResultWithRequestById.mockResolvedValue(record);
    mockGetPaymentIntentByMerchantOrderNo.mockResolvedValue(null);
    mockCreatePaymentIntent.mockResolvedValue(createdPaymentIntent);
    mockMarkPaymentPaid.mockResolvedValue(paidPaymentIntent);
    mockGetEntitlementByPaymentIntentId.mockResolvedValue(null);
    mockCreatePaidDeliveryArtifactsForPaymentIntent.mockResolvedValue({
      ok: true,
      entitlement,
      entitlementCreated: true,
      generationJob: job,
      generationJobCreated: true,
      accessState: "pending",
      paidAccessToken: "paid-access-test-token",
      paidAccessTokenReturned: true,
      unlockPath: "/m/ambiguous-temperature/unlock/paid-access-test-token",
      queueTrigger: {
        category: "disabled",
        provider: "none",
      },
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
      unlockPath: "/m/ambiguous-temperature/unlock/paid-access-test-token",
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
    expect(mockCreatePaidDeliveryArtifactsForPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentIntent: paidPaymentIntent,
        entitlementSource: "operator_test",
        generationJobTriggerSource: "operator",
        operatorTest: true,
        exposeRawPaidAccessToken: true,
      }),
    );
  });

  it("is idempotent for existing fake payment and entitlement and does not return raw token again", async () => {
    mockGetPaymentIntentByMerchantOrderNo.mockResolvedValue(paidPaymentIntent);
    mockGetEntitlementByPaymentIntentId.mockResolvedValue(entitlement);
    mockCreatePaidDeliveryArtifactsForPaymentIntent.mockResolvedValue({
      ok: true,
      entitlement,
      entitlementCreated: false,
      generationJob: job,
      generationJobCreated: false,
      accessState: "pending",
      paidAccessToken: null,
      paidAccessTokenReturned: false,
      unlockPath: null,
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
    expect(mockCreatePaidDeliveryArtifactsForPaymentIntent).toHaveBeenCalledTimes(1);
  });

  it("recovers a missing generation job through the operator path", async () => {
    mockGetPaymentIntentByMerchantOrderNo.mockResolvedValue(paidPaymentIntent);
    mockGetEntitlementByPaymentIntentId.mockResolvedValue(entitlement);
    mockCreatePaidDeliveryArtifactsForPaymentIntent.mockResolvedValue({
      ok: true,
      entitlement,
      entitlementCreated: false,
      generationJob: job,
      generationJobCreated: true,
      accessState: "pending",
      paidAccessToken: null,
      paidAccessTokenReturned: false,
      unlockPath: null,
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
    expect(mockCreatePaidDeliveryArtifactsForPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentIntent: paidPaymentIntent,
      }),
    );
  });

  it("returns a safe no-op queue trigger result when explicitly enabled", async () => {
    process.env.ENABLE_PAID_JOB_QUEUE_TRIGGER = "true";
    process.env.PAID_JOB_QUEUE_PROVIDER = "noop";

    const result = await createOperatorFakePaidSuccess({
      moduleSlug: "ambiguous-temperature",
      resultId: "result-1",
    });

    expect(result).toMatchObject({
      ok: true,
      queueTrigger: {
        ok: true,
        category: "noop",
        provider: "noop",
        payload: {
          paymentIntentId: "payment-1",
          generationJobId: "job-1",
          moduleSlug: "ambiguous-temperature",
          triggerSource: "operator_fake_paid",
        },
      },
    });
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
    expect(mockCreatePaidDeliveryArtifactsForPaymentIntent).not.toHaveBeenCalled();
  });

  it("returns a safe token creation category if entitlement hashing fails", async () => {
    mockCreatePaidDeliveryArtifactsForPaymentIntent.mockResolvedValue({
      ok: false,
      status: 500,
      error: "paid_access_token_create_failed",
    });

    const result = await createOperatorFakePaidSuccess({
      moduleSlug: "ambiguous-temperature",
      resultId: "result-1",
    });

    expect(result).toEqual({
      ok: false,
      status: 500,
      error: "paid_access_token_create_failed",
    });
  });
});
