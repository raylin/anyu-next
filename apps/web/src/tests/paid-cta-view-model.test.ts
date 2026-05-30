import { describe, expect, it } from "vitest";
import { buildPaidCtaViewModel } from "@/lib/modules/paid-cta-view-model";

describe("paid CTA view model", () => {
  it("keeps review-pending copy launch-aligned and disabled", () => {
    const model = buildPaidCtaViewModel({
      availability: "review_pending",
      price: "NT$49",
    });
    const serialized = JSON.stringify(model);

    expect(model.primaryEnabled).toBe(false);
    expect(model.primaryLabel).toBe("完整報告即將開放");
    expect(model.microcopy).toContain("NT$49 單次付款");
    expect(serialized).toContain("3–7 個工作天內回覆處理結果");
    expect(serialized).not.toContain("內測");
    expect(serialized).not.toContain("不會真的收費");
    expect(serialized).not.toContain("LINE");
  });

  it("keeps checkout-available copy explicit about one-time web delivery", () => {
    const model = buildPaidCtaViewModel({
      availability: "checkout_available",
      price: "NT$49",
    });
    const serialized = JSON.stringify(model);

    expect(model.primaryEnabled).toBe(true);
    expect(model.primaryLabel).toBe("解鎖完整報告｜NT$49");
    expect(model.microcopy).toContain("一次性付款，非訂閱制");
    expect(model.microcopy).toContain("完整報告將於網頁中提供查看");
    expect(model.showRefundLink).toBe(true);
    expect(serialized).not.toContain("LINE");
  });

  it("does not imply ReturnURL is payment truth while waiting", () => {
    const model = buildPaidCtaViewModel({
      availability: "waiting_for_payment",
      price: "NT$49",
    });

    expect(model.primaryEnabled).toBe(false);
    expect(model.primaryLabel).toBe("正在確認付款");
    expect(model.microcopy).toContain("等待金流正式通知");
    expect(model.microcopy).toContain("不會直接判定付款成功");
  });

  it("includes support/refund framing for failed states", () => {
    const model = buildPaidCtaViewModel({
      availability: "failed_support",
      price: "NT$49",
    });
    const serialized = JSON.stringify(model);

    expect(serialized).toContain("報告暫時無法完成");
    expect(serialized).toContain("協助補發或退款");
    expect(serialized).toContain("hello@anyu.tw");
    expect(serialized).toContain("3–7 個工作天內回覆處理結果");
  });
});
