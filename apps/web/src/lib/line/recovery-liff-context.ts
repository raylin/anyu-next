import { isSafeLineRecoveryReturnPath, LINE_RECOVERY_BIND_STATE_PREFIX } from "@/lib/line/recovery-bind-state";

export type LineRecoveryBindContext = {
  state: string;
  fallbackReturnPath: string | null;
  stateSource: "direct_query" | "liff_state" | "missing";
  isStateShapeValid: boolean;
};

export function parseLineRecoveryBindContext(search: string): LineRecoveryBindContext {
  const searchParams = new URLSearchParams(normalizeSearch(search));
  const stateParams = parseLiffState(searchParams.get("liff.state"));
  const directState = searchParams.get("state") ?? searchParams.get("rlb");
  const liffState = stateParams.params.get("state") ?? stateParams.params.get("rlb");
  const state = directState ?? liffState ?? "";
  const directReturnPath = searchParams.get("returnPath");
  const liffReturnPath = stateParams.params.get("returnPath");
  const fallbackReturnPath = getSafeFallbackReturnPath(directReturnPath ?? liffReturnPath);

  return {
    state,
    fallbackReturnPath,
    stateSource: directState ? "direct_query" : liffState ? "liff_state" : "missing",
    isStateShapeValid: isRecoveryBindStateShape(state),
  };
}

export function isRecoveryBindStateShape(state: string) {
  const candidate = state.trim();

  if (!candidate.startsWith(LINE_RECOVERY_BIND_STATE_PREFIX)) {
    return false;
  }

  if (/(^|[^A-Za-z0-9_-])(pa_|pcs_)[A-Za-z0-9_-]+/u.test(candidate)) {
    return false;
  }

  if (/unlockToken|fulfillmentCode|TradeInfo|TradeSha/iu.test(candidate)) {
    return false;
  }

  return true;
}

function getSafeFallbackReturnPath(returnPath: string | null) {
  if (!returnPath || !isSafeLineRecoveryReturnPath(returnPath)) {
    return null;
  }

  return returnPath;
}

function normalizeSearch(search: string) {
  return search.startsWith("?") ? search.slice(1) : search;
}

function parseLiffState(state: string | null): { params: URLSearchParams } {
  if (!state) {
    return { params: new URLSearchParams() };
  }

  try {
    const stateUrl = state.startsWith("http")
      ? new URL(state)
      : new URL(state.startsWith("/") ? state : `?${normalizeSearch(state)}`, "https://anyu.tw");

    return { params: stateUrl.searchParams };
  } catch {
    return { params: new URLSearchParams(normalizeSearch(state)) };
  }
}
