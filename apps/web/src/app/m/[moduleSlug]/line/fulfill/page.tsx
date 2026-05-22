"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";
import { Wordmark } from "@/components/anyu/Wordmark";
import { getLineLiffId } from "@/lib/line/config";
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

export default function LineFulfillPage() {
  const [state, setState] = useState<BindState>("idle");
  const [message, setMessage] = useState("正在準備 LINE 領取流程…");
  const [unlockedUrl, setUnlockedUrl] = useState<string | null>(null);

  const params = useMemo(() => {
    if (typeof window === "undefined") {
      return { unlockIntentId: "", unlockToken: "", code: "" };
    }

    const searchParams = new URLSearchParams(window.location.search);
    return {
      unlockIntentId: searchParams.get("unlockIntentId") ?? "",
      unlockToken: searchParams.get("unlockToken") ?? "",
      code: searchParams.get("code") ?? "",
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function runLiffBind() {
      const liffId = getLineLiffId();

      if (!liffId || !params.unlockIntentId || !params.unlockToken) {
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
            unlockIntentId: params.unlockIntentId,
            unlockToken: params.unlockToken,
            idToken,
          }),
        });
        const payload = (await response.json()) as {
          ok: boolean;
          unlockedUrl?: string;
          message?: string;
        };

        if (cancelled) {
          return;
        }

        if (!response.ok || !payload.ok || !payload.unlockedUrl) {
          setState("fallback");
          setMessage(payload.message ?? "LINE 自動領取失敗，請改用短碼。");
          return;
        }

        setUnlockedUrl(payload.unlockedUrl);
        setState("success");
        window.location.href = payload.unlockedUrl;
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
  }, [params]);

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

          {state === "success" && unlockedUrl ? (
            <Button type="button" className="anyu-button-block" onClick={() => {
              window.location.href = unlockedUrl;
            }}>
              打開完整分析
            </Button>
          ) : null}

          {state === "fallback" || state === "error" ? (
            <div className="anyu-contact-code-box">
              <p className="anyu-subtle-note">{LINE_FULFILLMENT_FALLBACK_INTRO}</p>
              <strong>{params.code || "請回到結果頁重新產生"}</strong>
            </div>
          ) : null}
        </Card>
      </section>
    </main>
  );
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
