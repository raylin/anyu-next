import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetModuleBySlug,
  mockGetPaymentIntentByMerchantOrderNo,
  mockGetEntitlementByPaymentIntentId,
  mockGetAnalysisResultWithRequestById,
  mockGetPaidResultForAnalysisResult,
  mockGetGenerationJobByDedupeKey,
} = vi.hoisted(() => ({
  mockGetModuleBySlug: vi.fn(),
  mockGetPaymentIntentByMerchantOrderNo: vi.fn(),
  mockGetEntitlementByPaymentIntentId: vi.fn(),
  mockGetAnalysisResultWithRequestById: vi.fn(),
  mockGetPaidResultForAnalysisResult: vi.fn(),
  mockGetGenerationJobByDedupeKey: vi.fn(),
}));

vi.mock("@/lib/modules/registry", () => ({
  getModuleBySlug: mockGetModuleBySlug,
}));

vi.mock("@/lib/db/payment-intents", () => ({
  getPaymentIntentByMerchantOrderNo: mockGetPaymentIntentByMerchantOrderNo,
}));

vi.mock("@/lib/db/entitlements", () => ({
  getEntitlementByPaymentIntentId: mockGetEntitlementByPaymentIntentId,
}));

vi.mock("@/lib/db/runtime", () => ({
  getAnalysisResultWithRequestById: mockGetAnalysisResultWithRequestById,
}));

vi.mock("@/lib/db/paid-results", () => ({
  getPaidResultForAnalysisResult: mockGetPaidResultForAnalysisResult,
}));

vi.mock("@/lib/db/generation-jobs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/db/generation-jobs")>();

  return {
    ...actual,
    getGenerationJobByDedupeKey: mockGetGenerationJobByDedupeKey,
  };
});

import { createPaymentCheckoutSessionToken } from "@/lib/payments/payment-checkout-session";
import { resolvePaymentAccessHandoff } from "@/lib/payments/payment-access-handoff";

const env = {
  PAYMENT_CHECKOUT_SESSION_SECRET: "test-only-checkout-session-secret",
} as NodeJS.ProcessEnv;
const paymentIntent = {
  id: "payment-1",
  provider: "newebpay",
  status: "checkout_started",
  moduleSlug: "ambiguous-temperature",
  merchantOrderNo: "ANYUNPORDEREXISTING000000000",
};
const moduleConfig = {
  moduleId: "ai-temperature",
  slug: "ambiguous-temperature",
};
const entitlement = {
  id: "entitlement-1",
  analysisResultId: "result-1",
  paymentIntentId: "payment-1",
};
const record = {
  request: { anonymousSessionId: "session-1" },
  result: {
    id: "result-1",
    normalizedResultJson: {},
    scoreBucket: "warm",
    createdAt: new Date("2026-05-30T00:00:00.000Z"),
  },
};

function checkoutToken() {
  const created = createPaymentCheckoutSessionToken({
    moduleSlug: "ambiguous-temperature",
    merchantOrderNo: "ANYUNPORDEREXISTING000000000",
    env,
  });

  if (!created.ok) throw new Error("expected checkout token");

  return created.token;
}

describe("payment access handoff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetModuleBySlug.mockReturnValue(moduleConfig);
    mockGetPaymentIntentByMerchantOrderNo.mockResolvedValue(paymentIntent);
    mockGetEntitlementByPaymentIntentId.mockResolvedValue(null);
    mockGetAnalysisResultWithRequestById.mockResolvedValue(record);
    mockGetPaidResultForAnalysisResult.mockResolvedValue(null);
    mockGetGenerationJobByDedupeKey.mockResolvedValue(null);
  });

  it("rejects invalid checkout sessions", async () => {
    const result = await resolvePaymentAccessHandoff({
      moduleSlug: "ambiguous-temperature",
      checkoutToken: "bad-token",
      env,
    });

    expect(result).toEqual({
      ok: false,
      state: "invalid_session",
      errorCategory: "invalid_session",
    });
    expect(mockGetPaymentIntentByMerchantOrderNo).not.toHaveBeenCalled();
  });

  it("does not reveal access for unpaid payment intents", async () => {
    const result = await resolvePaymentAccessHandoff({
      moduleSlug: "ambiguous-temperature",
      checkoutToken: checkoutToken(),
      env,
    });

    expect(result).toMatchObject({
      ok: true,
      state: "waiting_for_payment",
      accessPath: null,
      retryable: true,
    });
  });

  it("returns paid_processing after verified payment before result is ready", async () => {
    mockGetPaymentIntentByMerchantOrderNo.mockResolvedValue({
      ...paymentIntent,
      status: "paid",
    });
    mockGetEntitlementByPaymentIntentId.mockResolvedValue(entitlement);
    mockGetGenerationJobByDedupeKey.mockResolvedValue({ id: "job-1", status: "queued" });

    const result = await resolvePaymentAccessHandoff({
      moduleSlug: "ambiguous-temperature",
      checkoutToken: checkoutToken(),
      env,
    });

    expect(result).toMatchObject({
      ok: true,
      state: "paid_processing",
      accessPath: null,
      retryable: true,
    });
  });

  it("returns paid_ready with a session-bound access path when paid result is completed", async () => {
    mockGetPaymentIntentByMerchantOrderNo.mockResolvedValue({
      ...paymentIntent,
      status: "paid",
    });
    mockGetEntitlementByPaymentIntentId.mockResolvedValue(entitlement);
    mockGetPaidResultForAnalysisResult.mockResolvedValue({
      status: "completed",
      paidResultJson: { fullSummary: "synthetic" },
    });

    const result = await resolvePaymentAccessHandoff({
      moduleSlug: "ambiguous-temperature",
      checkoutToken: checkoutToken(),
      env,
    });

    expect(result).toMatchObject({
      ok: true,
      state: "paid_ready",
      retryable: false,
    });
    if (!result.ok) throw new Error("expected ok");
    expect(result.accessPath).toContain("/m/ambiguous-temperature/payment/access?checkoutToken=pcs_");
    expect(result.accessPath).not.toContain("pa_");
  });
});

