import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PaidPreviewCard } from "@/components/anyu/PaidPreviewCard";
import { AiTemperatureResult } from "@/components/modules/ai-temperature/AiTemperatureResult";
import { aiTemperatureModule } from "@/content/modules/ai-temperature";
import type { AiTemperatureResultViewModel } from "@/lib/modules/ai-temperature-ui";

const resultFixture: AiTemperatureResultViewModel = {
  score: 48,
  stateLabel: "溫差期",
  oneSentenceRead: "你不是沒感覺，只是現在還不想先把底牌翻出來。",
  observedSignals: [
    { label: "主動度", value: 52, note: "他不是沒回，只是主動推進的力道偏保守。" },
    { label: "即時性", value: 41, note: "節奏有點慢，但還沒有完全抽離。" },
    { label: "情緒投入", value: 55, note: "情緒有留，但表達方式偏留白。" },
  ],
  insightTitle: "你卡住的，不只是回訊慢。",
  insight: "真正讓你不安的，是你感覺到他在場，但又沒有明確往前。",
  reassurance: "先不要急著補滿空白，讓下一句更有節奏。",
  persona: "微訊號觀察家",
  shareQuote: "有些曖昧不是沒訊號，是訊號太小聲。",
  paidHeadline: "解鎖下一句怎麼回",
  paidPrice: "NT$49",
  paidIncludedSections: ["3 種下一句回法", "對方可能的 3 種狀態", "48 小時觀察策略", "可收藏摘要卡"],
  paidPreviewCopy: "「你先忙你的，等你比較有空再來找我。」",
};

