import type { LineFulfillmentContext } from "@/lib/line/liff-context";

export type LiffContextSource = "direct_query" | "liff_state" | "legacy_state" | "missing";
export type LiffBindAttemptStatus = "not_started" | "pending" | "success" | "failed";

export type LiffDiagnosticSnapshot = {
  currentPathname: string;
  searchParamKeys: string[];
  contextSource: LiffContextSource;
  hasModuleSlug: boolean;
  moduleSlug: string | null;
  hasUnlockIntentId: boolean;
  hasUnlockToken: boolean;
  hasFallbackCode: boolean;
  bindAttemptStatus: LiffBindAttemptStatus;
  bindResponseHasUnlockedPath: boolean;
  unlockedPathShape: string | null;
  navigationMethod: string;
  lastSafeErrorCode: string | null;
};

export function isLiffDebugEnabled(search: string) {
  const params = new URLSearchParams(normalizeSearch(search));

  return params.get("debug") === "1";
}

export function buildLiffDiagnosticSnapshot(input: {
  pathname: string;
  search: string;
  context: LineFulfillmentContext;
  allowlistedModuleSlugs: readonly string[];
  bindAttemptStatus?: LiffBindAttemptStatus;
  bindResponseTarget?: string | null;
  navigationMethod?: string;
  lastSafeErrorCode?: string | null;
}): LiffDiagnosticSnapshot {
  const params = new URLSearchParams(normalizeSearch(input.search));
  const allowedModuleSlug = input.allowlistedModuleSlugs.includes(input.context.moduleSlug)
    ? input.context.moduleSlug
    : null;

  return {
    currentPathname: safePathname(input.pathname),
    searchParamKeys: Array.from(params.keys()).sort(),
    contextSource: getContextSource({ context: input.context, searchParams: params }),
    hasModuleSlug: Boolean(input.context.moduleSlug),
    moduleSlug: allowedModuleSlug,
    hasUnlockIntentId: Boolean(input.context.unlockIntentId),
    hasUnlockToken: Boolean(input.context.unlockToken),
    hasFallbackCode: Boolean(input.context.code),
    bindAttemptStatus: input.bindAttemptStatus ?? "not_started",
    bindResponseHasUnlockedPath: Boolean(input.bindResponseTarget),
    unlockedPathShape: getUnlockedPathShape(input.bindResponseTarget),
    navigationMethod: input.navigationMethod ?? "not_started",
    lastSafeErrorCode: input.lastSafeErrorCode ?? null,
  };
}

function normalizeSearch(search: string) {
  return search.startsWith("?") ? search.slice(1) : search;
}

function safePathname(pathname: string) {
  try {
    return new URL(pathname, "https://anyu.tw").pathname;
  } catch {
    return "/";
  }
}

function getContextSource(input: {
  context: LineFulfillmentContext;
  searchParams: URLSearchParams;
}): LiffContextSource {
  if (!input.context.moduleSlug && !input.context.unlockIntentId && !input.context.unlockToken) {
    return "missing";
  }

  const state = input.searchParams.get("liff.state");

  if (state?.includes("/m/")) {
    return "legacy_state";
  }

  if (state) {
    return "liff_state";
  }

  return "direct_query";
}

function getUnlockedPathShape(target?: string | null) {
  if (!target) {
    return null;
  }

  try {
    const parsed = new URL(target, "https://anyu.tw");

    if (!parsed.pathname.match(/^\/m\/[^/]+\/unlock\/[^/]+$/)) {
      return null;
    }

    return "/m/:moduleSlug/unlock/:token";
  } catch {
    return null;
  }
}
