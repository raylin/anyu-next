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
    expect(html).not.toContain("完整報告已準備好");
    expect(html).not.toContain("查看完整報告");
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
  });
});
