import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContactCapture } from "@/components/anyu/ContactCapture";

describe("contact capture line-first UI", () => {
  it("renders LINE as the primary fulfillment CTA and Email as secondary fallback", () => {
    const html = renderToStaticMarkup(
      <ContactCapture
        visible
        lineAddUrl="https://lin.ee/S6dnbJO"
        liffUrl="https://liff.line.me/test"
        fulfillmentCode="A7K2Q9"
        fulfillmentExpiresAt="2026-05-21T00:30:00.000Z"
      />,
    );

    expect(html).toContain("用 LINE 領取完整分析");
    expect(html).toContain("改用 Email 接收通知");
    expect(html).toContain("加入 LINE 後，我們會把完整分析連結送給你");
    expect(html).toContain("A7K2Q9");
    expect(html).toContain("如果沒有自動帶入");
    expect(html).toContain("你可以隨時封鎖官方帳號，或來信 hello@anyu.tw 要求刪除資料。");
    expect(html).not.toContain("LINE 會是主要的內測通知與完整分析開放通知管道");
  });

  it("shows the missing-url fallback note when no LINE url is configured", () => {
    const html = renderToStaticMarkup(<ContactCapture visible lineAddUrl={null} />);

    expect(html).toContain("LINE 連結暫時還沒準備好，請先改用 Email 接收通知。");
  });
});
