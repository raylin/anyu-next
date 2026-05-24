import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnyuMark } from "@/components/anyu/AnyuMark";
import { InputCard } from "@/components/anyu/InputCard";
import { ShareCardPreview } from "@/components/anyu/ShareCardPreview";
import { Wordmark } from "@/components/anyu/Wordmark";

describe("AnyuMark", () => {
  it("renders an accessible static mark by default", () => {
    const html = renderToStaticMarkup(<AnyuMark size={32} title="ANYU brand mark" />);

    expect(html).toContain('viewBox="0 0 100 100"');
    expect(html).toContain('width="32"');
    expect(html).toContain('height="32"');
    expect(html).toContain('role="img"');
    expect(html).toContain("ANYU brand mark");
    expect(html).toContain('fill="currentColor"');
    expect(html).not.toContain("anyu-mark--typing");
  });

  it("renders decorative and animated states safely", () => {
    const html = renderToStaticMarkup(<AnyuMark animated decorative className="custom-class" />);

    expect(html).toContain("anyu-mark anyu-mark--typing custom-class");
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('role="img"');
    expect(html).toContain("anyu-mark__dot--1");
    expect(html).toContain('cy="50"');
  });

  it("uses the static favicon asset with fixed fill color", () => {
    const favicon = readFileSync(resolve(process.cwd(), "public/favicon.svg"), "utf8");

    expect(favicon).toContain('fill="#2a2419"');
    expect(favicon).not.toContain("currentColor");
  });

  it("supports the selective lockup rollout without replacing the text wordmark by default", () => {
    const defaultWordmark = renderToStaticMarkup(<Wordmark />);
    const lockupWordmark = renderToStaticMarkup(<Wordmark showMark />);

    expect(defaultWordmark).not.toContain("anyu-wordmark-mark");
    expect(lockupWordmark).toContain("anyu-wordmark-mark");
    expect(lockupWordmark).toContain('aria-label="暗語 ANYU"');
  });

  it("renders the loading state with the animated mark instead of the old moon/dots", () => {
    const html = renderToStaticMarkup(
      <InputCard
        chips={["對方忽冷忽熱"]}
        selectedChip="對方忽冷忽熱"
        inputValue="這是一段足夠長的測試內容，讓分析按鈕可以進入正常可分析狀態。"
        onChipSelect={() => {}}
        onInputChange={() => {}}
        onSubmit={() => {}}
        ctaLabel="分析我的曖昧溫度"
        ctaDisabled={false}
        isLoading
        statusMessage="分析中，請稍候..."
        statusDetail="我們先讀你的描述，再整理出一個比較像人的判讀角度。"
      />,
    );

    expect(html).toContain("anyu-loading-mark");
    expect(html).toContain("anyu-mark--typing");
    expect(html).not.toContain("anyu-loading-moon");
    expect(html).not.toContain("anyu-loading-dots");
  });

  it("renders the share surface with the mini brand lockup instead of the old purple dot", () => {
    const html = renderToStaticMarkup(
      <ShareCardPreview
        moduleTitle="曖昧溫度計"
        moduleSubtitle="他是真的忙，還是其實在冷掉？"
        persona="慢熱觀察派"
        quote="他沒有退，但也還沒往前。"
        score={62}
        stateLabel="微熱"
      />,
    );

    expect(html).toContain("anyu-wordmark-share");
    expect(html).toContain("anyu-wordmark-mark");
    expect(html).not.toContain("anyu-share-dot");
  });

  it("keeps the v1.1 bar and loading CSS aligned with the selective rollout rules", () => {
    const globalsCss = readFileSync(resolve(process.cwd(), "src/styles/globals.css"), "utf8");

    expect(globalsCss).toContain(".anyu-wordmark-mark");
    expect(globalsCss).toContain(".anyu-wordmark-share");
    expect(globalsCss).toContain("height: 0.25rem;");
    expect(globalsCss).toContain("var(--anyu-accent2) 0%, var(--anyu-rose) 50%, var(--anyu-accent) 100%");
    expect(globalsCss).toContain(".anyu-signal-item .anyu-meter-fill");
    expect(globalsCss).toContain(".anyu-loading-mark");
    expect(globalsCss).not.toContain(".anyu-orb");
    expect(globalsCss).not.toContain(".anyu-share-dot");
    expect(globalsCss).not.toContain(".anyu-loading-moon");
    expect(globalsCss).not.toContain(".anyu-loading-dots");
  });
});
