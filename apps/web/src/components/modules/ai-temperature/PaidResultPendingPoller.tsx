"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnyuMark } from "@/components/anyu/AnyuMark";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";
import { LEGAL_CONTACT_EMAIL } from "@/content/legal";

type PaidResultPendingPollerProps = {
  moduleSlug: string;
  unlockToken: string;
  initialStatus: "missing" | "pending" | "processing" | "failed";
};

type PaidResultClientStatus = PaidResultPendingPollerProps["initialStatus"] | "expired";

type PaidResultStatusResponse =
  | {
      ok: true;
      status: "missing" | "pending" | "processing" | "completed" | "failed" | "expired";
      retryable: boolean;
      errorCategory?: string | null;
    }
  | {
      ok: false;
      error: string;
      message: string;
    };

const PAID_RESULT_POLL_INTERVAL_MS = 3_000;
const PAID_RESULT_POLL_TIMEOUT_MS = 120_000;
const PENDING_STEPS = [
  "讀取你的互動線索",
  "整理對方可能的狀態",
  "產生可以直接使用的回覆句",
  "完成 48 小時觀察策略",
] as const;

export function PaidResultPendingPoller({
  moduleSlug,
  unlockToken,
  initialStatus,
}: PaidResultPendingPollerProps) {
  const router = useRouter();
  const [status, setStatus] = useState<PaidResultClientStatus>(initialStatus);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [safeError, setSafeError] = useState<string | null>(
    initialStatus === "failed" ? "完整分析暫時整理失敗。請稍後再打開這個連結。" : null,
  );
  const activeStep = useMemo(
    () => Math.min(PENDING_STEPS.length - 1, Math.floor(elapsedMs / 15_000)),
    [elapsedMs],
  );

  useEffect(() => {
    if (status === "failed") {
      return;
    }

    const startedAt = Date.now();
    let cancelled = false;
    let timeoutId: number | null = null;

    async function pollStatus() {
      if (Date.now() - startedAt > PAID_RESULT_POLL_TIMEOUT_MS) {
        setStatus("processing");
        setSafeError("完整分析還在整理中。你可以先離開，等一下再打開同一個連結。");
        return;
      }

      try {
        const response = await fetch(`/api/modules/${moduleSlug}/paid-result/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ unlockToken }),
        });
        const data = (await response.json()) as PaidResultStatusResponse;

        if (cancelled) {
          return;
        }

        if (!response.ok || !data.ok) {
          setSafeError(data.ok ? "完整分析狀態暫時讀取失敗。" : data.message);
          timeoutId = window.setTimeout(pollStatus, PAID_RESULT_POLL_INTERVAL_MS);
          return;
        }

        if (data.status === "completed") {
          router.refresh();
          return;
        }

        if (data.status === "failed" || data.status === "expired") {
          setStatus(data.status);
          setSafeError(
            data.status === "expired"
              ? "這組完整分析連結已過期，請回到結果頁重新領取。"
              : "完整分析暫時整理失敗。請稍後再打開這個連結。",
          );
          return;
        }

        setStatus(data.status);
        timeoutId = window.setTimeout(pollStatus, PAID_RESULT_POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) {
          setSafeError("完整分析狀態暫時讀取失敗，我們會再試一次。");
          timeoutId = window.setTimeout(pollStatus, PAID_RESULT_POLL_INTERVAL_MS);
        }
      }
    }

    const elapsedInterval = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 1000);
    timeoutId = window.setTimeout(pollStatus, 600);

    return () => {
      cancelled = true;
      window.clearInterval(elapsedInterval);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [moduleSlug, router, status, unlockToken]);

  return (
    <Card className="anyu-paid-wait-card" aria-live="polite">
      <div className="anyu-paid-wait-mark" aria-hidden="true">
        <AnyuMark size={34} animated decorative />
      </div>
      <p className="anyu-kicker t-label-dim">complete analysis</p>
      <h1 className="anyu-section-title">正在整理你的完整分析</h1>
      <p className="anyu-copy">
        我們正在把免費結果延伸成完整回覆策略，通常需要 30–60 秒。頁面會自動更新，不需要手動重新整理。
      </p>

      <div className="anyu-paid-wait-bar" aria-hidden="true">
        <span />
      </div>

      <ol className="anyu-paid-wait-steps">
        {PENDING_STEPS.map((step, index) => (
          <li
            key={step}
            className={index <= activeStep ? "anyu-paid-wait-step-active" : ""}
          >
            {step}
          </li>
        ))}
      </ol>

      {safeError ? <p className="anyu-status-message anyu-status-message-error">{safeError}</p> : null}
      {status === "failed" || status === "expired" ? (
        <p className="anyu-subtle-note">
          若付款已完成但報告無法查看，請來信{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>，我們可以協助補發或退款，並會在 3–7 個工作天內回覆處理結果。
        </p>
      ) : null}
      {status === "failed" || status === "expired" ? (
        <Button type="button" className="anyu-button-block" onClick={() => router.refresh()}>
          重新檢查完整分析
        </Button>
      ) : null}
    </Card>
  );
}
