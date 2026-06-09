import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockIsDbConfigured,
  mockResolvePaymentAccessHandoff,
  mockGetPaymentRecoveryStatusSummary,
  mockResolvePaymentCheckoutSessionToken,
} = vi.hoisted(() => ({
  mockIsDbConfigured: vi.fn(),
  mockResolvePaymentAccessHandoff: vi.fn(),
  mockGetPaymentRecoveryStatusSummary: vi.fn(),
  mockResolvePaymentCheckoutSessionToken: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/db/payment-recovery-contacts", () => ({
  getPaymentRecoveryStatusSummary: mockGetPaymentRecoveryStatusSummary,
}));

vi.mock("@/lib/payments/payment-access-handoff", () => ({
  resolvePaymentAccessHandoff: mockResolvePaymentAccessHandoff,
}));

vi.mock("@/lib/payments/payment-checkout-session", () => ({
  resolvePaymentCheckoutSessionToken: mockResolvePaymentCheckoutSessionToken,
}));

import NewebPayReturnPage from "@/app/m/[moduleSlug]/payment/return/page";
import UnifiedNewebPayReturnPage from "@/app/payment/newebpay/return/page";

describe("NewebPay ReturnURL pending page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDbConfigured.mockReturnValue(true);
    mockResolvePaymentCheckoutSessionToken.mockReturnValue({
      ok: true,
      payload: {
        moduleSlug: "ambiguous-temperature",
        merchantOrderNo: "ANYUNPORDEREXISTING000000000",
        exp: 1_800_000_000,
        nonce: "nonce",
      },
    });
    mockResolvePaymentAccessHandoff.mockResolvedValue({
      ok: true,
      state: "waiting_for_payment",
      moduleSlug: "ambiguous-temperature",
      accessPath: null,
      retryable: true,
    });
    mockGetPaymentRecoveryStatusSummary.mockResolvedValue({
      hasRecoveryContact: false,
      recommendedPostPaymentAction: "suggest_email_save",
    });
  });

  it("renders pending-only UX for valid checkout session before NotifyURL", async () => {
    const page = await NewebPayReturnPage({
      params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      searchParams: Promise.resolve({ checkoutToken: "pcs_redacted" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("付款確認中");
    expect(html).toContain("我們正在等候藍新的正式付款通知");
    expect(html).toContain("瀏覽器回到此頁不代表付款已完成");
    expect(html).toContain("等候藍新正式付款通知");
    expect(html).toContain("3–7 個工作天內回覆處理結果");
    expect(html).toContain('data-shell="module"');
    expect(html).toContain('data-theme="ai-temperature-riso"');
    expect(html).toContain('data-module-theme="riso"');
    expect(html).toContain('data-paid-state-surface="return"');
    expect(html).toContain('data-return-state="waiting_for_payment"');
    expect(html).not.toContain("paidAccessToken");
    expect(html).not.toContain("TradeInfo");
    expect(html).not.toContain("TradeSha");
    expect(html).not.toContain('data-core-shell="true"');
    expect(mockResolvePaymentAccessHandoff).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      checkoutToken: "pcs_redacted",
    });
  });

  it("renders the unified provider-level ReturnURL from signed checkout session context", async () => {
    const page = await UnifiedNewebPayReturnPage({
      searchParams: Promise.resolve({
        merchantOrderNo: "ANYUNPORDEREXISTING000000000",
        checkoutToken: "pcs_redacted",
      }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("付款確認中");
    expect(html).toContain("瀏覽器回到此頁不代表付款已完成");
    expect(html).toContain('data-shell="module"');
    expect(html).toContain('data-theme="ai-temperature-riso"');
    expect(html).toContain('data-paid-state-surface="return"');
    expect(html).toContain('data-return-state="waiting_for_payment"');
    expect(html).not.toContain("TradeInfo");
    expect(html).not.toContain("TradeSha");
    expect(html).not.toContain("pal_");
    expect(mockResolvePaymentCheckoutSessionToken).toHaveBeenCalledWith({
      token: "pcs_redacted",
    });
    expect(mockResolvePaymentAccessHandoff).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      checkoutToken: "pcs_redacted",
    });
  });

  it("does not poll when unified ReturnURL receives an expired provider browser return", async () => {
    const page = await UnifiedNewebPayReturnPage({
      searchParams: Promise.resolve({
        merchantOrderNo: "ANYUNPORDEREXISTING000000000",
        checkoutToken: "pcs_redacted",
        Status: "MPG_TIMEOUT",
        Message: "付款連結逾時",
      }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("這個付款狀態連結已失效");
    expect(html).toContain("保留付款時間與訂單資訊聯絡客服協助確認");
    expect(html).toContain('data-paid-state-surface="return"');
    expect(html).toContain('data-return-state="expired_session"');
    expect(html).not.toContain("付款確認中");
    expect(html).not.toContain("等候藍新正式付款通知");
    expect(mockResolvePaymentAccessHandoff).not.toHaveBeenCalled();
  });

  it("keeps successful provider browser returns on the polling path", async () => {
    const page = await UnifiedNewebPayReturnPage({
      searchParams: Promise.resolve({
        merchantOrderNo: "ANYUNPORDEREXISTING000000000",
        checkoutToken: "pcs_redacted",
        Status: "SUCCESS",
        Message: "付款完成",
      }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("付款確認中");
    expect(html).toContain("瀏覽器回到此頁不代表付款已完成");
    expect(html).toContain('data-paid-state-surface="return"');
    expect(html).toContain('data-return-state="waiting_for_payment"');
    expect(mockResolvePaymentAccessHandoff).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      checkoutToken: "pcs_redacted",
    });
  });

  it("does not poll when legacy module ReturnURL receives a failed provider browser return", async () => {
    const page = await NewebPayReturnPage({
      params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      searchParams: Promise.resolve({
        checkoutToken: "pcs_redacted",
        Status: "FAILED",
        Message: "付款取消",
      }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("報告暫時無法完成");
    expect(html).toContain("hello@anyu.tw");
    expect(html).toContain('data-paid-state-surface="return"');
    expect(html).toContain('data-return-state="paid_failed"');
    expect(html).not.toContain("付款確認中");
    expect(mockResolvePaymentAccessHandoff).not.toHaveBeenCalled();
  });

  it("shows safe support state for unified ReturnURL when checkout context is missing", async () => {
    const page = await UnifiedNewebPayReturnPage({
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("這個付款狀態連結已失效");
    expect(html).toContain("hello@anyu.tw");
    expect(html).toContain('data-paid-state-surface="return"');
    expect(html).toContain('data-return-state="invalid_session"');
    expect(mockResolvePaymentAccessHandoff).not.toHaveBeenCalled();
  });

  it("can show ready continuation without exposing raw paid access token", async () => {
    mockResolvePaymentAccessHandoff.mockResolvedValue({
      ok: true,
      moduleSlug: "ambiguous-temperature",
      state: "paid_ready",
      accessPath: "/m/ambiguous-temperature/payment/access?checkoutToken=pcs_redacted",
      retryable: false,
      paymentIntent: { id: "payment-1" },
      entitlement: { id: "entitlement-1" },
      record: { result: { id: "result-1" } },
    });
    mockGetPaymentRecoveryStatusSummary.mockResolvedValue({
      hasRecoveryContact: false,
      hasEmailRecovery: false,
      hasLineRecovery: false,
      emailStatus: "none",
      lineStatus: "none",
      transactionalConsentPresent: false,
      marketingOptInPresent: false,
      recommendedPostPaymentAction: "suggest_email_save",
      safeDisplayContact: null,
    });

    const page = await NewebPayReturnPage({
      params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      searchParams: Promise.resolve({ checkoutToken: "pcs_redacted" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("付款已確認");
    expect(html).toContain("完整報告已準備好");
    expect(html).toContain("建議先保存這份報告的專屬查看連結");
    expect(html).toContain("查看完整報告");
    expect(html).toContain('data-paid-state-surface="return"');
    expect(html).toContain('data-return-state="paid_ready"');
    expect(html).not.toContain("paidAccessToken");
    expect(html).not.toContain("generationJob");
    expect(html).not.toContain("pa_");
  });

  it("renders processing copy while paid generation is running", async () => {
    mockResolvePaymentAccessHandoff.mockResolvedValue({
      ok: true,
      moduleSlug: "ambiguous-temperature",
      state: "paid_processing",
      accessPath: null,
      retryable: true,
    });

    const page = await NewebPayReturnPage({
      params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      searchParams: Promise.resolve({ checkoutToken: "pcs_redacted" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("完整報告生成中");
    expect(html).toContain("正在重新整理你的互動訊號");
    expect(html).toContain('data-paid-state-surface="return"');
    expect(html).toContain('data-return-state="paid_processing"');
    expect(html).toContain('data-generation-status="processing"');
    expect(html).not.toContain("查看完整報告");
  });

  it("renders failed/support copy with refund and support links", async () => {
    mockResolvePaymentAccessHandoff.mockResolvedValue({
      ok: true,
      moduleSlug: "ambiguous-temperature",
      state: "paid_failed",
      accessPath: null,
      retryable: false,
    });

    const page = await NewebPayReturnPage({
      params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      searchParams: Promise.resolve({ checkoutToken: "pcs_redacted" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("報告暫時無法完成");
    expect(html).toContain("hello@anyu.tw");
    expect(html).toContain("3–7 個工作天內回覆處理結果");
    expect(html).toContain("查看退款政策");
    expect(html).toContain('data-paid-state-surface="return"');
    expect(html).toContain('data-return-state="paid_failed"');
  });

  it("handles invalid checkout sessions safely", async () => {
    mockResolvePaymentAccessHandoff.mockResolvedValue({
      ok: false,
      state: "invalid_session",
      errorCategory: "invalid_session",
    });

    const page = await NewebPayReturnPage({
      params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      searchParams: Promise.resolve({ checkoutToken: "pcs_invalid" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("這個付款狀態連結已失效");
    expect(html).toContain("保留付款時間與訂單資訊聯絡客服協助確認");
    expect(html).toContain("查看退款政策");
    expect(html).toContain('data-paid-state-surface="return"');
    expect(html).toContain('data-return-state="invalid_session"');
  });

  it("maps expired checkout sessions to the safe expired support state", async () => {
    mockResolvePaymentAccessHandoff.mockResolvedValue({
      ok: false,
      state: "expired",
      errorCategory: "expired",
    });

    const page = await NewebPayReturnPage({
      params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      searchParams: Promise.resolve({ checkoutToken: "pcs_expired" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("這個付款狀態連結已失效");
    expect(html).toContain("保留付款時間與訂單資訊聯絡客服協助確認");
    expect(html).toContain('data-paid-state-surface="return"');
    expect(html).toContain('data-return-state="expired_session"');
    expect(html).not.toContain("付款確認中");
  });
});
