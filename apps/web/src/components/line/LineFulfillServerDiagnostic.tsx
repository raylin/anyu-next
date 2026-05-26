import { Card } from "@/components/anyu/Card";
import { listModules } from "@/lib/modules/registry";

type SearchParams = Record<string, string | string[] | undefined>;

export function LineFulfillServerDiagnostic({ searchParams }: { searchParams: SearchParams }) {
  if (getFirst(searchParams.debug) !== "1") {
    return null;
  }

  const keys = Object.keys(searchParams).sort();
  const moduleSlug = getFirst(searchParams.moduleSlug);
  const allowlistedModuleSlug = listModules().some((moduleConfig) => moduleConfig.slug === moduleSlug)
    ? moduleSlug ?? "none"
    : "none";
  const hasAnyContext =
    Boolean(moduleSlug) ||
    Boolean(searchParams.unlockIntentId) ||
    Boolean(searchParams.unlockToken) ||
    Boolean(searchParams.code) ||
    Boolean(searchParams["liff.state"]);
  const contextSource = searchParams["liff.state"]
    ? "liff_state"
    : hasAnyContext
      ? "direct_query"
      : "missing";

  const rows: Array<[string, string]> = [
    ["currentPathname", "/line/fulfill"],
    ["searchParamKeys", keys.join(",") || "none"],
    ["contextSource", contextSource],
    ["hasModuleSlug", String(Boolean(moduleSlug))],
    ["moduleSlug", allowlistedModuleSlug],
    ["hasUnlockIntentId", String(Boolean(searchParams.unlockIntentId))],
    ["hasUnlockToken", String(Boolean(searchParams.unlockToken))],
    ["hasFallbackCode", String(Boolean(searchParams.code))],
    ["bindAttemptStatus", "not_started"],
    ["bindResponseHasUnlockedPath", "false"],
    ["unlockedPathShape", "none"],
    ["navigationMethod", "not_started"],
    ["lastSafeErrorCode", "none"],
  ];

  return (
    <Card>
      <div className="anyu-contact-code-box" data-liff-diagnostic="safe">
        <p className="anyu-kicker">LIFF diagnostic</p>
        <p className="anyu-subtle-note">
          Safe debug only. Do not share full browser URLs, tokens, LINE IDs, or private messages.
        </p>
        <dl className="anyu-diagnostic-list">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}

function getFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
