import { Card } from "@/components/anyu/Card";
import { LegalFooter } from "@/components/anyu/LegalFooter";
import { ModuleThemeBoundary } from "@/components/modules/ai-temperature/ModuleThemeFrame";
import { LEGAL_CONTACT_EMAIL } from "@/content/legal";
import { isDbConfigured } from "@/lib/db/client";
import { getModuleBySlug } from "@/lib/modules/registry";
import { resolvePaymentAccessHandoff } from "@/lib/payments/payment-access-handoff";
import { UnlockCompleted } from "@/app/m/[moduleSlug]/unlock/[unlockToken]/page";

type PaymentAccessPageProps = {
  params: Promise<{
    moduleSlug: string;
  }>;
  searchParams: Promise<{
    checkoutToken?: string;
  }>;
};

function PaymentAccessFallback({
  moduleSlug,
  state,
}: {
  moduleSlug: string;
  state?: string | null;
}) {
  const moduleConfig = getModuleBySlug(moduleSlug) ?? getModuleBySlug("ambiguous-temperature");

  if (!moduleConfig) {
    return null;
  }

  return (
    <main className="anyu-shell">
      <ModuleThemeBoundary
        moduleConfig={moduleConfig}
        surface="unlock"
        showThemeToggle={false}
      >
        <section className="anyu-result-stack">
          <Card>
            <p className="anyu-kicker">Payment access</p>
            <h1 className="anyu-section-title">完整分析尚未可用</h1>
            {state ? <p className="anyu-copy">目前狀態：{state}</p> : null}
            <p className="anyu-copy">
              若你剛完成付款，請回到付款確認頁稍後重新整理，或保留付款時間與訂單資訊聯繫客服協助確認。
            </p>
            <p className="anyu-subtle-note">
              若付款、連結或報告產生異常，請來信{" "}
              <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>，我們會在 3–7 個工作天內回覆處理結果。
            </p>
          </Card>
          <LegalFooter />
        </section>
      </ModuleThemeBoundary>
    </main>
  );
}

export default async function PaymentAccessPage({
  params,
  searchParams,
}: PaymentAccessPageProps) {
  const { moduleSlug } = await params;
  const { checkoutToken } = await searchParams;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig || !checkoutToken || !isDbConfigured()) {
    return <PaymentAccessFallback moduleSlug={moduleSlug} />;
  }

  const handoff = await resolvePaymentAccessHandoff({
    moduleSlug: moduleConfig.slug,
    checkoutToken,
  });

  if (!handoff.ok || handoff.state !== "paid_ready" || !handoff.record) {
    return (
      <PaymentAccessFallback
        moduleSlug={moduleConfig.slug}
        state={handoff.ok ? handoff.state : handoff.state}
      />
    );
  }

  return (
    <UnlockCompleted
      moduleConfig={moduleConfig}
      moduleSlug={moduleConfig.slug}
      result={handoff.record.result.normalizedResultJson}
      storedPaidResult={handoff.storedPaidResult}
      anonymousSessionId={handoff.record.request.anonymousSessionId}
      scoreBucket={handoff.record.result.scoreBucket}
      resultCreatedAt={handoff.record.result.createdAt}
      themeCarryoverSource="payment_checkout_session"
    />
  );
}
