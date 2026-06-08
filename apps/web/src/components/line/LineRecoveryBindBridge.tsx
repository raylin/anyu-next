"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";
import { Wordmark } from "@/components/anyu/Wordmark";
import { getLineLiffId } from "@/lib/line/config";
import {
  buildLineRecoveryBindDiagnosticResult,
  evaluateLineRecoveryBindDiagnostic,
  getInitialLineRecoveryBindDiagnostic,
  getLineRecoveryBindDiagnosticMessage,
  mapLineRecoveryBindApiFailure,
  type LineRecoveryBindDiagnosticCategory,
} from "@/lib/line/recovery-bind-diagnostics";
import { parseLineRecoveryBindContext } from "@/lib/line/recovery-liff-context";

declare global {
  interface Window {
    liff?: {
      init: (input: { liffId: string }) => Promise<void>;
      isLoggedIn: () => boolean;
      login: (input?: { redirectUri?: string }) => void;
      getIDToken: () => string | null;
      getProfile: () => Promise<{ userId: string }>;
    };
  }
}

type RecoveryBindState = "idle" | "loading" | "success" | "fallback";

type RecoveryBindResponse =
  | {
      ok: true;
      status: "success";
      recoveryContactStatus: "verified" | "bound";
      returnPath: string | null;
    }
  | {
      ok: false;
      error: string;
      bindCategory?: string;
      returnPath?: string | null;
    };

