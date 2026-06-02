import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LineRecoveryBindBridge } from "@/components/line/LineRecoveryBindBridge";
import {
  parseLineRecoveryBindContext,
} from "@/lib/line/recovery-liff-context";

describe("LINE recovery LIFF page", () => {
  it("server-renders recovery semantics without LINE paid delivery promises", () => {
    const html = renderToStaticMarkup(
      createElement(LineRecoveryBindBridge, {
        initialSearch:
          "state=rlb_safeState&returnPath=%2Fm%2Fambiguous-temperature%2Fresult%2Fresult-1",
      }),
    );

    expect(html).toContain("用 LINE 保存這份報告");
    expect(html).toContain("之後可以透過 LINE 協助找回");
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
    expect(source).toContain("browserContext.state ? browserContext : serverContext");
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
});
