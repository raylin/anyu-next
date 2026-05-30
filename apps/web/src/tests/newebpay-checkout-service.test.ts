import { beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";

const {
  mockGetAnalysisResultWithRequestById,
  mockGetPaymentIntentByMerchantOrderNo,
  mockCreatePaymentIntent,
  mockMarkPaymentCheckoutStarted,
} = vi.hoisted(() => ({
  mockGetAnalysisResultWithRequestById: vi.fn(),
  mockGetPaymentIntentByMerchantOrderNo: vi.fn(),
  mockCreatePaymentIntent: vi.fn(),
  mockMarkPaymentCheckoutStarted: vi.fn(),
}));

vi.mock("@/lib/db/runtime", () => ({
  getAnalysisResultWithRequestById: mockGetAnalysisResultWithRequestById,
}));

vi.mock("@/lib/db/payment-intents", () => ({
  createPaymentIntent: mockCreatePaymentIntent,
  getPaymentIntentByMerchantOrderNo: mockGetPaymentIntentByMerchantOrderNo,
  markPaymentCheckoutStarted: mockMarkPaymentCheckoutStarted,
}));

import { createNewebPayCheckout } from "@/lib/payments/newebpay/checkout-service";
import type { ProductModuleConfig } from "@/lib/modules/types";

const moduleConfig = {
  moduleId: "ai-temperature",
  slug: "ambiguous-temperature",
  title: "曖昧溫度計",
} as ProductModuleConfig;

const sourceRecord = {
  request: { id: "request-1" },
  result: { id: "result-1" },
};

const createdPaymentIntent = {
  id: "payment-1",
  status: "created",
  merchantOrderNo: "ANYUNPORDEREXISTING000000000",
};

const checkoutStartedPaymentIntent = {
  ...createdPaymentIntent,
  status: "checkout_started",
};

const env = {
  NEWEBPAY_MERCHANT_ID: "MS123456789",
  NEWEBPAY_HASH_KEY: "12345678901234567890123456789012",
  NEWEBPAY_HASH_IV: "1234567890123456",
  NEWEBPAY_CHECKOUT_URL: "https://ccore.newebpay.com/MPG/mpg_gateway",
  NEWEBPAY_NOTIFY_URL: "https://staging.anyu.tw/api/payments/newebpay/notify",
  NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw",
  NEWEBPAY_ENVIRONMENT: "sandbox",
} as NodeJS.ProcessEnv;

function expectedMerchantOrderNo(moduleSlug: string, idempotencyPart: string) {
  return `ANYUNP${crypto
    .createHash("sha256")
    .update(`${moduleSlug}:${idempotencyPart}`)
    .digest("hex")
    .slice(0, 24)
    .toUpperCase()}`;
}

describe("NewebPay checkout service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAnalysisResultWithRequestById.mockResolvedValue(sourceRecord);
    mockGetPaymentIntentByMerchantOrderNo.mockResolvedValue(null);
    mockCreatePaymentIntent.mockResolvedValue(createdPaymentIntent);
    mockMarkPaymentCheckoutStarted.mockResolvedValue(checkoutStartedPaymentIntent);
  });

  it("creates a checkout-started payment intent and provider form contract", async () => {
    const result = await createNewebPayCheckout({
      moduleConfig,
      resultId: "result-1",
      env,
    });
    const merchantOrderNo = expectedMerchantOrderNo("ambiguous-temperature", "result-1");

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.paymentIntent).toEqual(checkoutStartedPaymentIntent);
    expect(result.paymentIntentCreated).toBe(true);
    expect(result.checkoutContract).toMatchObject({
      actionUrl: env.NEWEBPAY_CHECKOUT_URL,
      method: "POST",
      merchantOrderNo,
      returnUrl: `https://staging.anyu.tw/m/ambiguous-temperature/payment/return?merchantOrderNo=${merchantOrderNo}`,
      fields: {
        MerchantID: env.NEWEBPAY_MERCHANT_ID,
        Version: "2.0",
      },
    });
    expect(result.checkoutContract.fields.TradeInfo).toMatch(/^[a-f0-9]+$/u);
    expect(result.checkoutContract.fields.TradeSha).toMatch(/^[A-F0-9]{64}$/u);
    expect(result.checkoutContract.merchantOrderNo).toHaveLength(30);
    expect(mockCreatePaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "newebpay",
        providerEnvironment: "sandbox",
        status: "created",
        amountMinor: 49,
        currency: "TWD",
      }),
    );
    expect(mockMarkPaymentCheckoutStarted).toHaveBeenCalledWith({ paymentIntentId: "payment-1" });
  });

  it("reuses an existing checkout intent idempotently", async () => {
    mockGetPaymentIntentByMerchantOrderNo.mockResolvedValue(checkoutStartedPaymentIntent);

    const result = await createNewebPayCheckout({
      moduleConfig,
      resultId: "result-1",
      idempotencyKey: "idem-1",
      env,
    });
    const merchantOrderNo = expectedMerchantOrderNo("ambiguous-temperature", "idem-1");

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.paymentIntentCreated).toBe(false);
    expect(result.paymentIntent).toEqual(checkoutStartedPaymentIntent);
    expect(result.checkoutContract.merchantOrderNo).toBe(merchantOrderNo);
    expect(mockCreatePaymentIntent).not.toHaveBeenCalled();
    expect(mockMarkPaymentCheckoutStarted).not.toHaveBeenCalled();
  });

  it("fails safely when provider config is missing", async () => {
    const result = await createNewebPayCheckout({
      moduleConfig,
      resultId: "result-1",
      env: {} as NodeJS.ProcessEnv,
    });

    expect(result).toMatchObject({
      ok: false,
      status: 503,
      error: "missing_newebpay_config",
    });
    expect(mockCreatePaymentIntent).not.toHaveBeenCalled();
    expect(mockMarkPaymentCheckoutStarted).not.toHaveBeenCalled();
  });

  it("does not create paid delivery artifacts", async () => {
    await createNewebPayCheckout({ moduleConfig, resultId: "result-1", env });

    expect(mockCreatePaymentIntent).toHaveBeenCalledTimes(1);
    expect(mockMarkPaymentCheckoutStarted).toHaveBeenCalledTimes(1);
  });
});
