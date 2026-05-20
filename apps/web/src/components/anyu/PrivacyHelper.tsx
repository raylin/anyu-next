import { uiNotices } from "@/content/legal";

type PrivacyHelperProps = {
  compact?: boolean;
};

export function PrivacyHelper({ compact = false }: PrivacyHelperProps) {
  return (
    <div
      className={[
        "anyu-privacy-helper",
        compact ? "anyu-privacy-helper-compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="anyu-helper-rule" aria-hidden="true" />
      <p>{uiNotices.inputHelper}</p>
    </div>
  );
}
