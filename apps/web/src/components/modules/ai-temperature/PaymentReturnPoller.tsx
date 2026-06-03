"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnyuMark } from "@/components/anyu/AnyuMark";
import { Card } from "@/components/anyu/Card";
import { LEGAL_CONTACT_EMAIL } from "@/content/legal";

export type PaymentReturnStatus =
  | "waiting_for_payment"
  | "paid_processing"
  | "paid_ready"
  | "paid_failed"
  | "invalid_session"
  | "expired_session"
  | "unknown"
  | "timeout";

type PaymentReturnPollerProps = {
  moduleSlug: string;
  checkoutToken?: string | null;
  initialStatus?: string | null;
  initialAccessPath?: string | null;
  initialRecoverySummary?: PaymentRecoverySummary | null;
};

type PaymentRecoverySummary = {
  hasRecoveryContact: boolean;
  hasEmailRecovery: boolean;
  hasLineRecovery: boolean;
  emailStatus: "none" | "pending" | "verified" | "bound" | "failed" | "revoked";
  lineStatus: "none" | "pending" | "verified" | "bound" | "failed" | "revoked";
  transactionalConsentPresent: boolean;
  marketingOptInPresent: boolean;
  recommendedPostPaymentAction:
    | "none"
    | "confirm_saved"
    | "suggest_email_save"
    | "suggest_line_save_later"
    | "retry_email"
    | "add_backup";
  safeDisplayContact: {
    type: "email";
    maskedValue: string;
  } | null;
};

type PaymentStatusResponse =
  | {
      ok: true;
      status: string | null;
      retryable: boolean;
      errorCategory?: string | null;
      accessPath?: string | null;
      recoverySummary?: PaymentRecoverySummary | null;
    }
  | {
      ok: false;
      error: string;
      message: string;
    };

const PAYMENT_RETURN_POLL_INTERVAL_MS = 3_000;
const PAYMENT_RETURN_POLL_TIMEOUT_MS = 120_000;
const PROCESS_STEPS = [
  "等候藍新正式付款通知",
  "確認付款狀態",
  "整理完整報告",
  "準備安全查看連結",
] as const;

function normalizePaymentReturnStatus(status?: string | null): PaymentReturnStatus {
  switch (status) {
    case "waiting_for_payment":
    case "paid_processing":
    case "paid_ready":
    case "paid_failed":
    case "invalid_session":
    case "expired_session":
    case "timeout":
      return status;
    default:
      return "unknown";
  }
}

function getStateCopy(status: PaymentReturnStatus) {
  switch (status) {
    case "paid_processing":
      return {
        kicker: "payment confirmed",
        title: "完整報告生成中",
        body: "曖昧溫度計正在重新整理你的互動訊號，完成後會在此頁提供查看。",
        note: "AI 生成需要一點時間，這頁會自動更新。",
      };
    case "paid_ready":
      return {
        kicker: "complete analysis ready",
        title: "完整報告已準備好",
        body: "付款已確認，你的完整分析已準備好。",
        note: "請使用下方安全連結繼續查看。",
      };
    case "paid_failed":
      return {
        kicker: "support needed",
        title: "報告暫時無法完成",
        body: "付款或報告產生流程可能遇到異常。我們可以協助補發或退款。",
        note: `請聯絡 ${LEGAL_CONTACT_EMAIL}，我們會於 3–7 個工作天內回覆處理結果。`,
      };
    case "invalid_session":
    case "expired_session":
      return {
        kicker: "link unavailable",
        title: "這個付款狀態連結已失效",
        body: "這組付款狀態連結無效或已過期。若你已完成付款，請保留付款時間與訂單資訊聯絡客服協助確認。",
        note: `請聯絡 ${LEGAL_CONTACT_EMAIL}，我們會於 3–7 個工作天內回覆處理結果。`,
      };
    case "timeout":
      return {
        kicker: "still checking",
        title: "付款確認仍在進行",
        body: "我們還在等候金流或報告處理完成。你可以稍後回到這個頁面重新檢查。",
        note: `若付款已完成但結果長時間未出現，請來信 ${LEGAL_CONTACT_EMAIL}。`,
      };
    case "waiting_for_payment":
    case "unknown":
    default:
      return {
        kicker: "payment pending",
        title: "付款確認中",
        body: "我們正在等候藍新的正式付款通知。瀏覽器回到此頁不代表付款已完成，系統會在確認後自動更新。",
        note: "付款完成並確認後，暗語會開始整理你的完整報告。",
      };
  }
}

function isTerminalStatus(status: PaymentReturnStatus) {
  return (
    status === "paid_ready" ||
    status === "paid_failed" ||
    status === "invalid_session" ||
    status === "expired_session" ||
    status === "timeout"
  );
}

function PaymentReadyRecoveryReminder({
  recoverySummary,
}: {
  recoverySummary?: PaymentRecoverySummary | null;
}) {
  if (!recoverySummary) {
    return null;
  }

  if (recoverySummary.hasRecoveryContact) {
    return (
      <div className="anyu-recovery-confirmation" role="status">
        {recoverySummary.safeDisplayContact ? (
          <p>已保存查看連結：{recoverySummary.safeDisplayContact.maskedValue}</p>
        ) : (
          <p>這份完整分析已保存查看連結。</p>
        )}
      </div>
    );
  }

  if (recoverySummary.recommendedPostPaymentAction === "retry_email") {
    return (
      <div className="anyu-recovery-skip-warning" role="status">
        <p>查看連結暫時沒有保存成功，但不影響你查看完整報告。打開完整報告後可以再試一次。</p>
      </div>
    );
  }

  return (
    <div className="anyu-recovery-skip-warning" role="status">
      <p>建議先保存這份報告的專屬查看連結。你也可以先查看完整報告，再在報告頁保存。</p>
    </div>
  );
}

