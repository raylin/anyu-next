import fs from "node:fs";
import path from "node:path";
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
  it("uses the shared Module 01 wait helper for paid-status polling", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "scripts/result-checkout-no-card-qa.mjs"),
      "utf8",
    );

    expect(source).toContain('import { waitForCondition } from "./lib/module01-wait.mjs";');
    expect(source).toContain("const waitResult = await waitForCondition");
    expect(source).not.toContain("for (let attempt = 1; attempt <= 24; attempt += 1)");
  });

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
      先保存查看連結 請先用 Email 保存查看連結 Email 查看連結 用 Email 保存查看連結
      付款前請先保存查看連結 payment locked 請先完成 Email 查看連結保存，付款按鈕就會開啟
      <a href="/refund">退款</a> hello@anyu.tw 3–7 個工作天
      <form method="POST" action="/api/modules/ambiguous-temperature/result/result-1/recovery/email">
        <button>用 Email 保存查看連結</button>
      </form>
      <button disabled>繼續付款</button>
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
      recoverySoftGatePresent: true,
      recoveryEmailPrimaryPresent: true,
      recoveryEmailOnlyDesktopPresent: true,
      recoveryLineDeferredPresent: false,
      recoverySkipWarningPresent: false,
      recoveryRequiredWarningPresent: true,
      paymentLockedPresent: true,
      supportRefundPresent: true,
      submitButtonPresent: true,
      sandboxCcoreTargetPresent: false,
      formMethodPostPresent: true,
      providerFieldNamesPresent: {
        merchantId: false,
        tradeInfo: false,
        tradeSha: false,
        version: false,
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
      redactRouteShape("/payment/newebpay/return?checkoutToken=pcs_secret_token_value"),
    ).toBe("/payment/newebpay/return?checkoutToken=[REDACTED]");
    expect(redactRouteShape("/r/prl_secret_token_value")).toBe("/r/[REDACTED]");
    expect(containsTokenLikeValue("raw pa_secret_token_value")).toBe(true);
    expect(containsTokenLikeValue("raw prl_secret_token_value")).toBe(true);
    expect(() => sanitizeRecord({ value: "pcs_secret_token_value" })).toThrow(
      "unsafe_token_like_output_detected",
    );
  });
});
