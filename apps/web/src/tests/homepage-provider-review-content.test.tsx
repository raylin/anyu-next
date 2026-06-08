import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("homepage provider-review storefront content", () => {
  it("publishes product, price, charging, delivery, refund, and support content", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain('data-shell="core"');
    expect(html).toContain('data-core-shell="true"');
    expect(html).toContain('data-theme="core"');
    expect(html).toContain('data-core-static-page="home"');
    expect(html).toContain('data-core-hero="home"');
    expect(html).toContain('data-core-module-card="ai-temperature"');
    expect(html).not.toContain('data-shell="module"');
    expect(html).toContain("曖昧溫度計｜AI 關係互動分析報告");
    expect(html).toContain("數位 AI 輔助關係互動分析服務");
    expect(html).toContain("免費初步分析");
    expect(html).toContain("完整報告");
    expect(html).toContain("NT$ 49");
    expect(html).toContain("一次性付款，非訂閱制");
    expect(html).toContain("網頁交付");
    expect(html).toContain("重複付款");
    expect(html).toContain("完整退款政策");
    expect(html).toContain("hello@anyu.tw");
    expect(html).toContain("product preview");
  });

  it("does not expose payment runtime or private proof claims on the public storefront", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).not.toContain("NewebPay");
    expect(html).not.toContain("藍新");
    expect(html).not.toContain("公司統一編號");
    expect(html).not.toContain("工作室");
    expect(html).not.toContain("商號");
    expect(html).not.toContain("checkout");
  });
});
