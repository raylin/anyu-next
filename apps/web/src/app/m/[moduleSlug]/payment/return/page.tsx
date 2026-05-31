import { LegalFooter } from "@/components/anyu/LegalFooter";
import { ModuleThemeBoundary } from "@/components/modules/ai-temperature/ModuleThemeFrame";
import { PaymentReturnPoller } from "@/components/modules/ai-temperature/PaymentReturnPoller";
import { isDbConfigured } from "@/lib/db/client";
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
}: {
  moduleConfig: NonNullable<ReturnType<typeof getModuleBySlug>>;
  checkoutToken?: string | null;
  state?: string | null;
  accessPath?: string | null;
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

  return (
    <ReturnShell
      moduleConfig={moduleConfig}
      checkoutToken={checkoutToken}
      state={handoff.state}
      accessPath={handoff.accessPath}
    />
  );
}
