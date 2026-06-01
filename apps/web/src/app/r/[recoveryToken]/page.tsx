import Link from "next/link";
import { Card } from "@/components/anyu/Card";
import { LegalFooter } from "@/components/anyu/LegalFooter";
import { Wordmark } from "@/components/anyu/Wordmark";
import { ModuleThemeBoundary } from "@/components/modules/ai-temperature/ModuleThemeFrame";
import { LEGAL_CONTACT_EMAIL } from "@/content/legal";
import { isDbConfigured } from "@/lib/db/client";
import { getPaymentRecoveryStatusSummary } from "@/lib/db/payment-recovery-contacts";
import { resolvePaidResultRecoveryLink } from "@/lib/db/paid-result-recovery-links";
import { getModuleBySlug } from "@/lib/modules/registry";
import { resolvePaidEntitlementAccess } from "@/lib/payments/paid-access-resolver";
import type { PaidAccessResolutionState } from "@/lib/payments/paid-access-resolver";
import { UnlockCompleted } from "@/app/m/[moduleSlug]/unlock/[unlockToken]/page";

type RecoveryLinkPageProps = {
  params: Promise<{
    recoveryToken: string;
  }>;
};

export default async function PaidResultRecoveryLinkPage({ params }: RecoveryLinkPageProps) {
  const { recoveryToken } = await params;

  if (!isDbConfigured()) {
    return <RecoveryLinkError message="完整報告找回服務尚未設定完成，請稍後再試。" />;
  }

  const recoveryLink = await resolvePaidResultRecoveryLink({
    rawToken: recoveryToken,
  });

  if (!recoveryLink.ok) {
    return <RecoveryLinkError message={getRecoveryLinkErrorMessage(recoveryLink.category)} />;
  }

  const paidAccess = await resolvePaidEntitlementAccess({
    moduleSlug: recoveryLink.link.moduleSlug,
    entitlement: recoveryLink.entitlement,
    accessKind: "paid_result_recovery_link",
  });

  if (!paidAccess.ok) {
    return <RecoveryLinkError message="這個找回連結暫時無法開啟完整報告，請聯絡客服協助。" />;
  }

  const moduleConfig = getModuleBySlug(paidAccess.moduleSlug);

  if (!moduleConfig) {
    return <RecoveryLinkError message="這個找回連結暫時無法開啟完整報告，請聯絡客服協助。" />;
  }

  const terminalMessage = getPaidAccessTerminalMessage(paidAccess.state);

  if (terminalMessage) {
    return <RecoveryLinkError moduleSlug={moduleConfig.slug} message={terminalMessage} />;
  }

  if (paidAccess.state !== "ready") {
    return (
      <RecoveryLinkProcessing
        moduleSlug={moduleConfig.slug}
        message="完整報告正在準備中。請稍後重新開啟這個找回連結，或聯絡客服協助確認付款狀態。"
      />
    );
  }

  const recoverySummary = await getPaymentRecoveryStatusSummary({
    moduleSlug: paidAccess.moduleSlug,
    analysisResultId: paidAccess.entitlement.analysisResultId,
    paymentIntentId: paidAccess.entitlement.paymentIntentId,
    entitlementId: paidAccess.entitlement.id,
  });

  return (
    <UnlockCompleted
      moduleConfig={moduleConfig}
      moduleSlug={paidAccess.moduleSlug}
      initialTheme={null}
      result={paidAccess.record.result.normalizedResultJson}
      storedPaidResult={paidAccess.storedPaidResult}
      anonymousSessionId={paidAccess.record.request.anonymousSessionId}
      scoreBucket={paidAccess.record.result.scoreBucket}
      resultCreatedAt={paidAccess.record.result.createdAt}
      themeCarryoverSource="recovery_link"
      recoverySummary={recoverySummary}
    />
  );
}

function RecoveryLinkError({
  moduleSlug,
  message,
}: {
  moduleSlug?: string;
  message: string;
}) {
  const fallbackModuleConfig = getModuleBySlug(moduleSlug ?? "ambiguous-temperature");

  if (!fallbackModuleConfig) {
    return null;
  }

  return (
    <main className="anyu-shell">
      <ModuleThemeBoundary
        moduleConfig={fallbackModuleConfig}
        surface="unlock"
        showThemeToggle={false}
      >
        <section className="anyu-result-stack">
          <div className="anyu-result-topbar">
            <Link href={moduleSlug ? `/m/${moduleSlug}` : "/"} className="anyu-back-link">
              ← 回到 ANYU
            </Link>
            <Wordmark showMark />
          </div>
          <Card>
            <p className="anyu-kicker">result recovery</p>
            <h1 className="anyu-section-title">這個找回連結暫時不能使用</h1>
            <p className="anyu-copy">{message}</p>
            <p className="anyu-subtle-note">
              若你已完成付款，請聯絡{" "}
              <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
              ，我們會於 3–7 個工作天內回覆處理結果。
            </p>
          </Card>
          <LegalFooter />
        </section>
      </ModuleThemeBoundary>
    </main>
  );
}

function RecoveryLinkProcessing({
  moduleSlug,
  message,
}: {
  moduleSlug: string;
  message: string;
}) {
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig) {
    return <RecoveryLinkError message="這個找回連結暫時無法開啟完整報告，請聯絡客服協助。" />;
  }

  return (
    <main className="anyu-shell">
      <ModuleThemeBoundary
        moduleConfig={moduleConfig}
        surface="unlock"
        showThemeToggle={false}
      >
        <section className="anyu-result-stack">
          <div className="anyu-result-topbar">
            <Link href={`/m/${moduleSlug}`} className="anyu-back-link">
              ← 回到測驗
            </Link>
            <Wordmark showMark />
          </div>
          <Card>
            <p className="anyu-kicker">result recovery</p>
            <h1 className="anyu-section-title">完整報告確認中</h1>
            <p className="anyu-copy">{message}</p>
            <p className="anyu-subtle-note">
              瀏覽器開啟找回連結不代表付款狀態會被更改；完整報告仍以付款確認與網頁狀態為準。
            </p>
          </Card>
          <LegalFooter />
        </section>
      </ModuleThemeBoundary>
    </main>
  );
}

function getRecoveryLinkErrorMessage(category: Exclude<
  Awaited<ReturnType<typeof resolvePaidResultRecoveryLink>>,
  { ok: true }
>["category"]) {
  switch (category) {
    case "expired":
      return "這個找回連結已超過可使用期限。";
    case "revoked":
      return "這個找回連結目前已停止使用。";
    case "failed":
      return "這個找回連結目前無法使用。";
    case "config_unavailable":
      return "完整報告找回服務尚未設定完成，請稍後再試。";
    case "entitlement_inactive":
      return "這份完整報告的付款權限目前無法使用。";
    case "invalid_token":
    case "not_found":
    case "entitlement_missing":
      return "這個找回連結已失效或無法使用。";
  }
}

function getPaidAccessTerminalMessage(state: PaidAccessResolutionState) {
  switch (state) {
    case "expired":
      return "這份完整報告的存取期限已過。";
    case "revoked":
      return "這份完整報告的存取權目前已停止使用。";
    case "refunded":
      return "這份完整報告已因退款而停止使用。";
    case "failed":
      return "報告暫時無法完成。";
    default:
      return null;
  }
}
