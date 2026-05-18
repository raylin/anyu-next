import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <div className={["anyu-card", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}
