import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type CommonProps = {
  children: ReactNode;
};

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: false;
  };

type LinkButtonProps = {
  children: ReactNode;
  className?: string;
  href: string;
  asChild: true;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href">;

export function Button(props: ButtonProps | LinkButtonProps) {
  if (props.asChild) {
    const { children, className, href, ...rest } = props;

    return (
      <Link
        href={href}
        className={["anyu-button", className].filter(Boolean).join(" ")}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  const { children, className, disabled, type = "button", ...rest } = props;

  return (
    <button
      type={type}
      disabled={disabled}
      className={["anyu-button", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
