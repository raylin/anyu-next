import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appGlobals = () => readFileSync(resolve(process.cwd(), "src/styles/globals.css"), "utf8");
const referenceTokens = () =>
  readFileSync(
    resolve(process.cwd(), "../../ai-collaboration/design/theme-architecture-v0/anyu-tokens-v2.css"),
    "utf8",
  );
const referenceCore = () =>
  readFileSync(
    resolve(process.cwd(), "../../ai-collaboration/design/theme-architecture-v0/core-shell-screens.jsx"),
    "utf8",
  );
const paidStatePanel = () =>
  readFileSync(resolve(process.cwd(), "src/components/modules/ai-temperature/RisoPaidStatePanel.tsx"), "utf8");

function cssBlock(source: string, selector: string) {
  const start = source.indexOf(selector);
  expect(start).toBeGreaterThanOrEqual(0);
  const end = source.indexOf("\n}", start);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end);
}

describe("reference-driven ANYU design-system alignment", () => {
  it("keeps CoreShell on the quiet reference token layer instead of Module 01 accent tokens", () => {
    const globals = appGlobals();
    const reference = referenceCore();
    const shellBlock = cssBlock(globals, ".anyu-core-shell {");
    const previewBlock = cssBlock(globals, ".anyu-product-preview-card {");

    expect(reference).toContain("Core Shell is the QUIET layer");
    expect(reference).toContain("NO thick-ink offset cards");
    expect(reference).toContain("Module color shows only as small swatches");

    expect(shellBlock).toContain("--anyu-core-bg: #faf6ee;");
    expect(shellBlock).toContain("--anyu-core-ink: #1a1626;");
    expect(shellBlock).toContain("--anyu-core-hairline: rgba(26, 22, 38, .14);");
    expect(shellBlock).toContain("--anyu-core-paper-grain:");

    expect(previewBlock).toContain("--anyu-core-module-ai-temperature");
    expect(previewBlock).not.toContain("var(--anyu-accent2");
    expect(previewBlock).not.toContain("var(--anyu-shadow");
  });

  it("exposes the Riso v2 reference token contract for shared Module 01 flow primitives", () => {
    const globals = appGlobals();
    const reference = referenceTokens();

    for (const token of [
      "--anyu-track-mono-lg",
      "--anyu-type-label-sm-size",
      "--anyu-type-num-sm-size",
      "--anyu-gutter",
      "--anyu-max-content",
      "--anyu-stack-card",
      "--anyu-stack-section",
      "--anyu-border-thin",
      "--anyu-border-cta",
      "--anyu-stripe-loading",
    ]) {
      expect(reference).toContain(token);
      expect(globals).toContain(token);
    }

    expect(globals).toContain('--anyu-font-latin: "Fraunces", "Instrument Serif", "Noto Serif TC", serif;');
    expect(globals).toContain('--anyu-font-mono: "Space Mono", "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;');
    expect(globals).toContain("--anyu-shadow-lg: 4px 4px 0 var(--anyu-ink);");
  });

  it("keeps shared Riso flow components on thick ink, sharp radius, and offset shadow primitives", () => {
    const globals = appGlobals();

    expect(globals).toContain(".anyu-v2 .anyu-riso-reference-panel");
    expect(globals).toContain("border-width: var(--anyu-border-heavy);");
    expect(globals).toContain("border-color: var(--anyu-ink);");
    expect(globals).toContain("box-shadow: var(--anyu-shadow-acc);");
    expect(globals).toContain(".anyu-v2 .anyu-riso-save-option");
    expect(globals).toContain(".anyu-v2 .anyu-riso-save-cta");
  });

  it("keeps Module 01 paid-state surfaces on the shared Riso reference primitive", () => {
    const globals = appGlobals();
    const panel = paidStatePanel();

    expect(panel).toContain("data-paid-state-surface");
    expect(panel).toContain("data-paid-state-card");
    expect(panel).toContain("data-access-link-state");
    expect(panel).toContain("data-return-state");
    expect(panel).toContain("data-generation-status");
    expect(panel).toContain("anyu-riso-paid-state-panel");
    expect(panel).toContain("anyu-riso-reference-panel");

    expect(globals).toContain(".anyu-v2 .anyu-riso-paid-state-panel");
    expect(globals).toContain(".anyu-v2 .anyu-riso-paid-state-panel::before");
    expect(globals).toContain(".anyu-v2 .anyu-riso-paid-state-stamp");
    expect(globals).toContain(".anyu-v2 .anyu-riso-paid-result-cover");
    expect(globals).toContain("background: var(--anyu-stripe-loading);");
  });
});
