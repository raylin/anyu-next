"use client";

import type { ReactNode } from "react";
import {
  resolveModuleThemeState,
  type ModuleThemeSource,
  type ModuleThemeState,
  type ModuleThemeVariant,
} from "@/lib/modules/module-theme";
import { resolveThemeForModule } from "@/lib/modules/theme-registry";
import type { ProductModuleConfig } from "@/lib/modules/types";

type ModuleThemeFrameProps = {
  moduleConfig: ProductModuleConfig;
  surface: "landing" | "result" | "unlock";
  children: (theme: {
    variant: ModuleThemeVariant;
    source: ModuleThemeSource;
    hydrated: boolean;
  }) => ReactNode;
};

export function useModuleThemeController(
  moduleConfig: ProductModuleConfig,
  initialTheme?: ModuleThemeState | null,
) {
  const theme = resolveModuleThemeState(moduleConfig, initialTheme);

  return { theme };
}

export function ModuleThemeFrame({ moduleConfig, surface, children }: ModuleThemeFrameProps) {
  const { theme } = useModuleThemeController(moduleConfig);

  return (
    <ModuleThemeShell moduleConfig={moduleConfig} surface={surface} theme={theme}>
      {children(theme)}
    </ModuleThemeShell>
  );
}

export function ModuleThemeBoundary({
  moduleConfig,
  surface,
  initialTheme,
  children,
}: {
  moduleConfig: ProductModuleConfig;
  surface: ModuleThemeFrameProps["surface"];
  initialTheme?: ModuleThemeState | null;
  showThemeToggle?: boolean;
  children: ReactNode;
}) {
  const { theme } = useModuleThemeController(moduleConfig, initialTheme);

  return (
    <ModuleThemeShell moduleConfig={moduleConfig} surface={surface} theme={theme}>
      {children}
    </ModuleThemeShell>
  );
}

type ModuleThemeShellProps = {
  moduleConfig: ProductModuleConfig;
  surface: ModuleThemeFrameProps["surface"];
  theme: ModuleThemeState;
  children: ReactNode;
};

export function ModuleThemeShell({
  moduleConfig,
  surface,
  theme,
  children,
}: ModuleThemeShellProps) {
  const themeDefinition = resolveThemeForModule(moduleConfig);

  return (
    <section
      className={[
        "anyu-module-theme",
        "anyu-module-shell",
        themeDefinition.cssClassName,
        `anyu-module-theme-${surface}`,
      ]
        .filter(Boolean)
        .join(" ")}
      data-shell="module"
      data-theme={themeDefinition.id}
      data-module-slug={moduleConfig.slug}
      data-module-id={moduleConfig.moduleId}
      data-module-theme={theme.variant}
      data-module-theme-source={theme.source}
      data-module-theme-ready={theme.hydrated ? "true" : "false"}
    >
      {children}
    </section>
  );
}
