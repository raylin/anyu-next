import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockIsDbConfigured, mockResolvePaymentAccessHandoff, mockGetPaymentRecoveryStatusSummary } = vi.hoisted(() => ({
  mockIsDbConfigured: vi.fn(),
  mockResolvePaymentAccessHandoff: vi.fn(),
  mockGetPaymentRecoveryStatusSummary: vi.fn(),
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

import NewebPayReturnPage from "@/app/m/[moduleSlug]/payment/return/page";

describe("NewebPay ReturnURL pending page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDbConfigured.mockReturnValue(true);
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
    expect(html).not.toContain("paidAccessToken");
    expect(html).not.toContain("TradeInfo");
    expect(html).not.toContain("TradeSha");
    expect(mockResolvePaymentAccessHandoff).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      checkoutToken: "pcs_redacted",
    });
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
    expect(html).toContain("建議先保存這份報告");
    expect(html).toContain("查看完整報告");
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
  });
});
