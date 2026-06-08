import { LineFulfillBridge } from "@/components/line/LineFulfillBridge";
import { LineFulfillServerDiagnostic } from "@/components/line/LineFulfillServerDiagnostic";
import { LineRecoveryBindBridge } from "@/components/line/LineRecoveryBindBridge";
import { ModuleThemeBoundary } from "@/components/modules/ai-temperature/ModuleThemeFrame";
import { getModuleBySlug } from "@/lib/modules/registry";
import { parseLineRecoveryBindContext } from "@/lib/line/recovery-liff-context";

type RouteParams = Promise<{ moduleSlug?: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ModuleLineFulfillPage({
  params,
  searchParams,
}: {
  params: RouteParams;
  searchParams: SearchParams;
}) {
  const routeParams = await params;
  const resolvedSearchParams = await searchParams;
  const initialSearch = toSearchString(resolvedSearchParams);
  const recoveryContext = parseLineRecoveryBindContext(initialSearch);

  if (recoveryContext.state) {
    const moduleConfig =
      getModuleBySlug(routeParams.moduleSlug ?? "") ?? getModuleBySlug("ambiguous-temperature");

    if (!moduleConfig) {
      return <LineRecoveryBindBridge initialSearch={initialSearch} />;
    }

    return (
      <main className="anyu-shell">
        <ModuleThemeBoundary moduleConfig={moduleConfig} surface="unlock" showThemeToggle={false}>
          <LineRecoveryBindBridge initialSearch={initialSearch} />
        </ModuleThemeBoundary>
      </main>
    );
  }

  return (
    <>
      <LineFulfillBridge
        defaultModuleSlug={routeParams.moduleSlug}
        initialSearch={initialSearch}
      />
      <LineFulfillServerDiagnostic searchParams={resolvedSearchParams} />
    </>
  );
}

function toSearchString(input: Record<string, string | string[] | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item);
      }
      continue;
    }

    if (typeof value === "string") {
      searchParams.set(key, value);
    }
  }

  return searchParams.toString();
}
