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
    expect(html).toContain("目前內測中，這次不會真的收費。點下後可加入 LINE 收到開放通知，或改用 Email。");
    expect(html).not.toContain("這份分析主要參考了這些線索");
    expect(html).not.toContain("evidenceSummary");
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
