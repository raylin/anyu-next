import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockIsDbConfigured,
  mockGetModuleBySlug,
  mockResolvePaymentAccessHandoff,
  mockGetPaymentRecoveryStatusSummary,
} = vi.hoisted(
  () => ({
    mockIsDbConfigured: vi.fn(),
    mockGetModuleBySlug: vi.fn(),
    mockResolvePaymentAccessHandoff: vi.fn(),
    mockGetPaymentRecoveryStatusSummary: vi.fn(),
  }),
);

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/modules/registry", () => ({
  getModuleBySlug: mockGetModuleBySlug,
}));

vi.mock("@/lib/db/payment-recovery-contacts", () => ({
  getPaymentRecoveryStatusSummary: mockGetPaymentRecoveryStatusSummary,
  createOrUpdatePostPaymentEmailRecoveryContact: vi.fn(),
}));

vi.mock("@/lib/payments/payment-access-handoff", () => ({
  resolvePaymentAccessHandoff: mockResolvePaymentAccessHandoff,
}));

vi.mock("@/app/m/[moduleSlug]/unlock/[unlockToken]/page", () => ({
  UnlockCompleted: (props: {
    recoverySummary?: { hasRecoveryContact: boolean };
    recoveryState?: string | null;
  }) => (
    <div>
      MOCK_UNLOCK_COMPLETED
      {props.recoverySummary ? ` recovery:${props.recoverySummary.hasRecoveryContact}` : null}
      {props.recoveryState ? ` state:${props.recoveryState}` : null}
    </div>
  ),
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
    mockGetPaymentRecoveryStatusSummary.mockResolvedValue({
      hasRecoveryContact: false,
      recommendedPostPaymentAction: "suggest_email_save",
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
      paymentIntent: { id: "payment-1" },
      entitlement: { id: "entitlement-1" },
      record: {
        request: { anonymousSessionId: "session-1" },
        result: {
          id: "result-1",
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
    expect(html).toContain("recovery:false");
    expect(mockResolvePaymentAccessHandoff).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      checkoutToken: "pcs_redacted",
    });
    expect(mockGetPaymentRecoveryStatusSummary).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: "result-1",
      paymentIntentId: "payment-1",
      entitlementId: "entitlement-1",
    });
  });
});
