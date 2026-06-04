import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockIsDbConfigured,
  mockIsNewebPayCheckoutEnabled,
  mockIsPaymentRuntimeEnabled,
  mockCreateNewebPayCheckout,
} = vi.hoisted(() => ({
  mockIsDbConfigured: vi.fn(),
  mockIsNewebPayCheckoutEnabled: vi.fn(),
  mockIsPaymentRuntimeEnabled: vi.fn(),
  mockCreateNewebPayCheckout: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/runtime/feature-flags", () => ({
  isNewebPayCheckoutEnabled: mockIsNewebPayCheckoutEnabled,
  isPaymentRuntimeEnabled: mockIsPaymentRuntimeEnabled,
}));

vi.mock("@/lib/payments/newebpay/checkout-service", () => ({
  createNewebPayCheckout: mockCreateNewebPayCheckout,
}));

import { POST } from "@/app/api/modules/[moduleSlug]/checkout/newebpay/route";

function request(input: { secret?: string; body?: Record<string, unknown> } = {}) {
  return new Request("http://localhost/api/modules/ambiguous-temperature/checkout/newebpay", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(input.secret ? { "x-operator-test-secret": input.secret } : {}),
    },
    body: JSON.stringify(input.body ?? { resultId: "result-1" }),
  });
}

const params = { params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }) };

describe("NewebPay checkout route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPERATOR_TEST_SECRET = "operator-secret";
    mockIsDbConfigured.mockReturnValue(true);
    mockIsNewebPayCheckoutEnabled.mockReturnValue(true);
    mockIsPaymentRuntimeEnabled.mockReturnValue(false);
    mockCreateNewebPayCheckout.mockResolvedValue({
      ok: true,
      paymentIntent: { id: "payment-1", status: "checkout_started" },
      paymentIntentCreated: true,
      checkoutContract: {
        actionUrl: "https://ccore.newebpay.com/MPG/mpg_gateway",
        method: "POST",
        merchantOrderNo: "ANYUNPORDEREXISTING000000000",
        returnUrl:
          "https://staging.anyu.tw/payment/newebpay/return?merchantOrderNo=ANYUNPORDEREXISTING000000000&checkoutToken=pcs_redacted",
        fields: {
          MerchantID: "MS123456789",
          TradeInfo: "encrypted-trade-info",
          TradeSha: "TRADE-SHA",
          Version: "2.0",
        },
      },
    });
  });

  it("is disabled when checkout flag is off", async () => {
    mockIsNewebPayCheckoutEnabled.mockReturnValue(false);

    const response = await POST(request({ secret: "operator-secret" }), params);

    expect(response.status).toBe(404);
    expect(mockCreateNewebPayCheckout).not.toHaveBeenCalled();
  });

  it("requires operator secret while payment runtime is off", async () => {
    await expect(POST(request(), params)).resolves.toMatchObject({ status: 401 });
    await expect(POST(request({ secret: "wrong-secret" }), params)).resolves.toMatchObject({
      status: 401,
    });
    expect(mockCreateNewebPayCheckout).not.toHaveBeenCalled();
  });

  it("creates a pending checkout contract without paid delivery state", async () => {
    const response = await POST(request({ secret: "operator-secret" }), params);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ok: true,
      mode: "newebpay_checkout_phase_1",
      moduleSlug: "ambiguous-temperature",
      resultId: "result-1",
      paymentIntentId: "payment-1",
      paymentIntentStatus: "checkout_started",
      paymentIntentCreated: true,
      merchantOrderNo: "ANYUNPORDEREXISTING000000000",
      checkout: {
        actionUrl: "https://ccore.newebpay.com/MPG/mpg_gateway",
        method: "POST",
        merchantOrderNo: "ANYUNPORDEREXISTING000000000",
        returnUrl:
          "https://staging.anyu.tw/payment/newebpay/return?merchantOrderNo=ANYUNPORDEREXISTING000000000&checkoutToken=pcs_redacted",
        fields: {
          MerchantID: "MS123456789",
          TradeInfo: "encrypted-trade-info",
          TradeSha: "TRADE-SHA",
          Version: "2.0",
        },
      },
      pendingReturnPath:
        "/payment/newebpay/return?merchantOrderNo=ANYUNPORDEREXISTING000000000&checkoutToken=pcs_redacted",
    });
    expect(JSON.stringify(data)).not.toContain("operator-secret");
    expect(JSON.stringify(data)).not.toContain("NEWEBPAY_HASH");
    expect(JSON.stringify(data)).not.toContain("paidAccessToken");
    expect(JSON.stringify(data)).not.toContain("generationJob");
  });

  it("returns safe provider config errors", async () => {
    mockCreateNewebPayCheckout.mockResolvedValue({
      ok: false,
      status: 503,
      error: "missing_newebpay_config",
      missingConfig: ["NEWEBPAY_MERCHANT_ID"],
    });

    const response = await POST(request({ secret: "operator-secret" }), params);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toMatchObject({
      ok: false,
      error: "missing_newebpay_config",
      missingConfig: ["NEWEBPAY_MERCHANT_ID"],
    });
  });
});
