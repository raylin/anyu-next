"use client";

import { useEffect, useState, type ReactNode } from "react";
import { trackClientEvent } from "@/lib/events/client";
import {
  getModuleThemeEventMetadata,
  readModuleThemeState,
  writeManualModuleThemeVariant,
  type ModuleThemeSource,
  type ModuleThemeState,
  type ModuleThemeVariant,
} from "@/lib/modules/module-theme";
import { getClientAnonymousSessionId } from "@/lib/modules/ai-temperature-ui";
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

const DEFAULT_THEME: ModuleThemeState = {
  variant: "classic",
  source: "ab_assigned",
  hydrated: false,
};

export function useModuleThemeController(
  moduleConfig: ProductModuleConfig,
  initialTheme?: ModuleThemeState | null,
) {
  const [theme, setTheme] = useState<ModuleThemeState>(
    initialTheme ? { ...initialTheme, hydrated: true } : DEFAULT_THEME,
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        if (initialTheme?.variant) {
          setTheme({ ...initialTheme, hydrated: true });
          return;
        }

        setTheme(readModuleThemeState(window.localStorage));
      } catch {
        setTheme({ ...DEFAULT_THEME, hydrated: true });
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [initialTheme]);

  function switchTheme(nextVariant: ModuleThemeVariant) {
    setTheme((current) => {
      if (current.variant === nextVariant && current.source === "manual_override") {
        return current;
      }

      let nextTheme: ModuleThemeState = {
        variant: nextVariant,
        source: "manual_override",
        hydrated: true,
      };

      try {
        nextTheme = writeManualModuleThemeVariant(window.localStorage, nextVariant);
      } catch {
        // Theme switching should remain UI-only and never block the funnel.
      }

      void trackClientEvent({
        eventName: "theme_switch_clicked",
        moduleConfig,
        anonymousSessionId: getClientAnonymousSessionId(),
        metadata: getModuleThemeEventMetadata(nextTheme),
      });

      return nextTheme;
    });
  }

  return { theme, switchTheme };
}

export function ModuleThemeFrame({ moduleConfig, surface, children }: ModuleThemeFrameProps) {
  const { theme, switchTheme } = useModuleThemeController(moduleConfig);

  return (
    <ModuleThemeShell surface={surface} theme={theme} onSwitchTheme={switchTheme}>
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
  children: ReactNode;
}) {
  const { theme, switchTheme } = useModuleThemeController(moduleConfig, initialTheme);

  return (
    <ModuleThemeShell surface={surface} theme={theme} onSwitchTheme={switchTheme}>
      {children}
    </ModuleThemeShell>
  );
}

type ModuleThemeShellProps = {
  surface: ModuleThemeFrameProps["surface"];
  theme: ModuleThemeState;
  onSwitchTheme: (variant: ModuleThemeVariant) => void;
  children: ReactNode;
};

export function ModuleThemeShell({
  surface,
  theme,
  onSwitchTheme,
  children,
}: ModuleThemeShellProps) {
  return (
    <section
      className={[
        "anyu-module-theme",
        theme.variant === "riso" ? "anyu-v2" : "",
        `anyu-module-theme-${surface}`,
      ]
        .filter(Boolean)
        .join(" ")}
      data-module-theme={theme.variant}
      data-module-theme-source={theme.source}
      data-module-theme-ready={theme.hydrated ? "true" : "false"}
    >
      <ModuleThemeToggle
        activeVariant={theme.variant}
        onSwitch={onSwitchTheme}
      />
      {children}
    </section>
  );
}

type ModuleThemeToggleProps = {
  activeVariant: ModuleThemeVariant;
  onSwitch: (variant: ModuleThemeVariant) => void;
};

function ModuleThemeToggle({ activeVariant, onSwitch }: ModuleThemeToggleProps) {
  return (
    <div className="anyu-theme-toggle" aria-label="視覺風格">
      <button
        type="button"
        className={[
          "anyu-theme-toggle-option",
          "anyu-theme-toggle-option-classic",
          activeVariant === "classic" ? "is-active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={activeVariant === "classic"}
        aria-label="切換為柔和主題"
        onClick={() => onSwitch("classic")}
      />
      <button
        type="button"
        className={[
          "anyu-theme-toggle-option",
          "anyu-theme-toggle-option-riso",
          activeVariant === "riso" ? "is-active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={activeVariant === "riso"}
        aria-label="切換為鮮明主題"
        onClick={() => onSwitch("riso")}
      />
    </div>
  );
}
