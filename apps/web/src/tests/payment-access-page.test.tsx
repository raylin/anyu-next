import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockIsDbConfigured, mockGetModuleBySlug, mockResolvePaymentAccessHandoff } = vi.hoisted(
  () => ({
    mockIsDbConfigured: vi.fn(),
    mockGetModuleBySlug: vi.fn(),
    mockResolvePaymentAccessHandoff: vi.fn(),
  }),
);

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/modules/registry", () => ({
  getModuleBySlug: mockGetModuleBySlug,
}));

vi.mock("@/lib/payments/payment-access-handoff", () => ({
  resolvePaymentAccessHandoff: mockResolvePaymentAccessHandoff,
}));

vi.mock("@/app/m/[moduleSlug]/unlock/[unlockToken]/page", () => ({
  UnlockCompleted: () => <div>MOCK_UNLOCK_COMPLETED</div>,
}));

import PaymentAccessPage from "@/app/m/[moduleSlug]/payment/access/page";

const moduleConfig = {
  moduleId: "ai-temperature",
  slug: "ambiguous-temperature",
};

describe("payment access page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDbConfigured.mockReturnValue(true);
    mockGetModuleBySlug.mockReturnValue(moduleConfig);
    mockResolvePaymentAccessHandoff.mockResolvedValue({
      ok: false,
      state: "invalid_session",
      errorCategory: "invalid_session",
    });
  });

  it("does not render paid result for invalid checkout sessions", async () => {
    const page = await PaymentAccessPage({
      params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      searchParams: Promise.resolve({ checkoutToken: "bad" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("完整分析尚未可用");
    expect(html).toContain("hello@anyu.tw");
    expect(html).toContain("3–7 個工作天內回覆處理結果");
    expect(html).not.toContain("MOCK_UNLOCK_COMPLETED");
  });

  it("renders paid result only after session-bound handoff is ready", async () => {
    mockResolvePaymentAccessHandoff.mockResolvedValue({
      ok: true,
      state: "paid_ready",
      record: {
        request: { anonymousSessionId: "session-1" },
        result: {
          normalizedResultJson: {},
          scoreBucket: "warm",
          createdAt: new Date("2026-05-30T00:00:00.000Z"),
        },
      },
      storedPaidResult: {
        status: "completed",
        paidResultJson: { fullSummary: "synthetic" },
      },
    });

    const page = await PaymentAccessPage({
      params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      searchParams: Promise.resolve({ checkoutToken: "pcs_redacted" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("MOCK_UNLOCK_COMPLETED");
    expect(mockResolvePaymentAccessHandoff).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      checkoutToken: "pcs_redacted",
    });
  });
});
