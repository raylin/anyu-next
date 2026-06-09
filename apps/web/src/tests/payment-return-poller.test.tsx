import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PaymentReturnPoller } from "@/components/modules/ai-temperature/PaymentReturnPoller";

describe("PaymentReturnPoller", () => {
  it("renders waiting state without implying browser return is payment success", () => {
    const html = renderToStaticMarkup(
      <PaymentReturnPoller
        moduleSlug="ambiguous-temperature"
        checkoutToken="redacted"
        initialStatus="waiting_for_payment"
      />,
    );

    expect(html).toContain("付款確認中");
    expect(html).toContain("瀏覽器回到此頁不代表付款已完成");
    expect(html).toContain("系統會在確認後自動更新");
    expect(html).toContain('data-paid-state-surface="return"');
    expect(html).toContain('data-paid-state-card="waiting_for_payment"');
    expect(html).toContain('data-return-state="waiting_for_payment"');
    expect(html).toContain("anyu-riso-paid-state-panel");
    expect(html).not.toContain("完整報告已準備好");
    expect(html).not.toContain("查看完整報告");
    expect(html).not.toContain('data-core-shell="true"');
  });

  it("renders ready state with a visible access CTA", () => {
    const html = renderToStaticMarkup(
      <PaymentReturnPoller
        moduleSlug="ambiguous-temperature"
        checkoutToken="redacted"
        initialStatus="paid_ready"
        initialAccessPath="/m/ambiguous-temperature/payment/access?checkoutToken=redacted"
      />,
    );

    expect(html).toContain("完整報告已準備好");
    expect(html).toContain("查看完整報告");
    expect(html).toContain('href="/m/ambiguous-temperature/payment/access?checkoutToken=redacted"');
    expect(html).toContain('data-paid-state-surface="return"');
    expect(html).toContain('data-paid-state-card="paid_ready"');
    expect(html).toContain('data-return-state="paid_ready"');
  });

  it("renders ready saved recovery confirmation without changing primary access CTA", () => {
    const html = renderToStaticMarkup(
      <PaymentReturnPoller
        moduleSlug="ambiguous-temperature"
        checkoutToken="redacted"
        initialStatus="paid_ready"
        initialAccessPath="/m/ambiguous-temperature/payment/access?checkoutToken=redacted"
        initialRecoverySummary={{
          hasRecoveryContact: true,
          hasEmailRecovery: true,
          hasLineRecovery: false,
          emailStatus: "bound",
          lineStatus: "none",
          transactionalConsentPresent: true,
          marketingOptInPresent: false,
          recommendedPostPaymentAction: "confirm_saved",
          safeDisplayContact: { type: "email", maskedValue: "o***@e***.com" },
        }}
      />,
    );

    expect(html).toContain("已保存查看連結：o***@e***.com");
    expect(html).toContain("查看完整報告");
    expect(html).not.toContain("owner@example.com");
  });

  it("renders ready unsaved recovery reminder without blocking access", () => {
    const html = renderToStaticMarkup(
      <PaymentReturnPoller
        moduleSlug="ambiguous-temperature"
        checkoutToken="redacted"
        initialStatus="paid_ready"
        initialAccessPath="/m/ambiguous-temperature/payment/access?checkoutToken=redacted"
        initialRecoverySummary={{
          hasRecoveryContact: false,
          hasEmailRecovery: false,
          hasLineRecovery: false,
          emailStatus: "none",
          lineStatus: "none",
          transactionalConsentPresent: false,
          marketingOptInPresent: false,
          recommendedPostPaymentAction: "suggest_email_save",
          safeDisplayContact: null,
        }}
      />,
    );

    expect(html).toContain("建議先保存這份報告的專屬查看連結");
    expect(html).toContain("查看完整報告");
    expect(html).not.toContain("Email 交付");
    expect(html).not.toContain("LINE 交付");
  });

  it("renders invalid session support and refund links", () => {
    const html = renderToStaticMarkup(
      <PaymentReturnPoller
        moduleSlug="ambiguous-temperature"
        initialStatus="invalid_session"
      />,
    );

    expect(html).toContain("這個付款狀態連結已失效");
    expect(html).toContain("hello@anyu.tw");
    expect(html).toContain("3–7 個工作天內回覆處理結果");
    expect(html).toContain("查看退款政策");
    expect(html).toContain('data-paid-state-surface="return"');
    expect(html).toContain('data-return-state="invalid_session"');
    expect(html).toContain("anyu-riso-paid-state-error");
  });
});
