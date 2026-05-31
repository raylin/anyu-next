import { describe, expect, it } from "vitest";

import {
  assertSafeQaBaseUrl,
  containsTokenLikeValue,
  extractCheckoutHref,
  redactRouteShape,
  sanitizeRecord,
  summarizeCheckoutStartHtml,
  summarizeResultPageHtml,
} from "../../scripts/lib/result-checkout-no-card-qa.mjs";

describe("result checkout no-card QA helpers", () => {
  it("rejects production targets", () => {
    expect(assertSafeQaBaseUrl("https://anyu.tw")).toEqual({
      ok: false,
      error: "production_target_rejected",
    });
    expect(assertSafeQaBaseUrl("https://staging.anyu.tw")).toEqual({ ok: true });
  });

  it("extracts checkout href and summarizes launch-safe result page copy", () => {
    const html = `
      <a href="/m/ambiguous-temperature/result/result-1/checkout">解鎖完整報告｜NT$49</a>
    `;

    expect(extractCheckoutHref(html)).toBe("/m/ambiguous-temperature/result/result-1/checkout");
    expect(summarizeResultPageHtml(html)).toMatchObject({
      paidCtaVisible: true,
      checkoutHrefPresent: true,
      checkoutHrefShape: "/m/ambiguous-temperature/result/[REDACTED]/checkout",
      forbiddenCopyFound: [],
      secretNameLeaksFound: [],
    });
  });

  it("detects unavailable CTA and forbidden launch copy safely", () => {
    const summary = summarizeResultPageHtml("完整報告即將開放，目前 internal test no charge");

    expect(summary.paidCtaVisible).toBe(false);
    expect(summary.checkoutHrefPresent).toBe(false);
    expect(summary.forbiddenCopyFound.length).toBeGreaterThan(0);
  });

  it("summarizes checkout-start HTML without requiring provider field values in logs", () => {
    const html = `
      暗語 ANYU 返回免費結果 MODULE 01 曖昧溫度計
      <ol aria-label="付款流程"><li>付款</li><li>生成</li><li>完成</li></ol>
      NT$49 一次性付款 非訂閱制
      你將前往藍新金流完成安全付款
      付款完成後，我們會等候藍新的正式通知。返回頁不會直接判定付款成功。
      完整報告將於網頁中提供查看
      <a href="/refund">退款</a> hello@anyu.tw 3–7 個工作天
      <form method="POST" action="https://ccore.newebpay.com/MPG/mpg_gateway">
        <input type="hidden" name="MerchantID" value="mock-merchant">
        <input type="hidden" name="TradeInfo" value="mock-trade-info">
        <input type="hidden" name="TradeSha" value="mock-trade-sha">
        <input type="hidden" name="Version" value="2.0">
        <button>前往藍新安全付款頁</button>
      </form>
    `;

    expect(summarizeCheckoutStartHtml(html)).toMatchObject({
      anyuWordmarkPresent: true,
      backLinkPresent: true,
      moduleIdentityPresent: true,
      stepperPresent: true,
      pricePresent: true,
      oneTimePresent: true,
      nonSubscriptionPresent: true,
      newebpayTrustPresent: true,
      providerNotificationTruthPresent: true,
      webDeliveryPresent: true,
      supportRefundPresent: true,
      submitButtonPresent: true,
      sandboxCcoreTargetPresent: true,
      formMethodPostPresent: true,
      providerFieldNamesPresent: {
        merchantId: true,
        tradeInfo: true,
        tradeSha: true,
        version: true,
      },
      forbiddenCopyFound: [],
      secretNameLeaksFound: [],
    });
  });

  it("redacts tokenized route shapes and blocks unsafe output records", () => {
    expect(redactRouteShape("/m/ambiguous-temperature/result/result-1/checkout")).toBe(
      "/m/ambiguous-temperature/result/[REDACTED]/checkout",
    );
    expect(redactRouteShape("/m/ambiguous-temperature/unlock/pa_secret_token_value")).toBe(
      "/m/ambiguous-temperature/unlock/[REDACTED]",
    );
    expect(
      redactRouteShape("/m/ambiguous-temperature/payment/return?checkoutToken=pcs_secret_token_value"),
    ).toBe("/m/ambiguous-temperature/payment/return?checkoutToken=[REDACTED]");
    expect(containsTokenLikeValue("raw pa_secret_token_value")).toBe(true);
    expect(() => sanitizeRecord({ value: "pcs_secret_token_value" })).toThrow(
      "unsafe_token_like_output_detected",
    );
  });
});
