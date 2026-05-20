import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContactCapture } from "@/components/anyu/ContactCapture";

describe("contact capture line-first UI", () => {
  it("renders LINE as the primary notification CTA and Email as secondary fallback", () => {
    const html = renderToStaticMarkup(
      <ContactCapture visible lineAddUrl="https://lin.ee/S6dnbJO" />,
    );

    expect(html).toContain("加入 LINE，收到完整分析開放通知");
    expect(html).toContain("加入 LINE，收到開放通知");
    expect(html).toContain("改用 Email 接收通知");
    expect(html).toContain("完整分析與新測驗開放");
  });

  it("shows the missing-url fallback note when no LINE url is configured", () => {
    const html = renderToStaticMarkup(<ContactCapture visible lineAddUrl={null} />);

    expect(html).toContain("LINE 連結暫時還沒準備好，請先改用 Email 接收通知。");
  });
});
