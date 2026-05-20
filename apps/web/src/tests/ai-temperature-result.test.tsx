import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
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
  paidIncludedSections: ["把主導權留在你手上", "低壓試探", "尊嚴守門"],
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
    expect(html).toContain("解鎖 3 種不失控的回法");
    expect(html).toContain("看下一句怎麼回");
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
    expect(html).toContain("複製成 LINE / Threads 可以貼上的文字");
    expect(html).toContain("⋯ 尚未解鎖");
    expect(html).toContain("一次性查看 · 無訂閱");
    expect(html).toContain("一次性 · no subscription");
    expect(html).toContain("目前內測中，這次不會真的收費。點下後可加入 LINE 收到開放通知，或改用 Email。");
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
    expect(html).not.toContain('class="anyu-copy t-kai"');
    expect(html).not.toContain('class="anyu-reassurance t-kai"');
    expect(html).not.toContain('class="anyu-button anyu-button-block t-kai-quote"');
  });
});