export function PaymentReturnPoller({
  moduleSlug,
  checkoutToken,
  initialStatus,
  initialAccessPath,
  initialRecoverySummary,
}: PaymentReturnPollerProps) {
  const [status, setStatus] = useState<PaymentReturnStatus>(
    normalizePaymentReturnStatus(initialStatus),
  );
  const [accessPath, setAccessPath] = useState(initialAccessPath ?? null);
  const [recoverySummary, setRecoverySummary] = useState<PaymentRecoverySummary | null>(
    initialRecoverySummary ?? null,
  );
  const [safeError, setSafeError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const stateCopy = getStateCopy(status);
  const activeStep = Math.min(PROCESS_STEPS.length - 1, Math.floor(elapsedMs / 18_000));
  const canPoll = Boolean(checkoutToken) && !isTerminalStatus(status);

  useEffect(() => {
    if (!canPoll || !checkoutToken) {
      return;
    }

    const startedAt = Date.now();
    let cancelled = false;
    let timeoutId: number | null = null;

    async function pollStatus() {
      if (Date.now() - startedAt > PAYMENT_RETURN_POLL_TIMEOUT_MS) {
        setStatus("timeout");
        setSafeError("付款狀態仍在確認中。你可以稍後回到此頁重新檢查。");
        return;
      }

      try {
        const response = await fetch(`/api/modules/${moduleSlug}/payment/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkoutToken }),
        });
        const data = (await response.json()) as PaymentStatusResponse;

        if (cancelled) {
          return;
        }

        if (!response.ok || !data.ok) {
          setSafeError(data.ok ? "付款狀態暫時讀取失敗，我們會再試一次。" : data.message);
          timeoutId = window.setTimeout(pollStatus, PAYMENT_RETURN_POLL_INTERVAL_MS);
          return;
        }

        const nextStatus = normalizePaymentReturnStatus(data.status);
        setStatus(nextStatus);
        setAccessPath(data.accessPath ?? null);
        setRecoverySummary(data.recoverySummary ?? null);
        setSafeError(null);

        if (!isTerminalStatus(nextStatus)) {
          timeoutId = window.setTimeout(pollStatus, PAYMENT_RETURN_POLL_INTERVAL_MS);
        }
      } catch {
        if (!cancelled) {
          setSafeError("付款狀態暫時讀取失敗，我們會再試一次。");
          timeoutId = window.setTimeout(pollStatus, PAYMENT_RETURN_POLL_INTERVAL_MS);
        }
      }
    }

    const elapsedInterval = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 1000);
    timeoutId = window.setTimeout(pollStatus, 800);

    return () => {
      cancelled = true;
      window.clearInterval(elapsedInterval);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [canPoll, checkoutToken, moduleSlug]);

  return (
    <Card className="anyu-paid-wait-card" aria-live="polite">
      <div className="anyu-paid-wait-mark" aria-hidden="true">
        <AnyuMark size={34} animated={!isTerminalStatus(status)} decorative />
      </div>
      <p className="anyu-kicker t-label-dim">{stateCopy.kicker}</p>
      <h1 className="anyu-section-title">{stateCopy.title}</h1>
      <p className="anyu-copy">{stateCopy.body}</p>
      <p className="anyu-subtle-note">{stateCopy.note}</p>

      {!isTerminalStatus(status) ? (
        <>
          <div className="anyu-paid-wait-bar" aria-hidden="true">
            <span />
          </div>
          <ol className="anyu-paid-wait-steps">
            {PROCESS_STEPS.map((step, index) => (
              <li
                key={step}
                className={index <= activeStep ? "anyu-paid-wait-step-active" : ""}
              >
                {step}
              </li>
            ))}
          </ol>
        </>
      ) : null}

      {safeError ? <p className="anyu-status-message anyu-status-message-error">{safeError}</p> : null}

      {status === "paid_ready" ? (
        <PaymentReadyRecoveryReminder recoverySummary={recoverySummary} />
      ) : null}

      {status === "paid_ready" && accessPath ? (
        <Link href={accessPath} className="anyu-button anyu-button-block">
          查看完整報告
        </Link>
      ) : null}

      <div className="anyu-paid-policy-actions">
        {status === "paid_failed" || status === "invalid_session" || status === "expired_session" || status === "timeout" ? (
          <>
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="anyu-storefront-link">
            聯絡 {LEGAL_CONTACT_EMAIL}
          </a>
          <Link href="/refund" className="anyu-storefront-link">
            查看退款政策
          </Link>
          </>
        ) : (
          <>
            <Link href="/refund" className="anyu-storefront-link">
              查看退款政策
            </Link>
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="anyu-storefront-link">
              聯絡 {LEGAL_CONTACT_EMAIL}
            </a>
          </>
        )}
      </div>

      <p className="anyu-subtle-note">
        若付款、連結或報告產生異常，請來信{" "}
        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>，我們會在 3–7 個工作天內回覆處理結果。
      </p>

      <Link href={`/m/${moduleSlug}`} className="anyu-back-link">
        回到曖昧溫度計
      </Link>
    </Card>
  );
}
