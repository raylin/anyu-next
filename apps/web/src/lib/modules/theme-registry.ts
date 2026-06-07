import type { ProductModuleConfig } from "@/lib/modules/types";

export type AnyuThemeOwner = "core" | "module";
export type AnyuThemeId = "core" | "ai-temperature-riso";

export type AnyuThemeDefinition = {
  id: AnyuThemeId;
  owner: AnyuThemeOwner;
  label: string;
  moduleSlug?: string;
  moduleId?: string;
  visualModule?: string;
  cssClassName: string;
};

type ModuleThemeInput = Pick<ProductModuleConfig, "slug" | "moduleId" | "visualModule">;

export const CORE_THEME: AnyuThemeDefinition = {
  id: "core",
  owner: "core",
  label: "ANYU Core Shell",
  cssClassName: "anyu-core-shell",
};

export const AI_TEMPERATURE_RISO_THEME: AnyuThemeDefinition = {
  id: "ai-temperature-riso",
  owner: "module",
  label: "Module 01 Riso",
  moduleSlug: "ambiguous-temperature",
  moduleId: "ai-temperature",
  visualModule: "ai-temperature",
  cssClassName: "anyu-v2",
};

const MODULE_THEME_ALIASES = new Map<string, AnyuThemeDefinition>([
  ["ambiguous-temperature", AI_TEMPERATURE_RISO_THEME],
  ["ai-temperature", AI_TEMPERATURE_RISO_THEME],
]);

export function resolveThemeForModule(
  input?: ModuleThemeInput | string | null,
): AnyuThemeDefinition {
  if (!input) {
    return CORE_THEME;
  }

  if (typeof input === "string") {
    return MODULE_THEME_ALIASES.get(input) ?? CORE_THEME;
  }

  return (
    MODULE_THEME_ALIASES.get(input.slug) ??
    MODULE_THEME_ALIASES.get(input.moduleId) ??
    MODULE_THEME_ALIASES.get(input.visualModule) ??
    CORE_THEME
  );
}

export function isModuleTheme(theme: AnyuThemeDefinition) {
  return theme.owner === "module";
}
