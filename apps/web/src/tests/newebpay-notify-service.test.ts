import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createNewebPayTradeSha,
  encryptNewebPayTradeInfo,
  NEWEBPAY_MPG_VERSION,
} from "@/lib/payments/newebpay/checkout-payload";
import { processNewebPayNotify } from "@/lib/payments/newebpay/notify-service";

const {
  mockGetPaymentIntentByMerchantOrderNo,
  mockMarkPaymentPaid,
  mockCreatePaidDeliveryArtifactsForPaymentIntent,
} = vi.hoisted(() => ({
  mockGetPaymentIntentByMerchantOrderNo: vi.fn(),
  mockMarkPaymentPaid: vi.fn(),
  mockCreatePaidDeliveryArtifactsForPaymentIntent: vi.fn(),
}));

vi.mock("@/lib/db/payment-intents", () => ({
  getPaymentIntentByMerchantOrderNo: mockGetPaymentIntentByMerchantOrderNo,
  markPaymentPaid: mockMarkPaymentPaid,
}));

vi.mock("@/lib/payments/paid-delivery-artifacts", () => ({
  createPaidDeliveryArtifactsForPaymentIntent: mockCreatePaidDeliveryArtifactsForPaymentIntent,
}));

const env = {
  NEWEBPAY_MERCHANT_ID: "MS123456789",
  NEWEBPAY_HASH_KEY: "12345678901234567890123456789012",
  NEWEBPAY_HASH_IV: "1234567890123456",
  NEWEBPAY_CHECKOUT_URL: "https://ccore.newebpay.com/MPG/mpg_gateway",
  NEWEBPAY_NOTIFY_URL: "https://staging.anyu.tw/api/payments/newebpay/notify",
  NEXT_PUBLIC_APP_URL: "https://staging.anyu.tw",
  NEWEBPAY_ENVIRONMENT: "sandbox",
} as NodeJS.ProcessEnv;

const paymentIntent = {
  id: "payment-1",
  provider: "newebpay",
  status: "checkout_started",
  amountMinor: 49,
  currency: "TWD",
  merchantOrderNo: "ANYUNP123456789012345678901234",
  moduleSlug: "ambiguous-temperature",
};

const config = {
  ok: true,
  merchantId: env.NEWEBPAY_MERCHANT_ID,
  hashKey: env.NEWEBPAY_HASH_KEY,
  hashIv: env.NEWEBPAY_HASH_IV,
  checkoutUrl: env.NEWEBPAY_CHECKOUT_URL,
  returnUrlBase: env.NEXT_PUBLIC_APP_URL,
  notifyUrl: env.NEWEBPAY_NOTIFY_URL,
  providerEnvironment: "sandbox",
} as const;

function notifyPayload(overrides: Record<string, unknown> = {}) {
  const resultOverrides = (overrides.Result as Record<string, unknown> | undefined) ?? {};
  const topLevelOverrides = { ...overrides };
  delete topLevelOverrides.Result;
  const tradeInfo = encryptNewebPayTradeInfo(JSON.stringify({
    Status: "SUCCESS",
    Message: "付款成功",
    Result: {
      MerchantOrderNo: paymentIntent.merchantOrderNo,
      Amt: 49,
      RespondCode: "00",
      TradeNo: "newebpay-trade-1",
      PaymentType: "CREDIT",
      PayTime: "2026-05-30 12:00:00",
      ...resultOverrides,
    },
    ...topLevelOverrides,
  }), config);

  return {
    MerchantID: env.NEWEBPAY_MERCHANT_ID,
    TradeInfo: tradeInfo,
    TradeSha: createNewebPayTradeSha(tradeInfo, config),
    Version: NEWEBPAY_MPG_VERSION,
  };
}

