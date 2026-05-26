"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";
import { Wordmark } from "@/components/anyu/Wordmark";
import { ModuleThemeBoundary } from "@/components/modules/ai-temperature/ModuleThemeFrame";
import { getLineLiffId } from "@/lib/line/config";
import {
  buildLiffDiagnosticSnapshot,
  isLiffDebugEnabled,
  type LiffBindAttemptStatus,
  type LiffDiagnosticSnapshot,
} from "@/lib/line/liff-diagnostics";
import {
  getModuleThemeFromLineFulfillmentContext,
  parseLineFulfillmentContext,
} from "@/lib/line/liff-context";
import { getModuleBySlug, listModules } from "@/lib/modules/registry";
import { LINE_FULFILLMENT_FALLBACK_INTRO } from "@/lib/modules/ai-temperature-ui";

declare global {
  interface Window {
    liff?: {
      init: (input: { liffId: string }) => Promise<void>;
      isLoggedIn: () => boolean;
      login: (input?: { redirectUri?: string }) => void;
      getProfile: () => Promise<{ userId: string }>;
      getIDToken: () => string | null;
    };
  }
}

type BindState = "idle" | "loading" | "success" | "fallback" | "error";

export function LineFulfillBridge({
  defaultModuleSlug,
  initialSearch,
}: {
  defaultModuleSlug?: string;
  initialSearch?: string;
}) {
  const initialParams = useMemo(() => {
    if (typeof window === "undefined") {
      return parseLineFulfillmentContext(initialSearch ?? "", { defaultModuleSlug });
    }

    return parseLineFulfillmentContext(window.location.search, { defaultModuleSlug });
  }, [defaultModuleSlug, initialSearch]);
  const initialFallbackMessage = getFallbackMessage(initialParams);
  const themeModuleConfig =
    getModuleBySlug(initialParams.moduleSlug) ??
    getModuleBySlug(defaultModuleSlug ?? "") ??
    getModuleBySlug("ambiguous-temperature");
  const initialTheme = getModuleThemeFromLineFulfillmentContext(initialParams);
  const [state, setState] = useState<BindState>(initialFallbackMessage ? "fallback" : "idle");
  const [message, setMessage] = useState(initialFallbackMessage ?? "正在準備 LINE 領取流程…");
  const [unlockedPath, setUnlockedPath] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<LiffDiagnosticSnapshot | null>(() =>
    buildInitialDiagnostic(initialParams),
  );
  const isDebugEnabled = Boolean(diagnostic);

  useEffect(() => {
    let cancelled = false;

    async function runLiffBind() {
      const liffId = getLineLiffId();
      const moduleConfig = getModuleBySlug(initialParams.moduleSlug);
      const fallbackMessage = getFallbackMessage(initialParams);

      if (fallbackMessage || !moduleConfig) {
        updateDiagnostic({
          setDiagnostic,
          context: initialParams,
          bindAttemptStatus: "failed",
          lastSafeErrorCode: fallbackMessage ? "invalid_context" : "unsupported_module",
        });
        setState("fallback");
        setMessage(fallbackMessage ?? "LINE 領取連結缺少有效測驗資料，請回到結果頁重新產生，或改用短碼。");
        return;
      }

      if (!liffId) {
        updateDiagnostic({
          setDiagnostic,
          context: initialParams,
          bindAttemptStatus: "failed",
          lastSafeErrorCode: "missing_liff_id",
        });
        setState("fallback");
        setMessage("LINE 自動帶入暫時不可用，請改用短碼。");
        return;
      }

      updateDiagnostic({
        setDiagnostic,
        context: initialParams,
        bindAttemptStatus: "pending",
      });
      setState("loading");

      try {
        await loadLiffSdk();
        await window.liff?.init({ liffId });

        if (!window.liff?.isLoggedIn()) {
          updateDiagnostic({
            setDiagnostic,
            context: initialParams,
            bindAttemptStatus: "pending",
            navigationMethod: "liff.login_redirect",
          });
          window.liff?.login({ redirectUri: window.location.href });
          return;
        }

        const idToken = window.liff.getIDToken();
        const response = await fetch("/api/line/fulfillment/bind-liff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleSlug: initialParams.moduleSlug,
            unlockIntentId: initialParams.unlockIntentId,
            unlockToken: initialParams.unlockToken,
            themeVariant: initialParams.themeVariant,
            themeSource: initialParams.themeSource,
            idToken,
          }),
        });
        const payload = (await response.json()) as {
          ok: boolean;
          unlockedPath?: string;
          unlockedUrl?: string;
          message?: string;
        };

        if (cancelled) {
          return;
        }

        const redirectTarget = normalizeUnlockRedirectTarget(payload.unlockedPath ?? payload.unlockedUrl);

        if (!response.ok || !payload.ok || !redirectTarget) {
          updateDiagnostic({
            setDiagnostic,
            context: initialParams,
            bindAttemptStatus: "failed",
            bindResponseTarget: payload.unlockedPath ?? payload.unlockedUrl ?? null,
            lastSafeErrorCode: !response.ok ? "bind_response_not_ok" : "invalid_redirect_target",
          });
          setState("fallback");
          setMessage(payload.message ?? "LINE 自動領取失敗，請改用短碼。");
          return;
        }

        updateDiagnostic({
          setDiagnostic,
          context: initialParams,
          bindAttemptStatus: "success",
          bindResponseTarget: redirectTarget,
          navigationMethod: "window.location.assign",
        });
        setUnlockedPath(redirectTarget);
        setState("success");
        if (!isDebugEnabled) {
          window.location.assign(redirectTarget);
        }
      } catch {
        if (!cancelled) {
          updateDiagnostic({
            setDiagnostic,
            context: initialParams,
            bindAttemptStatus: "failed",
            lastSafeErrorCode: "bind_exception",
          });
          setState("fallback");
          setMessage("LINE 自動領取失敗，請改用短碼。");
        }
      }
    }

    void runLiffBind();

    return () => {
      cancelled = true;
    };
  }, [initialParams, isDebugEnabled]);

  const bridgeContent = (
    <main className="anyu-shell">
      <section className="anyu-result-stack">
        <div className="anyu-result-topbar">
          <Link href="/m/ambiguous-temperature" className="anyu-back-link">
            ← 回到測驗
          </Link>
          <Wordmark showMark />
        </div>

        <Card>
          <p className="anyu-kicker">LINE 領取</p>
          <h1 className="anyu-section-title">正在領取完整分析</h1>
          <p className="anyu-copy">{message}</p>

          {state === "success" && unlockedPath ? (
            <Button
              type="button"
              className="anyu-button-block"
              onClick={() => {
                window.location.assign(unlockedPath);
              }}
            >
              打開完整分析
            </Button>
          ) : null}

          {state === "fallback" || state === "error" ? (
            <div className="anyu-contact-code-box">
              <p className="anyu-subtle-note">{LINE_FULFILLMENT_FALLBACK_INTRO}</p>
              <strong>{diagnostic ? "短碼已隱藏" : initialParams.code || "請回到結果頁重新產生"}</strong>
            </div>
          ) : null}

          {diagnostic ? <LiffDiagnosticPanel diagnostic={diagnostic} /> : null}
        </Card>
      </section>
    </main>
  );

  if (!themeModuleConfig) {
    return bridgeContent;
  }

  return (
    <ModuleThemeBoundary
      moduleConfig={themeModuleConfig}
      surface="unlock"
      initialTheme={initialTheme}
    >
      {bridgeContent}
    </ModuleThemeBoundary>
  );
}

