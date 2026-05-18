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

  return (
    <Card className="anyu-paid-card">
      <p className="anyu-kicker">one-time · no sub</p>

      <div className="anyu-paid-head">
        <div>
          <h2 className="anyu-section-title">
            {headline} — {price}
          </h2>
          <p className="anyu-copy">
            給你 3 種不失控的回法：主動推進、低壓試探、暫時拉開。
          </p>
        </div>
        <span className="anyu-paid-price">{price}</span>
      </div>

      <div className="anyu-paid-grid">
        <article className="anyu-reply-card anyu-reply-card-open">
          <span className="anyu-kicker">A · 可讀預覽</span>
          <p className="anyu-reply-title">
            {includedSections[0] ?? "現在最不該做的一件事"}
          </p>
          <p className="anyu-reply-copy">{previewCopy}</p>
        </article>

        <article className="anyu-reply-card anyu-reply-card-locked" aria-hidden="true">
          <span className="anyu-kicker">B · locked</span>
          <p className="anyu-reply-title">
            {includedSections[1] ?? "三種不失控回法"}
          </p>
          <div className="anyu-lock-lines">
            <span />
            <span />
            <span />
          </div>
        </article>

        <article className="anyu-reply-card anyu-reply-card-locked" aria-hidden="true">
          <span className="anyu-kicker">C · locked</span>
          <p className="anyu-reply-title">
            {includedSections[2] ?? "怎麼測對方投入度"}
          </p>
          <div className="anyu-lock-lines anyu-lock-lines-deep">
            <span />
            <span />
            <span />
          </div>
        </article>
      </div>

      <p className="anyu-small-note">
        {revealed
          ? "目前內測中，這次不會真的收費。"
          : "解鎖後會看到：現在最不該做的一件事、三種不失控回法，以及怎麼測投入度。"}
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
