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
import { resolvePaymentCheckoutSessionToken } from "@/lib/payments/payment-checkout-session";

type ModuleConfig = NonNullable<ReturnType<typeof getModuleBySlug>>;

type NewebPayReturnExperienceProps = {
  checkoutToken?: string | null;
  moduleSlugHint?: string | null;
};

function getFallbackModule() {
  return getModuleBySlug("ambiguous-temperature");
}

function ReturnShell({
  moduleConfig,
  checkoutToken,
  state,
  accessPath,
  recoverySummary,
}: {
  moduleConfig: ModuleConfig;
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

function resolveModuleSlugFromSignedCheckoutToken(checkoutToken?: string | null) {
  if (!checkoutToken) {
    return null;
  }

  const session = resolvePaymentCheckoutSessionToken({ token: checkoutToken });

  return session.ok ? session.payload.moduleSlug : null;
}

export async function NewebPayReturnExperience({
  checkoutToken,
  moduleSlugHint,
}: NewebPayReturnExperienceProps) {
  const tokenModuleSlug = moduleSlugHint
    ? null
    : resolveModuleSlugFromSignedCheckoutToken(checkoutToken);
  const resolvedModuleSlug = moduleSlugHint ?? tokenModuleSlug;
  const moduleConfig = resolvedModuleSlug ? getModuleBySlug(resolvedModuleSlug) : null;
  const fallbackModule = getFallbackModule();
  const displayModule = moduleConfig ?? fallbackModule;

  if (!displayModule) {
    return null;
  }

  if (!moduleConfig || !checkoutToken || !isDbConfigured()) {
    return <ReturnShell moduleConfig={displayModule} state="invalid_session" />;
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
