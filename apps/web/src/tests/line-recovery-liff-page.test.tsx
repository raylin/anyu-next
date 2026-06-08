import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LineRecoveryBindBridge } from "@/components/line/LineRecoveryBindBridge";
import LineRecoveryBindPage from "@/app/line/recovery/bind/page";
import GlobalLineFulfillPage from "@/app/line/fulfill/page";
import ModuleLineFulfillPage from "@/app/m/[moduleSlug]/line/fulfill/page";
import {
  parseLineRecoveryBindContext,
} from "@/lib/line/recovery-liff-context";

describe("LINE recovery LIFF page", () => {
  it("wraps the recovery bind page in the Module 01 Riso shell", async () => {
    const page = await LineRecoveryBindPage({
      searchParams: Promise.resolve({
        state: "rlb_safeState",
        returnPath: "/m/ambiguous-temperature/result/result-1/checkout",
      }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain('data-shell="module"');
    expect(html).toContain('data-theme="ai-temperature-riso"');
    expect(html).toContain('data-module-theme="riso"');
    expect(html).toContain("anyu-v2");
    expect(html).not.toContain('aria-label="主題切換"');
  });

  it("server-renders recovery semantics without LINE paid delivery promises", () => {
    const html = renderToStaticMarkup(
      createElement(LineRecoveryBindBridge, {
        initialSearch:
          "state=rlb_safeState&returnPath=%2Fm%2Fambiguous-temperature%2Fresult%2Fresult-1",
      }),
    );

    expect(html).toContain("用 LINE 保存查看連結");
    expect(html).toContain('data-riso-flow="line-bind"');
    expect(html).toContain('data-riso-flow-state="idle"');
    expect(html).toContain("anyu-riso-flow-card");
    expect(html).toContain("anyu-riso-reference-panel");
    expect(html).toContain("anyu-riso-flow-hero");
    expect(html).toContain("anyu-riso-flow-stamp");
    expect(html).toContain("// 連結保管");
    expect(html).toContain("從 LINE 回到 ANYU 查看完整報告");
    expect(html).toContain("完整報告仍以網頁查看為準");
    expect(html).not.toContain("LINE 領取完整分析");
    expect(html).not.toContain("完整報告會傳到 LINE");
    expect(html).not.toContain("LINE 交付報告");
    expect(html).not.toContain("pa_");
    expect(html).not.toContain("pcs_");
    expect(html).not.toContain("unlockToken");
  });

  it("shows non-LINE fallback copy when state is missing", () => {
    const html = renderToStaticMarkup(
      createElement(LineRecoveryBindBridge, {
        initialSearch: "",
      }),
    );

    expect(html).toContain("缺少 LINE 保存狀態");
    expect(html).toContain('data-riso-flow="line-bind"');
    expect(html).toContain('data-riso-flow-state="fallback"');
    expect(html).toContain('data-riso-flow-state-card="fallback"');
    expect(html).toContain("anyu-riso-status-box-warning");
    expect(html).toContain("data-line-diagnostic-category=\"liff_state_missing\"");
    expect(html).toContain("請在 LINE 中開啟此頁，或回到原頁改用 Email 保存");
    expect(html).toContain("LINE 綁定失敗也不影響付款或查看報告");
  });

  it("rejects token-like or legacy fulfillment state in page context", () => {
    expect(parseLineRecoveryBindContext("state=pa_x")).toMatchObject({
      state: "pa_x",
      isStateShapeValid: false,
    });
    expect(parseLineRecoveryBindContext("state=pcs_x")).toMatchObject({
      state: "pcs_x",
      isStateShapeValid: false,
    });
    expect(parseLineRecoveryBindContext("state=unlockToken=abc")).toMatchObject({
      state: "unlockToken=abc",
      isStateShapeValid: false,
    });
  });

  it("parses LIFF state and keeps fallback return path internal only", () => {
    const state = encodeURIComponent(
      "/line/recovery/bind?state=rlb_safeState&returnPath=%2Fm%2Fambiguous-temperature%2Fresult%2Fresult-1",
    );

    expect(parseLineRecoveryBindContext(`?liff.state=${state}`)).toEqual({
      state: "rlb_safeState",
      fallbackReturnPath: "/m/ambiguous-temperature/result/result-1",
      stateSource: "liff_state",
      isStateShapeValid: true,
    });
    expect(parseLineRecoveryBindContext(`#liff.state=${state}`)).toEqual({
      state: "rlb_safeState",
      fallbackReturnPath: "/m/ambiguous-temperature/result/result-1",
      stateSource: "liff_state",
      isStateShapeValid: true,
    });
    expect(parseLineRecoveryBindContext(`?state=line-oauth-state&liff.state=${state}`)).toEqual({
      state: "rlb_safeState",
      fallbackReturnPath: "/m/ambiguous-temperature/result/result-1",
      stateSource: "liff_state",
      isStateShapeValid: true,
    });
    expect(parseLineRecoveryBindContext(`?state=line-oauth-state&rlb=rlb_safeState`)).toEqual({
      state: "rlb_safeState",
      fallbackReturnPath: null,
      stateSource: "direct_query",
      isStateShapeValid: true,
    });
    const nestedRlbState = encodeURIComponent(
      "/line/recovery/bind?state=line-oauth-state&rlb=rlb_safeState",
    );
    expect(parseLineRecoveryBindContext(`?liff.state=${nestedRlbState}`)).toEqual({
      state: "rlb_safeState",
      fallbackReturnPath: null,
      stateSource: "liff_state",
      isStateShapeValid: true,
    });
    expect(
      parseLineRecoveryBindContext(
        "?state=rlb_safeState&returnPath=https%3A%2F%2Fevil.example%2F",
      ),
    ).toMatchObject({
      fallbackReturnPath: null,
      isStateShapeValid: true,
    });
  });

  it("calls the recovery bind route with idToken and rlb state only", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/line/LineRecoveryBindBridge.tsx"),
      "utf8",
    );

    expect(source).toContain('fetch("/api/line/recovery/bind-liff"');
    expect(source).toContain("state: context.state");
    expect(source).toContain('url.searchParams.set("rlb", context.state)');
    expect(source).toContain("buildLineRecoveryLoginRedirectUri(context)");
    expect(source).toContain("browserContext.state ? browserContext : serverContext");
    expect(source).toContain("mapLineRecoveryBindApiFailure");
    expect(source).toContain("data-line-diagnostic-category");
    expect(source).toContain('data-riso-flow-state-card="loading"');
    expect(source).toContain('data-riso-flow-state-card="success"');
    expect(source).toContain("anyu-riso-flow-state-card");
    expect(source).toContain("idToken");
    expect(source).not.toContain("lineUserId");
    expect(source).not.toContain("unlockIntentId");
    expect(source).not.toContain("unlockToken");
    expect(source).not.toContain("fulfillmentCode");
  });

  it("does not invent legacy fulfillment UI from the recovery page", () => {
    const originalWindow = globalThis.window;

    vi.stubGlobal("window", undefined);

    try {
      const html = renderToStaticMarkup(
        createElement(LineRecoveryBindBridge, {
          initialSearch: "state=rlb_safeState",
        }),
      );

      expect(html).not.toContain("短碼");
      expect(html).not.toContain("領取");
      expect(html).not.toContain("打開完整分析");
    } finally {
      vi.stubGlobal("window", originalWindow);
    }
  });

  it("routes recovery liff.state through the global legacy LIFF entry page", async () => {
    const liffState = encodeURIComponent(
      "/line/recovery/bind?state=rlb_safeState&returnPath=%2Fm%2Fambiguous-temperature%2Fresult%2Fresult-1%2Fcheckout",
    );
    const page = await GlobalLineFulfillPage({
      searchParams: Promise.resolve({ "liff.state": liffState }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain('data-shell="module"');
    expect(html).toContain('data-theme="ai-temperature-riso"');
    expect(html).toContain('data-module-theme="riso"');
    expect(html).toContain('data-riso-flow="line-bind"');
    expect(html).toContain("anyu-riso-reference-panel");
    expect(html).toContain("用 LINE 保存查看連結");
    expect(html).toContain("從 LINE 回到 ANYU 查看完整報告");
    expect(html).not.toContain("LINE 短碼連結缺少有效測驗資料");
    expect(html).not.toContain("正在確認完整分析頁");
    expect(html).not.toContain("短碼");
  });

  it("routes recovery liff.state through the module legacy LIFF entry page", async () => {
    const liffState = encodeURIComponent(
      "/line/recovery/bind?state=rlb_safeState&returnPath=%2Fm%2Fambiguous-temperature%2Fresult%2Fresult-1%2Fcheckout",
    );
    const page = await ModuleLineFulfillPage({
      params: Promise.resolve({ moduleSlug: "ambiguous-temperature" }),
      searchParams: Promise.resolve({ "liff.state": liffState }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain('data-shell="module"');
    expect(html).toContain('data-theme="ai-temperature-riso"');
    expect(html).toContain('data-module-theme="riso"');
    expect(html).toContain('data-riso-flow="line-bind"');
    expect(html).toContain("anyu-riso-reference-panel");
    expect(html).toContain("用 LINE 保存查看連結");
    expect(html).toContain("完整報告仍以網頁查看為準");
    expect(html).not.toContain("LINE 短碼連結缺少有效測驗資料");
    expect(html).not.toContain("短碼");
  });
});
