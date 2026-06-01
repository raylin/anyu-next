import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockIsDbConfigured,
  mockResolvePaidResultRecoveryLink,
  mockResolvePaidEntitlementAccess,
  mockGetPaymentRecoveryStatusSummary,
  mockGetModuleBySlug,
} = vi.hoisted(() => ({
  mockIsDbConfigured: vi.fn(),
  mockResolvePaidResultRecoveryLink: vi.fn(),
  mockResolvePaidEntitlementAccess: vi.fn(),
  mockGetPaymentRecoveryStatusSummary: vi.fn(),
  mockGetModuleBySlug: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  isDbConfigured: mockIsDbConfigured,
}));

vi.mock("@/lib/db/paid-result-recovery-links", () => ({
  resolvePaidResultRecoveryLink: mockResolvePaidResultRecoveryLink,
}));

vi.mock("@/lib/payments/paid-access-resolver", () => ({
  resolvePaidEntitlementAccess: mockResolvePaidEntitlementAccess,
}));

vi.mock("@/lib/db/payment-recovery-contacts", () => ({
  getPaymentRecoveryStatusSummary: mockGetPaymentRecoveryStatusSummary,
}));

vi.mock("@/lib/modules/registry", () => ({
  getModuleBySlug: mockGetModuleBySlug,
}));

vi.mock("@/app/m/[moduleSlug]/unlock/[unlockToken]/page", () => ({
  UnlockCompleted: (props: {
    recoverySummary?: { hasRecoveryContact: boolean };
    recoveryState?: string | null;
    themeCarryoverSource?: string | null;
  }) => (
    <div>
      MOCK_RECOVERY_UNLOCK_COMPLETED
      {props.recoverySummary ? ` recovery:${props.recoverySummary.hasRecoveryContact}` : null}
      {props.recoveryState ? ` state:${props.recoveryState}` : null}
      {props.themeCarryoverSource ? ` source:${props.themeCarryoverSource}` : null}
    </div>
  ),
}));

import PaidResultRecoveryLinkPage from "@/app/r/[recoveryToken]/page";

const moduleConfig = {
  moduleId: "ai-temperature",
  slug: "ambiguous-temperature",
};
const rawRecoveryToken = `prl_${"a".repeat(43)}`;
const entitlement = {
  id: "entitlement-1",
  moduleSlug: "ambiguous-temperature",
  analysisResultId: "result-1",
  paymentIntentId: "payment-1",
};

describe("paid result recovery link page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDbConfigured.mockReturnValue(true);
    mockGetModuleBySlug.mockReturnValue(moduleConfig);
    mockGetPaymentRecoveryStatusSummary.mockResolvedValue({
      hasRecoveryContact: true,
    });
  });

  it("renders the paid result through recovery link resolution without exposing raw tokens", async () => {
    mockResolvePaidResultRecoveryLink.mockResolvedValue({
      ok: true,
      link: {
        id: "link-1",
        moduleSlug: "ambiguous-temperature",
      },
      entitlement,
    });
    mockResolvePaidEntitlementAccess.mockResolvedValue({
      ok: true,
      accessKind: "paid_result_recovery_link",
      state: "ready",
      moduleSlug: "ambiguous-temperature",
      entitlement,
      record: {
        request: { anonymousSessionId: "session-1" },
        result: {
          normalizedResultJson: {},
          scoreBucket: "warm",
          createdAt: new Date("2026-06-01T00:00:00.000Z"),
        },
      },
      storedPaidResult: {
        status: "completed",
        paidResultJson: { fullSummary: "synthetic" },
      },
      generationJob: null,
    });

    const page = await PaidResultRecoveryLinkPage({
      params: Promise.resolve({ recoveryToken: rawRecoveryToken }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("MOCK_RECOVERY_UNLOCK_COMPLETED");
    expect(html).toContain("recovery:true");
    expect(html).toContain("source:recovery_link");
    expect(mockResolvePaidResultRecoveryLink).toHaveBeenCalledWith({
      rawToken: rawRecoveryToken,
    });
    expect(mockResolvePaidEntitlementAccess).toHaveBeenCalledWith({
      moduleSlug: "ambiguous-temperature",
      entitlement,
      accessKind: "paid_result_recovery_link",
    });
    expect(html).not.toContain(rawRecoveryToken);
    expect(html).not.toContain("pa_");
    expect(html).not.toContain("pcs_");
  });

  it("fails invalid or expired links with support copy and without token echo", async () => {
    mockResolvePaidResultRecoveryLink.mockResolvedValue({
      ok: false,
      category: "expired",
    });

    const page = await PaidResultRecoveryLinkPage({
      params: Promise.resolve({ recoveryToken: rawRecoveryToken }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("這個找回連結暫時不能使用");
    expect(html).toContain("這個找回連結已超過可使用期限");
    expect(html).toContain("hello@anyu.tw");
    expect(html).toContain("3–7 個工作天內回覆處理結果");
    expect(html).not.toContain(rawRecoveryToken);
    expect(html).not.toContain("MOCK_RECOVERY_UNLOCK_COMPLETED");
  });

  it("shows a non-mutating processing state when paid result is not ready", async () => {
    mockResolvePaidResultRecoveryLink.mockResolvedValue({
      ok: true,
      link: {
        id: "link-1",
        moduleSlug: "ambiguous-temperature",
      },
      entitlement,
    });
    mockResolvePaidEntitlementAccess.mockResolvedValue({
      ok: true,
      accessKind: "paid_result_recovery_link",
      state: "processing",
      moduleSlug: "ambiguous-temperature",
      entitlement,
    });

    const page = await PaidResultRecoveryLinkPage({
      params: Promise.resolve({ recoveryToken: rawRecoveryToken }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("完整報告確認中");
    expect(html).toContain("瀏覽器開啟找回連結不代表付款狀態會被更改");
    expect(html).not.toContain(rawRecoveryToken);
    expect(html).not.toContain("MOCK_RECOVERY_UNLOCK_COMPLETED");
  });
});
