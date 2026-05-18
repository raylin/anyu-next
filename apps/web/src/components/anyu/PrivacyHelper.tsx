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
      <p>請不要貼姓名 / 電話 / 地址</p>
      <p>結果頁不展示原始對話，分享卡也不包含私密內容。</p>
    </div>
  );
}
