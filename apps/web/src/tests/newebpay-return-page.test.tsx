import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockIsDbConfigured, mockGetPaymentIntentByMerchantOrderNo } = vi.hoisted(() => ({
  mockIsDbConfigured: vi.fn(),
  mockGetPaymentIntentByMerchantOrderNo: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/db/payment-intents", () => ({
  getPaymentIntentByMerchantOrderNo: mockGetPaymentIntentByMerchantOrderNo,
}));

import NewebPayReturnPage from "@/app/m/[moduleSlug]/payment/return/page";

describe("NewebPay ReturnURL pending page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDbConfigured.mockReturnValue(true);
    mockGetPaymentIntentByMerchantOrderNo.mockResolvedValue({
      moduleSlug: "ambiguous-temperature",
      status: "checkout_started",
    });
  });

  it("renders pending-only UX for known payment intents", async () => {
    const page = await NewebPayReturnPage({
      params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      searchParams: Promise.resolve({ merchantOrderNo: "ANYUNP-1" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("正在確認付款狀態");
    expect(html).toContain("目前狀態：checkout_started");
    expect(html).toContain("不會直接解鎖完整分析");
    expect(html).not.toContain("paidAccessToken");
    expect(html).not.toContain("TradeInfo");
    expect(html).not.toContain("TradeSha");
  });

  it("handles unknown payment intents safely", async () => {
    mockGetPaymentIntentByMerchantOrderNo.mockResolvedValue(null);

    const page = await NewebPayReturnPage({
      params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      searchParams: Promise.resolve({ merchantOrderNo: "ANYUNP-unknown" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("正在確認付款狀態");
    expect(html).toContain("保留付款資訊聯繫客服協助確認");
  });
});
