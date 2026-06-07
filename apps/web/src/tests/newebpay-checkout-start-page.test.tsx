import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCanStartNewebPayCheckoutForModule,
  mockIsDbConfigured,
  mockCreateNewebPayCheckout,
  mockGetPaymentRecoveryContactsByResultId,
  mockGetActiveLineRecoveryRecipientSecretByContactId,
  mockHeaders,
} = vi.hoisted(() => ({
  mockCanStartNewebPayCheckoutForModule: vi.fn(),
  mockIsDbConfigured: vi.fn(),
  mockCreateNewebPayCheckout: vi.fn(),
  mockGetPaymentRecoveryContactsByResultId: vi.fn(),
  mockGetActiveLineRecoveryRecipientSecretByContactId: vi.fn(),
  mockHeaders: vi.fn(),
}));

vi.mock("@/lib/runtime-config/payment", () => ({
  canStartNewebPayCheckoutForModule: mockCanStartNewebPayCheckoutForModule,
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/payments/newebpay/checkout-service", () => ({
  createNewebPayCheckout: mockCreateNewebPayCheckout,
}));

vi.mock("@/lib/db/payment-recovery-contacts", () => ({
  getPaymentRecoveryContactsByResultId: mockGetPaymentRecoveryContactsByResultId,
}));

vi.mock("@/lib/db/payment-recovery-contact-secrets", () => ({
  getActiveLineRecoveryRecipientSecretByContactId:
    mockGetActiveLineRecoveryRecipientSecretByContactId,
}));

