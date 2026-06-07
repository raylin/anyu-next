import { LineRecoveryBindBridge } from "@/components/line/LineRecoveryBindBridge";
import { ModuleThemeBoundary } from "@/components/modules/ai-temperature/ModuleThemeFrame";
import { getModuleBySlug } from "@/lib/modules/registry";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LineRecoveryBindPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const moduleConfig = getModuleBySlug("ambiguous-temperature");

  if (!moduleConfig) {
    return <LineRecoveryBindBridge initialSearch={toSearchString(resolvedSearchParams)} />;
  }

  return (
    <main className="anyu-shell">
      <ModuleThemeBoundary moduleConfig={moduleConfig} surface="unlock" showThemeToggle={false}>
        <LineRecoveryBindBridge initialSearch={toSearchString(resolvedSearchParams)} />
      </ModuleThemeBoundary>
    </main>
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