function buildInitialDiagnostic(
  context: ReturnType<typeof parseLineFulfillmentContext>,
) {
  const search = getRuntimeSearch();

  if (!isLiffDebugEnabled(search)) {
    return null;
  }

  return buildLiffDiagnosticSnapshot({
    pathname: getRuntimePathname(),
    search,
    context,
    allowlistedModuleSlugs: listModules().map((moduleConfig) => moduleConfig.slug),
  });
}

function updateDiagnostic(input: {
  setDiagnostic: (value: LiffDiagnosticSnapshot | null) => void;
  context: ReturnType<typeof parseLineFulfillmentContext>;
  bindAttemptStatus: LiffBindAttemptStatus;
  bindResponseTarget?: string | null;
  navigationMethod?: string;
  lastSafeErrorCode?: string | null;
}) {
  const search = getRuntimeSearch();

  if (!isLiffDebugEnabled(search)) {
    return;
  }

  input.setDiagnostic(
    buildLiffDiagnosticSnapshot({
      pathname: getRuntimePathname(),
      search,
      context: input.context,
      allowlistedModuleSlugs: listModules().map((moduleConfig) => moduleConfig.slug),
      bindAttemptStatus: input.bindAttemptStatus,
      bindResponseTarget: input.bindResponseTarget,
      navigationMethod: input.navigationMethod,
      lastSafeErrorCode: input.lastSafeErrorCode,
    }),
  );
}

