"use client";

import { useState } from "react";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";

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
    "「這幾天如果你真的忙，我先把節奏收回來；等你想聊的時候再來找我。」",
  ] as const;

  return (
    <Card className="anyu-paid-card">
      <p className="anyu-kicker">一次性查看 · 無訂閱</p>

      <div className="anyu-paid-head">
        <div>
          <h2 className="anyu-section-title">
            {headline} — {price}
          </h2>
          <p className="anyu-copy">
            給你 3 種不失控的回法：主動推進、低壓試探、暫時拉開。
          </p>
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
          <span className="anyu-reply-lock">⋯ 尚未解鎖</span>
        </article>

        <article className="anyu-reply-card anyu-reply-card-locked" aria-hidden="true">
          <div className="anyu-reply-head">
            <span className="anyu-reply-letter">C</span>
            <span className="anyu-reply-tag anyu-reply-tag-locked">
              {includedSections[2] ?? "尊嚴守門"}
            </span>
          </div>
          <p className="anyu-reply-title">尊嚴守門</p>
          <p className="anyu-reply-copy anyu-reply-copy-locked">{lockedPreviewBodies[1]}</p>
          <span className="anyu-reply-lock">⋯ 尚未解鎖</span>
        </article>
      </div>

      <p className="anyu-small-note">
        {revealed
          ? "目前內測中，這次不會真的收費。開放後可查看完整分析。"
          : "目前內測中，這次不會真的收費。點下後可加入 LINE 收到開放通知，或改用 Email。"}
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