describe("NewebPay NotifyURL service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPaymentIntentByMerchantOrderNo.mockResolvedValue(paymentIntent);
    mockMarkPaymentPaid.mockResolvedValue({
      ...paymentIntent,
      status: "paid",
      providerStatus: "SUCCESS",
    });
    mockCreatePaidDeliveryArtifactsForPaymentIntent.mockResolvedValue({
      ok: true,
      entitlement: { id: "entitlement-1" },
      entitlementCreated: true,
      generationJob: { id: "job-1", status: "queued" },
      generationJobCreated: true,
      accessState: "pending",
      paidAccessToken: null,
      paidAccessTokenReturned: false,
      unlockPath: null,
    });
  });

  it("returns a safe config error without mutating when provider config is missing", async () => {
    const result = await processNewebPayNotify(notifyPayload(), {} as NodeJS.ProcessEnv);

    expect(result).toMatchObject({
      ok: false,
      status: 503,
      category: "provider_config_missing",
    });
    expect(mockGetPaymentIntentByMerchantOrderNo).not.toHaveBeenCalled();
    expect(mockMarkPaymentPaid).not.toHaveBeenCalled();
  });

  it("rejects malformed payloads without mutating payment state", async () => {
    const result = await processNewebPayNotify({ MerchantID: env.NEWEBPAY_MERCHANT_ID }, env);

    expect(result).toMatchObject({
      ok: false,
      status: 400,
      category: "malformed_payload",
    });
    expect(mockMarkPaymentPaid).not.toHaveBeenCalled();
  });

  it("rejects invalid signatures without mutating payment state", async () => {
    const payload = notifyPayload();
    const result = await processNewebPayNotify({ ...payload, TradeSha: "BAD" }, env);

    expect(result).toMatchObject({
      ok: false,
      status: 400,
      category: "signature_invalid",
    });
    expect(mockMarkPaymentPaid).not.toHaveBeenCalled();
  });

  it("marks a matching pending payment intent paid for verified successful NotifyURL", async () => {
    const result = await processNewebPayNotify(notifyPayload(), env);

    expect(result).toMatchObject({
      ok: true,
      category: "payment_marked_paid",
      paymentIntentStatus: "paid",
      delivery: {
        entitlementCreated: true,
        generationJobCreated: true,
        paidAccessTokenReturned: false,
      },
      queueTrigger: {
        category: "disabled",
        provider: "none",
      },
    });
    expect(mockGetPaymentIntentByMerchantOrderNo).toHaveBeenCalledWith(
      paymentIntent.merchantOrderNo,
    );
    expect(mockMarkPaymentPaid).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentIntentId: paymentIntent.id,
        providerStatus: "SUCCESS",
        providerTradeNo: "newebpay-trade-1",
        providerPaymentType: "CREDIT",
        providerResponseCode: "00",
        providerMessageCategory: "付款成功",
      }),
    );
    expect(mockCreatePaidDeliveryArtifactsForPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentIntent: expect.objectContaining({ id: "payment-1", status: "paid" }),
        entitlementSource: "payment_single",
        generationJobTriggerSource: "payment_success_future",
        operatorTest: false,
        exposeRawPaidAccessToken: false,
      }),
    );
  });

  it("treats duplicate paid NotifyURL as idempotent without another paid transition or duplicate artifacts", async () => {
    mockCreatePaidDeliveryArtifactsForPaymentIntent.mockResolvedValue({
      ok: true,
      entitlement: { id: "entitlement-1" },
      entitlementCreated: false,
      generationJob: { id: "job-1", status: "queued" },
      generationJobCreated: false,
      accessState: "pending",
      paidAccessToken: null,
      paidAccessTokenReturned: false,
      unlockPath: null,
    });
    mockGetPaymentIntentByMerchantOrderNo.mockResolvedValue({
      ...paymentIntent,
      status: "paid",
    });

    const result = await processNewebPayNotify(notifyPayload(), env);

    expect(result).toMatchObject({
      ok: true,
      category: "duplicate_notify",
      paymentIntentStatus: "paid",
      delivery: {
        entitlementCreated: false,
        generationJobCreated: false,
      },
      queueTrigger: {
        category: "disabled",
        provider: "none",
      },
    });
    expect(mockMarkPaymentPaid).not.toHaveBeenCalled();
    expect(mockCreatePaidDeliveryArtifactsForPaymentIntent).toHaveBeenCalledTimes(1);
  });

  it("does not mark paid when amount mismatches", async () => {
    const result = await processNewebPayNotify(
      notifyPayload({ Result: { Amt: 50 } }),
      env,
    );

    expect(result).toMatchObject({
      ok: false,
      status: 409,
      category: "amount_mismatch",
    });
    expect(mockMarkPaymentPaid).not.toHaveBeenCalled();
    expect(mockCreatePaidDeliveryArtifactsForPaymentIntent).not.toHaveBeenCalled();
  });

  it("does not mark paid when provider status is not successful", async () => {
    const result = await processNewebPayNotify(
      notifyPayload({ Status: "MPG03009", Message: "付款取消" }),
      env,
    );

    expect(result).toMatchObject({
      ok: false,
      status: 409,
      category: "payment_not_success",
    });
    expect(mockMarkPaymentPaid).not.toHaveBeenCalled();
    expect(mockCreatePaidDeliveryArtifactsForPaymentIntent).not.toHaveBeenCalled();
  });

  it("does not expose raw paid access tokens in the NotifyURL result", async () => {
    const result = await processNewebPayNotify(notifyPayload(), env);
    const serialized = JSON.stringify(result);

    expect(serialized).toContain("entitlement");
    expect(serialized).toContain("generationJob");
    expect(serialized).not.toContain("pa_test-token");
    expect(serialized).not.toContain("/unlock/");
  });

  it("returns a safe no-op queue trigger result when enabled for Phase 4A", async () => {
    const result = await processNewebPayNotify(notifyPayload(), {
      ...env,
      ENABLE_PAID_JOB_QUEUE_TRIGGER: "true",
      PAID_JOB_QUEUE_PROVIDER: "noop",
    } as NodeJS.ProcessEnv);

    expect(result).toMatchObject({
      ok: true,
      category: "payment_marked_paid",
      queueTrigger: {
        ok: true,
        category: "noop",
        provider: "noop",
        payload: {
          paymentIntentId: "payment-1",
          generationJobId: "job-1",
          moduleSlug: "ambiguous-temperature",
          triggerSource: "newebpay_notify",
        },
      },
    });
  });
});
