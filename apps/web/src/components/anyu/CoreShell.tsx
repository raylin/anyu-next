import type { ReactNode } from "react";
import { CORE_THEME } from "@/lib/modules/theme-registry";

export function CoreShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={["anyu-shell", CORE_THEME.cssClassName, className].filter(Boolean).join(" ")}
      data-shell="core"
      data-core-shell="true"
      data-theme={CORE_THEME.id}
      data-theme-owner={CORE_THEME.owner}
    >
      {children}
    </main>
  );
}
