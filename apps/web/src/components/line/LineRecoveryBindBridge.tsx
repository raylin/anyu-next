"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";
import { Wordmark } from "@/components/anyu/Wordmark";
import { getLineLiffId } from "@/lib/line/config";
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
  const initialFallback = getInitialFallbackMessage(context);
  const [state, setState] = useState<RecoveryBindState>(initialFallback ? "fallback" : "idle");
  const [message, setMessage] = useState(
    initialFallback ?? "正在準備 LINE 保存流程。之後可以透過 LINE 協助找回。",
  );
  const [returnPath, setReturnPath] = useState<string | null>(context.fallbackReturnPath);

  useEffect(() => {
    let cancelled = false;

    async function bindRecoveryLine() {
      const fallback = getInitialFallbackMessage(context);

      if (fallback) {
        setState("fallback");
        setMessage(fallback);
        return;
      }

      const liffId = getLineLiffId();

      if (!liffId) {
        setState("fallback");
        setMessage("LINE 保存暫時無法啟動。你可以回到原頁，改用 Email 保存這份報告。");
        return;
      }

      setState("loading");

      try {
        await loadLiffSdk();
        await window.liff?.init({ liffId });

        if (!window.liff?.isLoggedIn()) {
          window.liff?.login({ redirectUri: window.location.href });
          return;
        }

        const idToken = window.liff.getIDToken();

        if (!idToken) {
          setState("fallback");
          setMessage("LINE 身分確認沒有完成。你可以回到原頁，改用 Email 保存這份報告。");
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
          setState("fallback");
          setMessage(getBindFailureMessage(payload.ok ? "bind_failed" : payload.error));
          return;
        }

        setState("success");
        setMessage("已用 LINE 保存這份報告。之後可以透過 LINE 協助找回。");

        if (payload.returnPath) {
          window.location.assign(payload.returnPath);
        }
      } catch {
        if (!cancelled) {
          setState("fallback");
          setMessage("LINE 綁定失敗也不影響付款或查看報告。你可以回到原頁，改用 Email 保存。");
        }
      }
    }

    void bindRecoveryLine();

    return () => {
      cancelled = true;
    };
  }, [context]);

  return (
    <main className="anyu-shell">
      <section className="anyu-result-stack">
        <div className="anyu-result-topbar">
          <Link href="/m/ambiguous-temperature" className="anyu-back-link">
            ← 回到測驗
          </Link>
          <Wordmark showMark />
        </div>

        <Card>
          <p className="anyu-kicker">LINE recovery</p>
          <h1 className="anyu-section-title">用 LINE 保存這份報告</h1>
          <p className="anyu-copy">{message}</p>
          <p className="anyu-subtle-note">
            LINE 只作為找回、完成通知與客服輔助；完整報告仍以網頁查看為準。
          </p>

          {state === "loading" ? (
            <p className="anyu-status-message" role="status">
              正在確認 LINE 身分…
            </p>
          ) : null}

          {state === "success" ? (
            <p className="anyu-recovery-confirmation" role="status">
              LINE 保存成功。正在回到原本的報告頁。
            </p>
          ) : null}

          {state === "fallback" ? (
            <div className="anyu-contact-code-box">
              <p className="anyu-subtle-note">
                請在 LINE 中開啟此頁，或回到原頁改用 Email 保存。LINE 綁定失敗也不影響付款或查看報告。
              </p>
              {returnPath ? (
                <Link href={returnPath} className="anyu-button anyu-button-block">
                  回到原本頁面
                </Link>
              ) : (
                <Link href="/m/ambiguous-temperature" className="anyu-button anyu-button-block">
                  回到曖昧溫度計
                </Link>
              )}
            </div>
          ) : null}

          {state === "success" && returnPath ? (
            <Button
              type="button"
              className="anyu-button-block"
              onClick={() => {
                window.location.assign(returnPath);
              }}
            >
              回到報告頁
            </Button>
          ) : null}
        </Card>
      </section>
    </main>
  );
}

function getInitialFallbackMessage(context: ReturnType<typeof parseLineRecoveryBindContext>) {
  if (!context.state) {
    return "缺少 LINE 保存狀態。請回到原頁，改用 Email 保存這份報告。";
  }

  if (!context.isStateShapeValid) {
    return "這個 LINE 保存連結已失效。請回到原頁，改用 Email 保存。";
  }

  return null;
}

function getBindFailureMessage(error: string) {
  switch (error) {
    case "state_expired":
      return "這個 LINE 保存連結已過期。請回到原頁重新開始，或改用 Email 保存。";
    case "line_user_missing":
      return "LINE 身分確認沒有完成。你可以回到原頁，改用 Email 保存這份報告。";
    default:
      return "LINE 綁定失敗也不影響付款或查看報告。你可以回到原頁，改用 Email 保存。";
  }
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
