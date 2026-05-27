"use client";

import { useState } from "react";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";
import { LEGAL_CONTACT_EMAIL } from "@/content/legal";

type PaidPreviewCardProps = {
  headline: string;
  price: string;
  includedSections: string[];
  previewCopy: string;
  onRevealContact?: () => Promise<{ ok: boolean; message?: string }>;
};

export function PaidPreviewCard({
  headline,
  price,
  includedSections,
  previewCopy,
  onRevealContact,
}: PaidPreviewCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleReveal() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = (await onRevealContact?.()) ?? { ok: true };

      if (!response.ok) {
        setErrorMessage(response.message ?? "目前無法開啟完整分析。");
        return;
      }

      setRevealed(true);
    } finally {
      setIsLoading(false);
    }
  }

  const lockedPreviewBodies = [
    "「看你在跟朋友打球，那就先好好玩——哪天你比較有空，再把時間給我。」",
    "48 小時內，看他是自然靠近，還是只有在你提醒時才回應。",
  ] as const;
  const includedItems = [
    "3 種可能狀態",
    "可直接使用的回覆句與回覆策略",
    "48 小時觀察建議",
    "分析依據線索摘要",
    "可回看的完整結果頁",
  ] as const;
  const policyItems = [
    "不需要留下姓名，也請不要貼姓名、電話、地址或帳號等可識別身份資訊。",
    "你提供的文字只用於本次分析與必要服務交付，不會公開展示或提供第三方行銷使用。",
    `正式付款後若系統未成功產生結果、連結無法開啟或重複付款，可協助補發或退款；聯絡 ${LEGAL_CONTACT_EMAIL} 時不需要提供原始對話內容。`,
  ] as const;

  return (
    <Card className="anyu-paid-card">
      <p className="anyu-kicker t-label-dim">一次性查看 · 無訂閱</p>

      <div className="anyu-paid-head">
        <div className="anyu-paid-value-summary">
          <h2 className="anyu-section-title">
            {headline} — {price}
          </h2>
          <p className="anyu-copy">
            正式開放後，一次性查看；目前內測不會真的收費。
          </p>
          <p className="anyu-subtle-note">完整分析會透過網頁或 LINE 連結交付。</p>
        </div>
        <div className="anyu-paid-price-block">
          <span className="anyu-paid-price">{price}</span>
          <span className="anyu-paid-price-note">一次性 · no subscription</span>
        </div>
      </div>

      <div className="anyu-paid-grid">
        <article className="anyu-reply-card anyu-reply-card-open">
          <div className="anyu-reply-head">
            <span className="anyu-reply-letter anyu-reply-letter-open">A</span>
            <span className="anyu-reply-tag">保留主動權</span>
          </div>
          <p className="anyu-reply-copy t-reading">{previewCopy}</p>
          <span className="anyu-reply-divider" aria-hidden="true" />
          <p className="anyu-reply-why">
            <span>為什麼這樣回 ·</span>
            <em>{includedSections[0] ?? "把球給回去，但不催。"}</em>
          </p>
        </article>

        <article className="anyu-reply-card anyu-reply-card-locked" aria-hidden="true">
          <div className="anyu-reply-head">
            <span className="anyu-reply-letter">B</span>
            <span className="anyu-reply-tag anyu-reply-tag-locked">
              {includedSections[1] ?? "低壓試探"}
            </span>
          </div>
          <p className="anyu-reply-title">低壓試探</p>
          <p className="anyu-reply-copy anyu-reply-copy-locked">{lockedPreviewBodies[0]}</p>
          <span className="anyu-reply-lock-mark" aria-hidden="true">
            ⋯
          </span>
          <span className="anyu-reply-lock">⋯ 尚未解鎖</span>
        </article>

        <article className="anyu-reply-card anyu-reply-card-locked" aria-hidden="true">
          <div className="anyu-reply-head">
            <span className="anyu-reply-letter">C</span>
            <span className="anyu-reply-tag anyu-reply-tag-locked">
              {includedSections[2] ?? "48 小時觀察"}
            </span>
          </div>
          <p className="anyu-reply-title">48 小時觀察</p>
          <p className="anyu-reply-copy anyu-reply-copy-locked">{lockedPreviewBodies[1]}</p>
          <span className="anyu-reply-lock-mark" aria-hidden="true">
            ⋯
          </span>
          <span className="anyu-reply-lock">⋯ 尚未解鎖</span>
        </article>
      </div>

      <div className="anyu-paid-included-panel" aria-label="完整分析包含">
        <p className="anyu-kicker t-label-dim">完整分析包含</p>
        <div className="anyu-paid-included-grid">
          {includedItems.map((item) => (
            <span key={item} className="anyu-paid-included-item">
              {item}
            </span>
          ))}
        </div>
      </div>

      <p className="anyu-small-note">
        {revealed
          ? "目前內測中，這次不會真的收費。你可以透過 LINE 或 Email 接收完整分析連結。"
          : "目前內測中，這次不會真的收費。點下後可加入 LINE 接收完整分析連結，或改用 Email。"}
      </p>

      <div className="anyu-paid-policy-panel">
        <p className="anyu-kicker t-label-dim">交付與隱私</p>
        <ul className="anyu-paid-policy-list">
          {policyItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <p className="anyu-paid-limitation-note">
        暗語 ANYU 是文字情境整理與溝通建議，不是心理治療、諮商、命理或關係結果保證。
      </p>

      <Button type="button" className="anyu-button-block" onClick={handleReveal} disabled={isLoading}>
        {isLoading ? "開啟中..." : `${headline} — ${price}`}
      </Button>

      {errorMessage ? (
        <p className="anyu-status-message anyu-status-message-error">{errorMessage}</p>
      ) : null}
    </Card>
  );
}
