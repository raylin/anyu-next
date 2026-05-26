"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";
import { Wordmark } from "@/components/anyu/Wordmark";
import { getLineLiffId } from "@/lib/line/config";
import { parseLineFulfillmentContext } from "@/lib/line/liff-context";
import { getModuleBySlug } from "@/lib/modules/registry";
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
  initialSearch = "",
}: {
  defaultModuleSlug?: string;
  initialSearch?: string;
}) {
  const initialParams = useMemo(() => {
    if (initialSearch) {
      return parseLineFulfillmentContext(initialSearch, { defaultModuleSlug });
    }

    if (typeof window === "undefined") {
      return parseLineFulfillmentContext("", { defaultModuleSlug });
    }

    return parseLineFulfillmentContext(window.location.search, { defaultModuleSlug });
  }, [defaultModuleSlug, initialSearch]);
  const initialFallbackMessage = getFallbackMessage(initialParams);
  const [state, setState] = useState<BindState>(initialFallbackMessage ? "fallback" : "idle");
  const [message, setMessage] = useState(initialFallbackMessage ?? "正在準備 LINE 領取流程…");
  const [unlockedPath, setUnlockedPath] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function runLiffBind() {
      const liffId = getLineLiffId();
      const moduleConfig = getModuleBySlug(initialParams.moduleSlug);
      const fallbackMessage = getFallbackMessage(initialParams);

      if (fallbackMessage || !moduleConfig) {
        setState("fallback");
        setMessage(fallbackMessage ?? "LINE 領取連結缺少有效測驗資料，請回到結果頁重新產生，或改用短碼。");
        return;
      }

      if (!liffId) {
        setState("fallback");
        setMessage("LINE 自動帶入暫時不可用，請改用短碼。");
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
        const response = await fetch("/api/line/fulfillment/bind-liff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleSlug: initialParams.moduleSlug,
            unlockIntentId: initialParams.unlockIntentId,
            unlockToken: initialParams.unlockToken,
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
          setState("fallback");
          setMessage(payload.message ?? "LINE 自動領取失敗，請改用短碼。");
          return;
        }

        setUnlockedPath(redirectTarget);
        setState("success");
        window.location.assign(redirectTarget);
      } catch {
        if (!cancelled) {
          setState("fallback");
          setMessage("LINE 自動領取失敗，請改用短碼。");
        }
      }
    }

    void runLiffBind();

    return () => {
      cancelled = true;
    };
  }, [initialParams]);

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
              <strong>{initialParams.code || "請回到結果頁重新產生"}</strong>
            </div>
          ) : null}
        </Card>
      </section>
    </main>
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