export function LineRecoveryBindBridge({ initialSearch }: { initialSearch?: string }) {
  const context = useMemo(() => {
    const serverContext = parseLineRecoveryBindContext(initialSearch ?? "");

    if (typeof window === "undefined") {
      return serverContext;
    }

    const browserSearch = [window.location.search, window.location.hash].filter(Boolean).join("&");
    const browserContext = parseLineRecoveryBindContext(browserSearch);

    return browserContext.state ? browserContext : serverContext;
  }, [initialSearch]);
  const initialFallbackCategory = getInitialLineRecoveryBindDiagnostic(context);
  const initialFallback = initialFallbackCategory
    ? getLineRecoveryBindDiagnosticMessage(initialFallbackCategory)
    : null;
  const [state, setState] = useState<RecoveryBindState>(initialFallback ? "fallback" : "idle");
  const [message, setMessage] = useState(
    initialFallback ?? "正在準備 LINE 保存流程。之後可以從 LINE 回到 ANYU 查看完整報告。",
  );
  const [diagnosticCategory, setDiagnosticCategory] =
    useState<LineRecoveryBindDiagnosticCategory | null>(initialFallbackCategory);
  const [returnPath, setReturnPath] = useState<string | null>(context.fallbackReturnPath);

  useEffect(() => {
    let cancelled = false;

    async function bindRecoveryLine() {
      const fallbackCategory = getInitialLineRecoveryBindDiagnostic(context);

      if (fallbackCategory) {
        const fallback = buildLineRecoveryBindDiagnosticResult(fallbackCategory);
        setState("fallback");
        setDiagnosticCategory(fallbackCategory);
        setMessage(fallback.safeMessage);
        return;
      }

      const liffId = getLineLiffId();

      if (!liffId) {
        const fallback = evaluateLineRecoveryBindDiagnostic({
          context,
          liffIdConfigured: false,
        });
        void recordLineRecoveryBindDiagnostic({
          state: context.state,
          category: "liff_init_failed",
          hasLiffState: true,
        });
        setState("fallback");
        setDiagnosticCategory(fallback.category);
        setMessage(fallback.safeMessage);
        return;
      }

      setState("loading");

      try {
        try {
          await loadLiffSdk();
        } catch {
          const fallback = evaluateLineRecoveryBindDiagnostic({
            context,
            sdkLoadStatus: "failed",
          });
          void recordLineRecoveryBindDiagnostic({
            state: context.state,
            category: "liff_sdk_load_failed",
            hasLiffState: true,
          });
          setState("fallback");
          setDiagnosticCategory(fallback.category);
          setMessage(fallback.safeMessage);
          return;
        }

        try {
          await window.liff?.init({ liffId });
        } catch {
          const fallback = evaluateLineRecoveryBindDiagnostic({
            context,
            sdkLoadStatus: "loaded",
            initStatus: "failed",
          });
          void recordLineRecoveryBindDiagnostic({
            state: context.state,
            category: "liff_init_failed",
            hasLiffState: true,
          });
          setState("fallback");
          setDiagnosticCategory(fallback.category);
          setMessage(fallback.safeMessage);
          return;
        }

        if (!window.liff?.isLoggedIn()) {
          const redirect = evaluateLineRecoveryBindDiagnostic({
            context,
            sdkLoadStatus: "loaded",
            initStatus: "success",
            loggedIn: false,
          });
          void recordLineRecoveryBindDiagnostic({
            state: context.state,
            category: "liff_login_redirect_started",
            hasLiffState: true,
          });
          setDiagnosticCategory(redirect.category);
          setMessage(redirect.safeMessage);
          window.liff?.login({ redirectUri: buildLineRecoveryLoginRedirectUri(context) });
          return;
        }

        const idToken = window.liff.getIDToken();

        if (!idToken) {
          const fallback = evaluateLineRecoveryBindDiagnostic({
            context,
            sdkLoadStatus: "loaded",
            initStatus: "success",
            loggedIn: true,
            idTokenPresent: false,
          });
          void recordLineRecoveryBindDiagnostic({
            state: context.state,
            category: "id_token_missing_after_login",
            hasLiffState: true,
            hasIdToken: false,
          });
          setState("fallback");
          setDiagnosticCategory(fallback.category);
          setMessage(fallback.safeMessage);
          return;
        }

        const response = await fetch("/api/line/recovery/bind-liff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            state: context.state,
            idToken,
          }),
        });
        const payload = (await response.json()) as RecoveryBindResponse;

        if (cancelled) {
          return;
        }

        setReturnPath(payload.returnPath ?? context.fallbackReturnPath);

        if (!response.ok || !payload.ok) {
          const category = payload.ok
            ? "bind_api_failed"
            : mapLineRecoveryBindApiFailure({
                error: payload.error,
                bindCategory: "bindCategory" in payload ? payload.bindCategory : null,
              });
          const fallback = buildLineRecoveryBindDiagnosticResult(category);
          setState("fallback");
          setDiagnosticCategory(fallback.category);
          setMessage(fallback.safeMessage);
          return;
        }

        const success = buildLineRecoveryBindDiagnosticResult("bind_success");
        setState("success");
        setDiagnosticCategory(success.category);
        setMessage(success.safeMessage);

        if (payload.returnPath) {
          window.location.assign(payload.returnPath);
        }
      } catch {
        if (!cancelled) {
          const fallback = buildLineRecoveryBindDiagnosticResult("bind_api_failed");
          setState("fallback");
          setDiagnosticCategory(fallback.category);
          setMessage(fallback.safeMessage);
        }
      }
    }

    void bindRecoveryLine();

    return () => {
      cancelled = true;
    };
  }, [context]);

  return (
    <section
      className="anyu-line-bind-flow anyu-result-stack"
      data-riso-flow="line-bind"
      data-riso-flow-state={state}
    >
        <div className="anyu-result-topbar">
          <Link href="/m/ambiguous-temperature" className="anyu-back-link">
            ← 回到測驗
          </Link>
          <Wordmark showMark />
        </div>

        <Card className="anyu-riso-flow-card anyu-riso-reference-panel anyu-line-bind-card">
          <div className="anyu-riso-flow-hero">
            <div className="anyu-riso-flow-hero-copy">
              <p className="anyu-riso-flow-eyebrow">{"// 連結保管"}</p>
              <h1 className="anyu-section-title anyu-riso-flow-title">用 LINE 保存查看連結</h1>
            </div>
            <span className="anyu-riso-flow-stamp" aria-hidden="true">
              ✦
            </span>
          </div>
          {diagnosticCategory ? (
            <p
              hidden
              className="anyu-subtle-note"
              data-line-diagnostic-category={diagnosticCategory}
            >
              狀態代碼：{diagnosticCategory}
            </p>
          ) : null}
          <div className="anyu-riso-flow-copy-block">
            <p className="anyu-copy">{message}</p>
            <p className="anyu-subtle-note">
              LINE 只會保存或傳送查看連結；完整報告仍以網頁查看為準。
            </p>
          </div>

          {state === "loading" ? (
            <p
              className="anyu-status-message anyu-riso-status-box anyu-riso-status-box-pending anyu-riso-flow-state-card"
              role="status"
              data-riso-flow-state-card="loading"
            >
              正在確認 LINE 身分…
            </p>
          ) : null}

          {state === "success" ? (
            <p
              className="anyu-recovery-confirmation anyu-riso-status-box anyu-riso-status-box-success anyu-riso-flow-state-card"
              role="status"
              data-riso-flow-state-card="success"
            >
              LINE 保存成功。正在回到原本的報告頁。
            </p>
          ) : null}

          {state === "fallback" ? (
            <div
              className="anyu-contact-code-box anyu-riso-status-box anyu-riso-status-box-warning anyu-riso-flow-state-card"
              data-riso-flow-state-card="fallback"
            >
              <p className="anyu-subtle-note">
                請在 LINE 中開啟此頁，或回到原頁改用 Email 保存。LINE 綁定失敗也不影響付款或查看報告。
              </p>
              {returnPath ? (
                <Link
                  href={returnPath}
                  className="anyu-button anyu-button-block anyu-riso-flow-cta"
                >
                  回到原本頁面
                </Link>
              ) : (
                <Link
                  href="/m/ambiguous-temperature"
                  className="anyu-button anyu-button-block anyu-riso-flow-cta"
                >
                  回到曖昧溫度計
                </Link>
              )}
            </div>
          ) : null}

          {state === "success" && returnPath ? (
            <Button
              type="button"
              className="anyu-button-block anyu-riso-flow-cta"
              onClick={() => {
                window.location.assign(returnPath);
              }}
            >
              回到報告頁
            </Button>
          ) : null}
        </Card>
    </section>
  );
}