vi.mock("next/headers", () => ({
  headers: mockHeaders,
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
    process.env.PAYMENT_RECOVERY_CONTACT_HASH_SECRET = "test-only-recovery-hash-secret";
    delete process.env.NEXT_PUBLIC_LINE_LIFF_URL;
    mockHeaders.mockResolvedValue(new Headers({ "user-agent": "Mozilla/5.0 Macintosh" }));
    mockCanStartNewebPayCheckoutForModule.mockResolvedValue(true);
    mockIsDbConfigured.mockReturnValue(true);
    mockGetPaymentRecoveryContactsByResultId.mockResolvedValue([]);
    mockGetActiveLineRecoveryRecipientSecretByContactId.mockResolvedValue(null);
    mockCreateNewebPayCheckout.mockResolvedValue({
      ok: true,
      paymentIntent: { id: "payment-1", status: "checkout_started" },
      paymentIntentCreated: true,
      checkoutContract: {
        actionUrl: "https://ccore.newebpay.com/MPG/mpg_gateway",
        method: "POST",
        merchantOrderNo: "ANYUNPORDEREXISTING000000000",
        returnUrl:
          "https://staging.anyu.tw/payment/newebpay/return?merchantOrderNo=ANYUNPORDEREXISTING000000000&checkoutToken=redacted",
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
    mockCanStartNewebPayCheckoutForModule.mockResolvedValue(false);

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

  it("requires Email save before rendering provider fields on desktop", async () => {
    const page = await CheckoutStartPage(params);
    const html = renderToStaticMarkup(page);

    expect(html).toContain("先保存查看連結");
    expect(html).toContain('data-riso-flow="checkout-save"');
    expect(html).toContain('data-save-option="email"');
    expect(html).toContain("請先用 Email 保存查看連結");
    expect(html).toContain("先保存查看連結");
    expect(html).toContain("Email 查看連結");
    expect(html).toContain("用 Email 保存查看連結");
    expect(html).not.toContain("LINE 查看連結");
    expect(html).not.toContain("用 LINE 保存查看連結");
    expect(html).not.toContain("/line/recovery/bind?rlb=rlb_");
    expect(html).toContain("完整報告的專屬查看連結");
    expect(html).toContain("回到 ANYU 查看完整報告的連結");
    expect(html).toContain("不會包含完整報告內容");
    expect(html).toContain("也想收到新測驗、早鳥或限時解鎖通知");
    expect(html).toContain("付款前請先保存查看連結");
    expect(html).toContain("請先完成 Email 查看連結保存，付款按鈕就會開啟");
    expect(html).toContain("繼續付款");
    expect(html).not.toContain("我了解尚未保存查看連結，仍要繼續付款");
    expect(html).not.toContain('action="https://ccore.newebpay.com/MPG/mpg_gateway"');
    expect(html).toContain(
      'action="/api/modules/ambiguous-temperature/result/result-1/recovery/email"',
    );
    expect(html).not.toContain('name="MerchantID"');
    expect(html).not.toContain('name="TradeInfo"');
    expect(html).not.toContain('name="TradeSha"');
    expect(html).not.toContain('name="Version"');
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
    expect(html).not.toContain("LINE 交付完整報告");
    expect(html).not.toContain("LINE 領取完整分析");
    expect(html).not.toContain("完整報告會傳到 LINE");
    expect(html).not.toContain("LINE paid report delivery");
    expect(html).not.toContain("operator-secret");
    expect(html).not.toContain("OPERATOR_TEST_SECRET");
    expect(html).not.toContain("HashKey");
    expect(html).not.toContain("HashIV");
    expect(html).not.toContain("HASH_KEY");
    expect(html).not.toContain("HASH_IV");
    expect(html).not.toContain("paidAccessToken");
    expect(html).not.toContain("generationJob");
    expect(html).not.toContain("owner@example.com");
    expect(html).not.toContain("pa_secret");
    expect(html).not.toContain("pcs_secret");
    expect(html).not.toContain("/unlock/");
    expect(html).not.toContain("short-code");
    expect(mockCreateNewebPayCheckout).toHaveBeenCalledWith({
      moduleConfig: expect.objectContaining({
        slug: "ambiguous-temperature",
      }),
      resultId: "result-1",
    });
  });

  it("renders LINE first above Email on mobile before payment is unlocked", async () => {
    mockHeaders.mockResolvedValue(new Headers({ "user-agent": "Mozilla/5.0 iPhone Mobile" }));

    const page = await CheckoutStartPage(params);
    const html = renderToStaticMarkup(page);

    expect(html).toContain("建議用 LINE 保存查看連結");
    expect(html).toContain('data-riso-flow="checkout-save"');
    expect(html).toContain('data-save-option="line"');
    expect(html).toContain('data-save-option="email"');
    expect(html).toContain("anyu-riso-save-cta");
    expect(html).toContain("用 LINE 保存查看連結");
    expect(html).toContain("改用 Email 保存查看連結");
    expect(html).toContain("/line/recovery/bind?rlb=rlb_");
    expect(html.indexOf("建議用 LINE 保存查看連結")).toBeLessThan(
      html.indexOf("Email 備用查看連結"),
    );
    expect(html).toContain("請先完成 LINE 或 Email 查看連結保存，付款按鈕就會開啟");
    expect(html).not.toContain('action="https://ccore.newebpay.com/MPG/mpg_gateway"');
    expect(html).not.toContain('name="TradeInfo"');
    expect(html).not.toContain("完整報告會傳到 LINE");
    expect(html).not.toContain("LINE 交付完整報告");
  });

  it("shows saved state when an existing recovery contact is present", async () => {
    mockGetPaymentRecoveryContactsByResultId.mockResolvedValue([
      {
        id: "contact-1",
        contactType: "email",
        status: "verified",
        transactionalConsentAt: new Date("2026-06-06T00:00:00.000Z"),
      },
    ]);

    const page = await CheckoutStartPage(params);
    const html = renderToStaticMarkup(page);

    expect(html).toContain("已保存到 Email");
    expect(html).toContain("已保存查看連結");
    expect(html).toContain("anyu-riso-status-badge");
    expect(html).toContain("anyu-riso-status-box-success");
    expect(html).toContain('action="https://ccore.newebpay.com/MPG/mpg_gateway"');
    expect(html).toContain('name="MerchantID"');
    expect(html).toContain('name="TradeInfo"');
    expect(html).toContain('name="TradeSha"');
    expect(html).toContain('name="Version"');
    expect(html).toContain("繼續付款");
    expect(html).not.toContain("我了解尚未保存查看連結，仍要繼續付款");
    expect(html).not.toContain("owner@example.com");
  });

  it("does not unlock mobile payment for LINE contact-only state", async () => {
    mockHeaders.mockResolvedValue(new Headers({ "user-agent": "Mozilla/5.0 iPhone Mobile" }));
    mockGetPaymentRecoveryContactsByResultId.mockResolvedValue([
      {
        id: "line-contact-1",
        contactType: "line",
        status: "bound",
        transactionalConsentAt: new Date("2026-06-06T00:00:00.000Z"),
      },
    ]);
    mockGetActiveLineRecoveryRecipientSecretByContactId.mockResolvedValue(null);

    const page = await CheckoutStartPage({
      ...params,
      searchParams: Promise.resolve({ lineRecovery: "line_saved" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("LINE 保存沒有完成");
    expect(html).toContain('data-save-option="line"');
    expect(html).toContain("anyu-riso-save-option-line");
    expect(html).toContain("重試 LINE");
    expect(html).toContain("改用 Email 保存查看連結");
    expect(html).toContain("請先完成 LINE 或 Email 查看連結保存，付款按鈕就會開啟");
    expect(html).not.toContain("已保存到 LINE");
    expect(html).not.toContain('action="https://ccore.newebpay.com/MPG/mpg_gateway"');
    expect(html).not.toContain('name="TradeInfo"');
  });

  it("unlocks mobile payment for LINE contact with active recipient secret", async () => {
    mockHeaders.mockResolvedValue(new Headers({ "user-agent": "Mozilla/5.0 iPhone Mobile" }));
    mockGetPaymentRecoveryContactsByResultId.mockResolvedValue([
      {
        id: "line-contact-1",
        contactType: "line",
        status: "bound",
        transactionalConsentAt: new Date("2026-06-06T00:00:00.000Z"),
      },
    ]);
    mockGetActiveLineRecoveryRecipientSecretByContactId.mockResolvedValue({
      recoveryContactId: "line-contact-1",
      channel: "line",
      purpose: "access_link_delivery",
      status: "active",
      encryptedRecipient: "encrypted",
      recipientHash: "hash",
    });

    const page = await CheckoutStartPage(params);
    const html = renderToStaticMarkup(page);

    expect(html).toContain("已保存到 LINE");
    expect(html).toContain("已保存查看連結");
    expect(html).toContain('action="https://ccore.newebpay.com/MPG/mpg_gateway"');
    expect(html).toContain('name="TradeInfo"');
    expect(html).not.toContain("LINE 保存沒有完成");
  });

  it("shows a safe email save error and keeps payment locked", async () => {
    const page = await CheckoutStartPage({
      ...params,
      searchParams: Promise.resolve({ recovery: "email_error" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("Email 保存暫時失敗");
    expect(html).toContain("請先完成 Email 查看連結保存，付款按鈕就會開啟");
    expect(html).not.toContain('action="https://ccore.newebpay.com/MPG/mpg_gateway"');
    expect(html).not.toContain("owner@example.com");
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