describe("ai-temperature result conversion polish", () => {
  it("renders the inline next-step CTA before the deeper paid flow", () => {
    const html = renderToStaticMarkup(
      <AiTemperatureResult
        moduleConfig={aiTemperatureModule}
        result={resultFixture}
        mode="demo"
        resultId="demo-result"
      />,
    );

    expect(html).toContain("想知道下一句怎麼回？");
    expect(html).toContain("解鎖 3 種下一句回法");
    expect(html).toContain("看下一句怎麼回");
    expect(html).toContain('data-module-theme="classic"');
    expect(html).toContain('aria-label="主題切換"');
    expect(html).toContain('aria-label="切換為柔和主題"');
    expect(html).toContain('aria-label="切換為鮮明主題"');
    expect(html).not.toContain(">柔和<");
    expect(html).not.toContain(">鮮明<");
    expect(html).not.toContain(">視覺<");
    expect(html).not.toContain("視覺風格");
    expect(html).not.toContain(">manual<");
    expect(html).not.toContain(">a/b<");
  });

  it("keeps the share action social and the paid preview hierarchy clearer", () => {
    const html = renderToStaticMarkup(
      <AiTemperatureResult
        moduleConfig={aiTemperatureModule}
        result={resultFixture}
        mode="demo"
        resultId="demo-result"
      />,
    );

    expect(html).toContain("分享這個結果");
    expect(html).toContain('class="anyu-button anyu-share-action anyu-share-action-primary"');
    expect(html).toContain("複製成 LINE / Threads 可以貼上的文字");
    expect(html).toContain("module");
    expect(html).toContain("曖昧溫度計");
    expect(html).toContain("他是真的忙，還是其實在冷掉？");
    expect(html).toContain("你現在的卡點 · 微訊號觀察家");
    expect(html).toContain("⋯ 尚未解鎖");
    expect(html).toContain("48 小時內，看他是自然靠近，還是只有在你提醒時才回應。");
    expect(html).toContain("一次性查看 · 無訂閱");
    expect(html).toContain("一次性 · no subscription");
    expect(html).toContain('class="anyu-reply-lock-mark"');
    expect(html).toContain("完整報告即將開放");
    expect(html).toContain("完整報告解鎖功能準備中");
    expect(html).toContain("完整報告將於網頁中提供查看。");
    expect(html).not.toContain("用 LINE 領取完整分析");
    expect(html).not.toContain("留下 Email");
    expect(html).toContain('class="anyu-paid-included-panel"');
    expect(html).toContain('class="anyu-paid-policy-panel"');
    expect(html).toContain("3 種可能狀態");
    expect(html).toContain("可直接使用的回覆句與回覆策略");
    expect(html).toContain("48 小時觀察建議");
    expect(html).toContain("分析依據線索摘要");
    expect(html).toContain("可回看的完整結果頁");
    expect(html).toContain("系統未成功產生結果、連結無法開啟或重複付款");
    expect(html).toContain("hello@anyu.tw");
    expect(html).toContain("3–7 個工作天內回覆處理結果");
    expect(html).toContain("不需要提供原始對話內容");
    expect(html).toContain("你提供的文字只用於本次分析與必要服務交付");
    expect(html).toContain("暗語 ANYU 是文字情境整理與溝通建議，不是心理治療、諮商、命理或關係結果保證。");
    expect(html).not.toContain("目前內測");
    expect(html).not.toContain("不會真的收費");
    expect(html).not.toContain("網頁或 LINE 連結交付");
    expect(html).not.toContain("這份分析主要參考了這些線索");
    expect(html).not.toContain("evidenceSummary");
    expect(html).not.toContain("checkout");
    expect(html).not.toContain("NewebPay");
    expect(html).not.toContain("藍新");
  });

  it("renders grouped provider-review copy under both theme wrappers", () => {
    const card = (
      <PaidPreviewCard
        headline={resultFixture.paidHeadline}
        price={resultFixture.paidPrice}
        includedSections={resultFixture.paidIncludedSections}
        previewCopy={resultFixture.paidPreviewCopy}
      />
    );

    const classicHtml = renderToStaticMarkup(<div className="anyu-module-theme">{card}</div>);
    const risoHtml = renderToStaticMarkup(<div className="anyu-module-theme anyu-v2">{card}</div>);

    for (const html of [classicHtml, risoHtml]) {
      expect(html).toContain('class="anyu-paid-included-panel"');
      expect(html).toContain('class="anyu-paid-policy-panel"');
      expect(html).toContain('class="anyu-paid-limitation-note"');
      expect(html).toContain("完整報告即將開放");
      expect(html).toContain("完整報告解鎖功能準備中");
      expect(html).toContain("正式付款後若系統未成功產生結果、連結無法開啟或重複付款");
      expect(html).toContain("3–7 個工作天內回覆處理結果");
      expect(html).not.toContain("目前內測");
      expect(html).not.toContain("不會真的收費");
      expect(html).not.toContain("LINE 連結交付");
      expect(html).not.toContain("checkout");
      expect(html).not.toContain("NewebPay");
      expect(html).not.toContain("藍新");
    }
  });

  it("renders checkout-available paid CTA copy without LINE or no-charge language", () => {
    const html = renderToStaticMarkup(
      <PaidPreviewCard
        headline={resultFixture.paidHeadline}
        price={resultFixture.paidPrice}
        includedSections={resultFixture.paidIncludedSections}
        previewCopy={resultFixture.paidPreviewCopy}
        availability="checkout_available"
      />,
    );

    expect(html).toContain("解鎖完整報告｜NT$49");
    expect(html).toContain("一次性付款，非訂閱制");
    expect(html).toContain("付款確認後，完整報告將於網頁中提供查看");
    expect(html).toContain("查看退款政策");
    expect(html).toContain("hello@anyu.tw");
    expect(html).not.toContain("目前內測");
    expect(html).not.toContain("不會真的收費");
    expect(html).not.toContain("LINE 連結交付");
  });

  it("can render checkout-available CTA as a checkout-start link", () => {
    const html = renderToStaticMarkup(
      <PaidPreviewCard
        headline={resultFixture.paidHeadline}
        price={resultFixture.paidPrice}
        includedSections={resultFixture.paidIncludedSections}
        previewCopy={resultFixture.paidPreviewCopy}
        availability="checkout_available"
        primaryHref="/m/ambiguous-temperature/result/result-1/checkout"
      />,
    );

    expect(html).toContain('href="/m/ambiguous-temperature/result/result-1/checkout"');
    expect(html).toContain("解鎖完整報告｜NT$49");
    expect(html).not.toContain("完整報告即將開放");
  });

  it("applies the editorial reading class only to long-form result surfaces", () => {
    const html = renderToStaticMarkup(
      <AiTemperatureResult
        moduleConfig={aiTemperatureModule}
        result={resultFixture}
        mode="demo"
        resultId="demo-result"
      />,
    );

    expect(html).toContain('class="anyu-copy t-reading"');
    expect(html).toContain('class="anyu-reassurance t-reading"');
    expect(html).toContain('class="anyu-reply-copy t-reading"');
    expect(html).not.toContain('class="anyu-share-action anyu-share-action-primary t-reading"');
    expect(html).not.toContain('class="anyu-button anyu-button-block anyu-button-secondary t-reading"');
    expect(html).not.toContain('class="anyu-subtle-note t-reading"');
  });

  it("applies kai typography only to the short quote surfaces", () => {
    const html = renderToStaticMarkup(
      <AiTemperatureResult
        moduleConfig={aiTemperatureModule}
        result={resultFixture}
        mode="demo"
        resultId="demo-result"
      />,
    );

    expect(html).toContain('class="anyu-lead-quote t-quote"');
    expect(html).toContain('class="anyu-share-quote t-kai-quote"');
    expect(html).toContain("「現在最不該做的，是把壓力全部丟到自己身上。」");
    expect(html).not.toContain('class="anyu-copy t-kai"');
    expect(html).not.toContain('class="anyu-reassurance t-kai"');
    expect(html).not.toContain('class="anyu-button anyu-button-block t-kai-quote"');
  });

  it("normalizes result and share labels onto the tokenized mono label helpers", () => {
    const html = renderToStaticMarkup(
      <AiTemperatureResult
        moduleConfig={aiTemperatureModule}
        result={resultFixture}
        mode="demo"
        resultId="demo-result"
      />,
    );

    expect(html).toContain('class="anyu-kicker t-label-accent"');
    expect(html).toContain('class="anyu-meta t-label-dim"');
    expect(html).toContain('class="anyu-kicker t-label-dim"');
    expect(html).toContain('class="anyu-kicker t-label-faint"');
  });
});