function recordLineRecoveryBindDiagnostic(input: {
  state?: string | null;
  category: LineRecoveryBindDiagnosticCategory;
  hasLiffState?: boolean;
  hasIdToken?: boolean;
  bindApiReached?: boolean;
  recipientSecretRequired?: boolean;
  recipientSecretCreated?: boolean;
}) {
  if (!input.state) {
    return Promise.resolve();
  }

  return fetch("/api/line/recovery/bind-diagnostics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      state: input.state,
      category: input.category,
      hasLiffState: input.hasLiffState,
      hasIdToken: input.hasIdToken,
      bindApiReached: input.bindApiReached,
      recipientSecretRequired: input.recipientSecretRequired,
      recipientSecretCreated: input.recipientSecretCreated,
    }),
  }).catch(() => null);
}

function buildLineRecoveryLoginRedirectUri(context: {
  state: string;
  fallbackReturnPath: string | null;
}) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("rlb", context.state);

  if (context.fallbackReturnPath) {
    url.searchParams.set("returnPath", context.fallbackReturnPath);
  }

  return url.toString();
}

function loadLiffSdk() {
  if (window.liff) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-line-liff-sdk]");

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("liff_sdk_load_failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://static.line-scdn.net/liff/edge/2/sdk.js";
    script.async = true;
    script.dataset.lineLiffSdk = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("liff_sdk_load_failed"));
    document.head.appendChild(script);
  });
}
