import { AnyuMark } from "@/components/anyu/AnyuMark";

type WordmarkProps = {
  className?: string;
  showMark?: boolean;
  markDecorative?: boolean;
};

export function Wordmark({
  className,
  showMark = false,
  markDecorative = true,
}: WordmarkProps) {
  return (
    <div className={["anyu-wordmark", className].filter(Boolean).join(" ")} aria-label="暗語 ANYU">
      {showMark ? (
        <span className="anyu-wordmark-mark" aria-hidden={markDecorative}>
          <AnyuMark
            size={18}
            decorative={markDecorative}
            title="ANYU brand mark"
            className="anyu-wordmark-mark-icon"
          />
        </span>
      ) : null}
      <span className="anyu-wordmark-zh">暗語</span>
      <span className="anyu-wordmark-en">ANYU</span>
    </div>
  );
}