function getRuntimeSearch() {
  if (typeof window !== "undefined") {
    return window.location.search;
  }

  return "";
}

function getRuntimePathname() {
  if (typeof window !== "undefined") {
    return window.location.pathname;
  }

  return "/line/fulfill";
}

function LiffDiagnosticPanel({ diagnostic }: { diagnostic: LiffDiagnosticSnapshot }) {
  const rows: Array<[string, string]> = [
    ["currentPathname", diagnostic.currentPathname],
    ["searchParamKeys", diagnostic.searchParamKeys.join(",") || "none"],
    ["contextSource", diagnostic.contextSource],
    ["hasModuleSlug", String(diagnostic.hasModuleSlug)],
    ["moduleSlug", diagnostic.moduleSlug ?? "none"],
    ["hasUnlockIntentId", String(diagnostic.hasUnlockIntentId)],
    ["hasUnlockToken", String(diagnostic.hasUnlockToken)],
    ["hasFallbackCode", String(diagnostic.hasFallbackCode)],
    ["bindAttemptStatus", diagnostic.bindAttemptStatus],
    ["bindResponseHasUnlockedPath", String(diagnostic.bindResponseHasUnlockedPath)],
    ["unlockedPathShape", diagnostic.unlockedPathShape ?? "none"],
    ["navigationMethod", diagnostic.navigationMethod],
    ["lastSafeErrorCode", diagnostic.lastSafeErrorCode ?? "none"],
  ];

  return (
    <div className="anyu-contact-code-box" data-liff-diagnostic="safe">
      <p className="anyu-kicker">LIFF diagnostic</p>
      <p className="anyu-subtle-note">
        Safe debug only. Do not share full browser URLs, tokens, LINE IDs, or private messages.
      </p>
      <dl className="anyu-diagnostic-list">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function normalizeUnlockRedirectTarget(target?: string) {
  if (!target) {
    return null;
  }

  try {
    const parsed = new URL(target, "https://anyu.tw");

    if (!parsed.pathname.match(/^\/m\/[^/]+\/unlock\/[^/]+$/)) {
      return null;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

function getFallbackMessage(params: ReturnType<typeof parseLineFulfillmentContext>) {
  const moduleConfig = getModuleBySlug(params.moduleSlug);

  if (!params.moduleSlug || !moduleConfig) {
    return "LINE 領取連結缺少有效測驗資料，請回到結果頁重新產生，或改用短碼。";
  }

  if (!params.unlockIntentId || !params.unlockToken) {
    return "LINE 自動帶入暫時不可用，請改用短碼。";
  }

  return null;
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
