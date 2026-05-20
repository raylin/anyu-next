import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnyuMark } from "@/components/anyu/AnyuMark";

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
});
