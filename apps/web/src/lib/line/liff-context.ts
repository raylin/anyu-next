export type LineFulfillmentContext = {
  unlockIntentId: string;
  unlockToken: string;
  code: string;
  statePath: string | null;
};

export function parseLineFulfillmentContext(search: string): LineFulfillmentContext {
  const searchParams = new URLSearchParams(normalizeSearch(search));
  const stateParams = parseLiffState(searchParams.get("liff.state"));

  return {
    unlockIntentId: searchParams.get("unlockIntentId") ?? stateParams.params.get("unlockIntentId") ?? "",
    unlockToken: searchParams.get("unlockToken") ?? stateParams.params.get("unlockToken") ?? "",
    code: searchParams.get("code") ?? stateParams.params.get("code") ?? "",
    statePath: stateParams.path,
  };
}

function normalizeSearch(search: string) {
  return search.startsWith("?") ? search.slice(1) : search;
}

function parseLiffState(state: string | null): { params: URLSearchParams; path: string | null } {
  if (!state) {
    return { params: new URLSearchParams(), path: null };
  }

  try {
    const stateUrl = state.startsWith("http")
      ? new URL(state)
      : new URL(state.startsWith("/") ? state : `?${normalizeSearch(state)}`, "https://anyu.tw");

    return {
      params: stateUrl.searchParams,
      path: stateUrl.pathname === "/" ? null : stateUrl.pathname,
    };
  } catch {
    return { params: new URLSearchParams(normalizeSearch(state)), path: null };
  }
}
