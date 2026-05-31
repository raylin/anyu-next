import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCanStartNewebPayCheckoutFromResult,
  mockIsDbConfigured,
  mockCreateNewebPayCheckout,
} = vi.hoisted(() => ({
  mockCanStartNewebPayCheckoutFromResult: vi.fn(),
  mockIsDbConfigured: vi.fn(),
  mockCreateNewebPayCheckout: vi.fn(),
}));

vi.mock("@/lib/runtime/feature-flags", () => ({
  canStartNewebPayCheckoutFromResult: mockCanStartNewebPayCheckoutFromResult,
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/payments/newebpay/checkout-service", () => ({
  createNewebPayCheckout: mockCreateNewebPayCheckout,
}));

import CheckoutStartPage from "@/app/m/[moduleSlug]/result/[resultId]/checkout/page";

const params = {
  params: Promise.resolve({
    moduleSlug: "ambiguous-temperature",
    resultId: "result-1",
  }),
};

describe("NewebPay checkout-start page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPERATOR_TEST_SECRET = "operator-secret";
    mockCanStartNewebPayCheckoutFromResult.mockReturnValue(true);
    mockIsDbConfigured.mockReturnValue(true);
    mockCreateNewebPayCheckout.mockResolvedValue({
      ok: true,
      paymentIntent: { id: "payment-1", status: "checkout_started" },
      paymentIntentCreated: true,
      checkoutContract: {
        actionUrl: "https://ccore.newebpay.com/MPG/mpg_gateway",
        method: "POST",
        merchantOrderNo: "ANYUNPORDEREXISTING000000000",
        returnUrl:
          "https://staging.anyu.tw/m/ambiguous-temperature/payment/return?merchantOrderNo=ANYUNPORDEREXISTING000000000&checkoutToken=redacted",
        fields: {
          MerchantID: "MS123456789",
          TradeInfo: "encrypted-trade-info",
          TradeSha: "TRADE-SHA",
          Version: "2.0",
        },
      },
    });
  });

  it("does not create checkout when production-disabled gates are closed", async () => {
    mockCanStartNewebPayCheckoutFromResult.mockReturnValue(false);

    const page = await CheckoutStartPage(params);
    const html = renderToStaticMarkup(page);

    expect(html).toContain("完整報告即將開放");
    expect(html).toContain("完整報告解鎖功能準備中");
    expect(html).toContain("MODULE 01");
    expect(html).toContain("付款流程");
    expect(mockCreateNewebPayCheckout).not.toHaveBeenCalled();
    expect(html).not.toContain("TradeInfo");
    expect(html).not.toContain("TradeSha");
  });

  it("creates checkout server-side and renders an explicit NewebPay submit form", async () => {
    const page = await CheckoutStartPage(params);
    const html = renderToStaticMarkup(page);

    expect(html).toContain("前往藍新安全付款頁");
    expect(html).toContain('method="POST"');
    expect(html).toContain('action="https://ccore.newebpay.com/MPG/mpg_gateway"');
    expect(html).toContain('name="MerchantID"');
    expect(html).toContain('name="TradeInfo"');
    expect(html).toContain('name="TradeSha"');
    expect(html).toContain('name="Version"');
    expect(html).toContain("MODULE 01");
    expect(html).toContain("曖昧溫度計");
    expect(html).toContain("完整報告 · 下一句怎麼回");
    expect(html).toContain("付款流程");
    expect(html).toContain("付款");
    expect(html).toContain("生成");
    expect(html).toContain("完成");
    expect(html).toContain("order summary");
    expect(html).toContain("NT$49");
    expect(html).toContain("一次性付款");
    expect(html).toContain("非訂閱制");
    expect(html).toContain("你將前往藍新金流完成安全付款");
    expect(html).toContain("付款完成後，我們會等候藍新的正式通知");
    expect(html).toContain("完整報告將於網頁中提供查看");
    expect(html).toContain("hello@anyu.tw");
    expect(html).not.toContain("internal test");
    expect(html).not.toContain("internal-test");
    expect(html).not.toContain("內測");
    expect(html).not.toContain("不收費");
    expect(html).not.toContain("no charge");
    expect(html).not.toContain("LINE");
    expect(html).not.toContain("operator-secret");
    expect(html).not.toContain("OPERATOR_TEST_SECRET");
    expect(html).not.toContain("HashKey");
    expect(html).not.toContain("HashIV");
    expect(html).not.toContain("HASH_KEY");
    expect(html).not.toContain("HASH_IV");
    expect(html).not.toContain("paidAccessToken");
    expect(html).not.toContain("generationJob");
    expect(mockCreateNewebPayCheckout).toHaveBeenCalledWith({
      moduleConfig: expect.objectContaining({
        slug: "ambiguous-temperature",
      }),
      resultId: "result-1",
    });
  });

  it("renders safe errors for invalid or expired source result", async () => {
    mockCreateNewebPayCheckout.mockResolvedValue({
      ok: false,
      status: 404,
      error: "source_result_not_found",
    });

    const page = await CheckoutStartPage(params);
    const html = renderToStaticMarkup(page);

    expect(html).toContain("找不到這份分析結果");
    expect(html).toContain("回到曖昧溫度計");
    expect(html).not.toContain("TradeInfo");
    expect(html).not.toContain("TradeSha");
  });
});
