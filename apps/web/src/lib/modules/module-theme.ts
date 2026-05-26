"use client";

export type ModuleThemeVariant = "classic" | "riso";
export type ModuleThemeSource = "ab_assigned" | "manual_override";

export type ModuleThemeState = {
  variant: ModuleThemeVariant;
  source: ModuleThemeSource;
  hydrated: boolean;
};

export const MODULE_THEME_VARIANT_STORAGE_KEY = "module01_theme_variant";
export const MODULE_THEME_SOURCE_STORAGE_KEY = "module01_theme_source";

const VALID_VARIANTS = new Set<ModuleThemeVariant>(["classic", "riso"]);
const VALID_SOURCES = new Set<ModuleThemeSource>(["ab_assigned", "manual_override"]);

export function isModuleThemeVariant(value: unknown): value is ModuleThemeVariant {
  return typeof value === "string" && VALID_VARIANTS.has(value as ModuleThemeVariant);
}

export function isModuleThemeSource(value: unknown): value is ModuleThemeSource {
  return typeof value === "string" && VALID_SOURCES.has(value as ModuleThemeSource);
}

export function assignModuleThemeVariant(randomValue = Math.random()): ModuleThemeVariant {
  return randomValue < 0.5 ? "classic" : "riso";
}

export function readModuleThemeState(storage: Pick<Storage, "getItem" | "setItem">): ModuleThemeState {
  const storedVariant = storage.getItem(MODULE_THEME_VARIANT_STORAGE_KEY);
  const storedSource = storage.getItem(MODULE_THEME_SOURCE_STORAGE_KEY);

  if (isModuleThemeVariant(storedVariant) && isModuleThemeSource(storedSource)) {
    return {
      variant: storedVariant,
      source: storedSource,
      hydrated: true,
    };
  }

  const assignedVariant = assignModuleThemeVariant();
  storage.setItem(MODULE_THEME_VARIANT_STORAGE_KEY, assignedVariant);
  storage.setItem(MODULE_THEME_SOURCE_STORAGE_KEY, "ab_assigned");

  return {
    variant: assignedVariant,
    source: "ab_assigned",
    hydrated: true,
  };
}

export function writeManualModuleThemeVariant(
  storage: Pick<Storage, "setItem">,
  variant: ModuleThemeVariant,
): ModuleThemeState {
  storage.setItem(MODULE_THEME_VARIANT_STORAGE_KEY, variant);
  storage.setItem(MODULE_THEME_SOURCE_STORAGE_KEY, "manual_override");

  return {
    variant,
    source: "manual_override",
    hydrated: true,
  };
}

export function getModuleThemeEventMetadata(state: Pick<ModuleThemeState, "variant" | "source">) {
  return {
    themeVariant: state.variant,
    themeSource: state.source,
  };
}
