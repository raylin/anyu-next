import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockIsDbConfigured, mockResolvePaymentAccessHandoff } = vi.hoisted(() => ({
  mockIsDbConfigured: vi.fn(),
  mockResolvePaymentAccessHandoff: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
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
  });

  it("renders pending-only UX for valid checkout session before NotifyURL", async () => {
    const page = await NewebPayReturnPage({
      params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      searchParams: Promise.resolve({ checkoutToken: "pcs_redacted" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("付款確認中");
    expect(html).toContain("目前狀態：waiting_for_payment");
    expect(html).toContain("不會直接判定付款成功或解鎖完整分析");
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
    });

    const page = await NewebPayReturnPage({
      params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      searchParams: Promise.resolve({ checkoutToken: "pcs_redacted" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("付款已確認");
    expect(html).toContain("目前狀態：paid_ready");
    expect(html).toContain("查看完整分析");
    expect(html).not.toContain("paidAccessToken");
    expect(html).not.toContain("generationJob");
    expect(html).not.toContain("pa_");
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

    expect(html).toContain("付款確認中");
    expect(html).toContain("保留付款時間與訂單資訊聯繫客服協助確認");
  });
});
