type WordmarkProps = {
  className?: string;
};

export function Wordmark({ className }: WordmarkProps) {
  return (
    <div className={["anyu-wordmark", className].filter(Boolean).join(" ")} aria-label="暗語 ANYU">
      <span className="anyu-wordmark-zh">暗語</span>
      <span className="anyu-wordmark-en">ANYU</span>
    </div>
  );
}
