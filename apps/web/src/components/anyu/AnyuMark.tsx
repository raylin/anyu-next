import { useId, type CSSProperties } from "react";

type AnyuMarkProps = {
  size?: number;
  animated?: boolean;
  title?: string;
  decorative?: boolean;
  className?: string;
  style?: CSSProperties;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function AnyuMark({
  size = 24,
  animated = false,
  title = "ANYU",
  decorative = false,
  className,
  style,
}: AnyuMarkProps) {
  const titleId = useId();
  const label = title.trim() || "ANYU";
  const svgProps = decorative
    ? {
        "aria-hidden": true as const,
      }
    : {
        role: "img" as const,
        "aria-labelledby": titleId,
      };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cx("anyu-mark", animated && "anyu-mark--typing", className)}
      style={style}
      {...svgProps}
    >
      {!decorative ? <title id={titleId}>{label}</title> : null}
      {animated ? (
        <>
          <circle className="anyu-mark__dot anyu-mark__dot--1" cx="22" cy="50" r="7.5" fill="currentColor" />
          <circle className="anyu-mark__dot anyu-mark__dot--2" cx="50" cy="50" r="7.5" fill="currentColor" />
          <circle className="anyu-mark__dot anyu-mark__dot--3" cx="78" cy="50" r="7.5" fill="currentColor" />
        </>
      ) : (
        <>
          <circle cx="22" cy="56" r="7.5" fill="currentColor" opacity="0.55" />
          <circle cx="50" cy="50" r="7.5" fill="currentColor" opacity="0.82" />
          <circle cx="78" cy="44" r="7.5" fill="currentColor" />
        </>
      )}
    </svg>
  );
}
