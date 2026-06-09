import type { ReactNode } from "react";
import { AnyuMark } from "@/components/anyu/AnyuMark";
import { Card } from "@/components/anyu/Card";

type RisoPaidStateTone = "pending" | "success" | "warning" | "error";

type RisoPaidStatePanelProps = {
  surface: "return" | "paid-result" | "access-link";
  state: string;
  tone?: RisoPaidStateTone;
  eyebrow: string;
  title: string;
  body: ReactNode;
  note?: ReactNode;
  children?: ReactNode;
  animated?: boolean;
  generationStatus?: string;
};

export function RisoPaidStatePanel({
  surface,
  state,
  tone = "pending",
  eyebrow,
  title,
  body,
  note,
  children,
  animated = false,
  generationStatus,
}: RisoPaidStatePanelProps) {
  return (
    <Card
      className={[
        "anyu-riso-paid-state-panel",
        "anyu-riso-reference-panel",
        `anyu-riso-paid-state-${tone}`,
      ].join(" ")}
      aria-live="polite"
      data-paid-state-surface={surface}
      data-paid-state-card={state}
      data-access-link-state={surface === "access-link" ? state : undefined}
      data-return-state={surface === "return" ? state : undefined}
      data-generation-status={generationStatus}
    >
      <div className="anyu-riso-paid-state-hero">
        <div className="anyu-riso-paid-state-copy">
          <p className="anyu-riso-flow-eyebrow">{eyebrow}</p>
          <h1 className="anyu-section-title anyu-riso-paid-state-title">{title}</h1>
          <p className="anyu-copy">{body}</p>
          {note ? <p className="anyu-subtle-note">{note}</p> : null}
        </div>
        <span className="anyu-riso-paid-state-stamp" aria-hidden="true">
          <AnyuMark size={42} animated={animated} decorative />
        </span>
      </div>
      {children}
    </Card>
  );
}
