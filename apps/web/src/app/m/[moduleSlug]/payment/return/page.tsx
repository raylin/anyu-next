import { LegalFooter } from "@/components/anyu/LegalFooter";
import { ModuleThemeBoundary } from "@/components/modules/ai-temperature/ModuleThemeFrame";
import { PaymentReturnPoller } from "@/components/modules/ai-temperature/PaymentReturnPoller";
import { isDbConfigured } from "@/lib/db/client";
import {
  getPaymentRecoveryStatusSummary,
  type PaymentRecoveryStatusSummary,
} from "@/lib/db/payment-recovery-contacts";
import { getModuleBySlug } from "@/lib/modules/registry";
import { resolvePaymentAccessHandoff } from "@/lib/payments/payment-access-handoff";

type ReturnPageProps = {
  params: Promise<{
    moduleSlug: string;
  }>;
  searchParams: Promise<{
    merchantOrderNo?: string;
    checkoutToken?: string;
  }>;
};

function ReturnShell({
  moduleConfig,
  checkoutToken,
  state,
  accessPath,
  recoverySummary,
}: {
  moduleConfig: NonNullable<ReturnType<typeof getModuleBySlug>>;
  checkoutToken?: string | null;
  state?: string | null;
  accessPath?: string | null;
  recoverySummary?: PaymentRecoveryStatusSummary | null;
}) {
  return (
    <main className="anyu-shell">
      <ModuleThemeBoundary
        moduleConfig={moduleConfig}
        surface="unlock"
        showThemeToggle={false}
      >
        <section className="anyu-result-stack">
          <PaymentReturnPoller
            moduleSlug={moduleConfig.slug}
            checkoutToken={checkoutToken}
            initialStatus={state}
            initialAccessPath={accessPath}
            initialRecoverySummary={recoverySummary}
          />
          <LegalFooter />
        </section>
      </ModuleThemeBoundary>
    </main>
  );
}

export default async function NewebPayReturnPage({ params, searchParams }: ReturnPageProps) {
  const { moduleSlug } = await params;
  const { checkoutToken } = await searchParams;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig) {
    const fallbackModule = getModuleBySlug("ambiguous-temperature");

    return fallbackModule ? (
      <ReturnShell moduleConfig={fallbackModule} state="invalid_session" />
    ) : null;
  }

  if (!checkoutToken || !isDbConfigured()) {
    return <ReturnShell moduleConfig={moduleConfig} state="invalid_session" />;
  }

  const handoff = await resolvePaymentAccessHandoff({
    moduleSlug: moduleConfig.slug,
    checkoutToken,
  });

  if (!handoff.ok) {
    return (
      <ReturnShell
        moduleConfig={moduleConfig}
        checkoutToken={checkoutToken}
        state={handoff.state}
      />
    );
  }

  const recoverySummary =
    handoff.state === "paid_ready" && handoff.record
      ? await getPaymentRecoveryStatusSummary({
          moduleSlug: moduleConfig.slug,
          analysisResultId: handoff.record.result.id,
          paymentIntentId: handoff.paymentIntent.id,
          entitlementId: handoff.entitlement?.id ?? null,
        })
      : null;

  return (
    <ReturnShell
      moduleConfig={moduleConfig}
      checkoutToken={checkoutToken}
      state={handoff.state}
      accessPath={handoff.accessPath}
      recoverySummary={recoverySummary}
    />
  );
}
