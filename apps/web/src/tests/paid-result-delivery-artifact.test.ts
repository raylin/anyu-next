import { describe, expect, it } from "vitest";
import {
  createPaidResultReportReference,
  getPaidResultDeliverySummary,
} from "@/lib/payments/paid-result-delivery-artifact";

describe("paid result delivery artifact", () => {
  it("creates a stable display-only report reference", () => {
    const reference = createPaidResultReportReference({
      moduleSlug: "ambiguous-temperature",
      analysisResultId: "result_private_123",
      generatedAt: new Date("2026-06-01T08:30:00.000Z"),
    });

    expect(reference).toMatch(/^AT-20260601-[A-F0-9]{6}$/);
    expect(
      createPaidResultReportReference({
        moduleSlug: "ambiguous-temperature",
        analysisResultId: "result_private_123",
        generatedAt: new Date("2026-06-01T08:30:00.000Z"),
      }),
    ).toBe(reference);
    expect(reference).not.toContain("result_private_123");
  });

  it("summarizes saved recovery state with masked contact only", () => {
    const summary = getPaidResultDeliverySummary({
      moduleSlug: "ambiguous-temperature",
      moduleLabel: "曖昧溫度計",
      analysisResultId: "result_private_456",
      generatedAt: "2026-06-01T08:30:00.000Z",
      recoveryState: "email_sent",
      recoverySummary: {
        hasRecoveryContact: true,
        hasEmailRecovery: true,
        hasLineRecovery: false,
        emailStatus: "bound",
        lineStatus: "none",
        transactionalConsentPresent: true,
        marketingOptInPresent: false,
        recommendedPostPaymentAction: "confirm_saved",
        safeDisplayContact: { type: "email", maskedValue: "o***@e***.com" },
      },
    });

    expect(summary).toMatchObject({
      moduleLabel: "曖昧溫度計",
      artifactTitle: "完整分析報告",
      statusLabel: "已生成",
      recoveryStatus: "saved",
      recoveryStatusLabel: "已保存找回方式：o***@e***.com",
      maskedRecoveryContact: "o***@e***.com",
      recoveryLinkSent: true,
      supportEmail: "hello@anyu.tw",
    });
    expect(JSON.stringify(summary)).not.toContain("owner@example.com");
    expect(JSON.stringify(summary)).not.toContain("result_private_456");
    expect(JSON.stringify(summary)).not.toContain("pa_");
    expect(JSON.stringify(summary)).not.toContain("pcs_");
    expect(JSON.stringify(summary)).not.toContain("prl_");
  });

  it("does not claim sent state for unsaved or saved-only recovery", () => {
    const summary = getPaidResultDeliverySummary({
      moduleSlug: "ambiguous-temperature",
      moduleLabel: "曖昧溫度計",
      analysisResultId: "result_private_789",
      generatedAt: "2026-06-01T08:30:00.000Z",
      recoverySummary: {
        hasRecoveryContact: false,
        hasEmailRecovery: false,
        hasLineRecovery: false,
        emailStatus: "none",
        lineStatus: "none",
        transactionalConsentPresent: false,
        marketingOptInPresent: false,
        recommendedPostPaymentAction: "suggest_email_save",
        safeDisplayContact: null,
      },
    });

    expect(summary.recoveryStatus).toBe("unsaved");
    expect(summary.recoveryStatusLabel).toBe("尚未保存找回方式");
    expect(summary.recoveryLinkSent).toBe(false);
  });
});
