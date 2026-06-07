import {
  getModuleThemeFromSearchParams,
  getModuleThemeFromUnlockToken,
  MODULE_01_RISO_THEME_STATE,
  normalizeModuleThemeSource,
  normalizeModuleThemeVariant,
  type ModuleThemeState,
  type ModuleThemeSource,
  type ModuleThemeVariant,
} from "@/lib/modules/module-theme";

export type LineFulfillmentContext = {
  moduleSlug: string;
  unlockIntentId: string;
  unlockToken: string;
  code: string;
  statePath: string | null;
  themeVariant: ModuleThemeVariant | null;
  themeSource: ModuleThemeSource;
};

export function parseLineFulfillmentContext(
  search: string,
  input?: { defaultModuleSlug?: string | null },
): LineFulfillmentContext {
  const searchParams = new URLSearchParams(normalizeSearch(search));
  const stateParams = parseLiffState(searchParams.get("liff.state"));
  const directModuleSlug = searchParams.get("moduleSlug") ?? searchParams.get("module");
  const stateModuleSlug = stateParams.params.get("moduleSlug") ?? stateParams.params.get("module");
  const pathModuleSlug = extractModuleSlugFromPath(stateParams.path);
  const unlockToken = searchParams.get("unlockToken") ?? stateParams.params.get("unlockToken") ?? "";
  const themeFromDirect = getModuleThemeFromSearchParams(searchParams);
  const themeFromState = getModuleThemeFromSearchParams(stateParams.params);
  const themeFromToken = getModuleThemeFromUnlockToken(unlockToken);
  const themeVariant =
    themeFromDirect?.variant ??
    themeFromState?.variant ??
    themeFromToken?.variant ??
    normalizeModuleThemeVariant(searchParams.get("themeVariant")) ??
    normalizeModuleThemeVariant(stateParams.params.get("themeVariant"));
  const themeSource = normalizeModuleThemeSource(
    themeFromDirect?.source ??
      themeFromState?.source ??
      themeFromToken?.source ??
      searchParams.get("themeSource") ??
      stateParams.params.get("themeSource"),
  );

  return {
    moduleSlug:
      directModuleSlug ?? stateModuleSlug ?? pathModuleSlug ?? input?.defaultModuleSlug?.trim() ?? "",
    unlockIntentId: searchParams.get("unlockIntentId") ?? stateParams.params.get("unlockIntentId") ?? "",
    unlockToken,
    code: searchParams.get("code") ?? stateParams.params.get("code") ?? "",
    statePath: stateParams.path,
    themeVariant,
    themeSource,
  };
}

export function getModuleThemeFromLineFulfillmentContext(
  context: Pick<LineFulfillmentContext, "themeVariant" | "themeSource">,
): ModuleThemeState | null {
  if (!context.themeVariant) {
    return null;
  }

  return {
    ...MODULE_01_RISO_THEME_STATE,
    variant: context.themeVariant,
    source: normalizeModuleThemeSource(context.themeSource),
    hydrated: true,
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

function extractModuleSlugFromPath(path: string | null): string | null {
  if (!path) {
    return null;
  }

  const match = path.match(/^\/m\/([^/]+)\/line\/fulfill\/?$/);
  return match?.[1] ?? null;
}
