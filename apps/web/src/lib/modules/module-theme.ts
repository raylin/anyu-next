import { AI_TEMPERATURE_RISO_THEME, CORE_THEME, resolveThemeForModule } from "@/lib/modules/theme-registry";
import type { ProductModuleConfig } from "@/lib/modules/types";

export type ModuleThemeVariant = "riso";
export type ModuleThemeSource =
  | "module_default"
  | "query_hint"
  | "legacy_hint"
  | "unknown"
  | "ab_assigned"
  | "manual_override";

export type ModuleThemeState = {
  variant: ModuleThemeVariant;
  source: ModuleThemeSource;
  hydrated: boolean;
  themeId: "ai-temperature-riso";
};

export const MODULE_THEME_VARIANT_STORAGE_KEY = "module01_theme_variant";
export const MODULE_THEME_SOURCE_STORAGE_KEY = "module01_theme_source";

export const MODULE_01_RISO_THEME_STATE: ModuleThemeState = {
  variant: "riso",
  source: "module_default",
  hydrated: true,
  themeId: "ai-temperature-riso",
};

const LEGACY_THEME_SOURCES = new Set(["ab_assigned", "manual_override"]);
const CANONICAL_THEME_SOURCES = new Set<ModuleThemeSource>([
  "module_default",
  "query_hint",
  "legacy_hint",
  "unknown",
]);

export function isModuleThemeVariant(value: unknown): value is ModuleThemeVariant {
  return value === "riso";
}

function isLegacyModuleThemeVariant(value: unknown) {
  return value === "classic";
}

export function isModuleThemeSource(value: unknown): value is ModuleThemeSource {
  return typeof value === "string" && CANONICAL_THEME_SOURCES.has(value as ModuleThemeSource);
}

export function normalizeModuleThemeVariant(value: unknown): ModuleThemeVariant | null {
  if (isModuleThemeVariant(value) || isLegacyModuleThemeVariant(value)) {
    return "riso";
  }

  return null;
}

export function normalizeModuleThemeSource(value: unknown): ModuleThemeSource {
  if (isModuleThemeSource(value)) {
    return value;
  }

  if (typeof value === "string" && LEGACY_THEME_SOURCES.has(value)) {
    return "legacy_hint";
  }

  return "unknown";
}

export function resolveModuleThemeState(
  moduleConfig?: Pick<ProductModuleConfig, "slug" | "moduleId" | "visualModule"> | string | null,
  initialTheme?: ModuleThemeState | null,
): ModuleThemeState {
  const theme = resolveThemeForModule(moduleConfig ?? null);

  if (theme.id !== AI_TEMPERATURE_RISO_THEME.id) {
    return {
      ...MODULE_01_RISO_THEME_STATE,
      source: CORE_THEME.id === theme.id ? "unknown" : "module_default",
    };
  }

  return {
    ...MODULE_01_RISO_THEME_STATE,
    source: initialTheme?.source ?? "module_default",
  };
}

export function assignModuleThemeVariant(): ModuleThemeVariant {
  return "riso";
}

export function readModuleThemeState(): ModuleThemeState {
  return MODULE_01_RISO_THEME_STATE;
}

export function writeManualModuleThemeVariant(): ModuleThemeState {
  return MODULE_01_RISO_THEME_STATE;
}

export function getModuleThemeEventMetadata(state: Pick<ModuleThemeState, "variant" | "source">) {
  return {
    themeVariant: "riso",
    themeSource: normalizeModuleThemeSource(state.source),
  };
}

export function getModuleThemeFromSearchParams(searchParams: URLSearchParams): ModuleThemeState | null {
  const variant =
    normalizeModuleThemeVariant(searchParams.get("themeVariant")) ??
    normalizeModuleThemeVariant(searchParams.get("theme"));

  if (!variant) {
    return null;
  }

  return {
    ...MODULE_01_RISO_THEME_STATE,
    source: normalizeModuleThemeSource(searchParams.get("themeSource") ?? "query_hint"),
  };
}

export function appendModuleThemeToSearchParams(
  searchParams: URLSearchParams,
  theme?: Pick<ModuleThemeState, "variant" | "source"> | null,
) {
  if (!theme) {
    return;
  }

  searchParams.set("themeVariant", "riso");
  searchParams.set("themeSource", normalizeModuleThemeSource(theme.source));
}

export function encodeModuleThemeInUnlockToken(
  unlockToken: string,
  variant?: ModuleThemeVariant | "classic" | null,
) {
  if (!variant) {
    return unlockToken;
  }

  return `${unlockToken}.r`;
}

export function getModuleThemeFromUnlockToken(unlockToken: string): ModuleThemeState | null {
  const suffix = unlockToken.split(".").at(-1);

  if (suffix !== "r" && suffix !== "c") {
    return null;
  }

  return {
    ...MODULE_01_RISO_THEME_STATE,
    source: suffix === "c" ? "legacy_hint" : "query_hint",
  };
}
