"use client";

import { useState } from "react";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";

type PaidPreviewCardProps = {
  price: string;
  onRevealContact?: () => void;
};

export function PaidPreviewCard({
  price,
  onRevealContact,
}: PaidPreviewCardProps) {
  const [revealed, setRevealed] = useState(false);

  function handleReveal() {
    setRevealed(true);
    onRevealContact?.();
  }

  return (
    <Card className="anyu-paid-card">
      <p className="anyu-kicker">one-time · no sub</p>

      <div className="anyu-paid-head">
        <div>
          <h2 className="anyu-section-title">解鎖下一句怎麼回 — {price}</h2>
          <p className="anyu-copy">
            給你 3 種不失控的回法：主動推進、低壓試探、暫時拉開。
          </p>
        </div>
        <span className="anyu-paid-price">{price}</span>
      </div>

      <div className="anyu-paid-grid">
        <article className="anyu-reply-card anyu-reply-card-open">
          <span className="anyu-kicker">A · 可讀預覽</span>
          <p className="anyu-reply-title">主動推進</p>
          <p className="anyu-reply-copy">
            先把話題收窄到一個小邀請，讓對方只需要回應一次態度，不必立刻表態很多。
          </p>
        </article>

        <article className="anyu-reply-card anyu-reply-card-locked" aria-hidden="true">
          <span className="anyu-kicker">B · locked</span>
          <p className="anyu-reply-title">低壓試探</p>
          <div className="anyu-lock-lines">
            <span />
            <span />
            <span />
          </div>
        </article>

        <article className="anyu-reply-card anyu-reply-card-locked" aria-hidden="true">
          <span className="anyu-kicker">C · locked</span>
          <p className="anyu-reply-title">暫時拉開</p>
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

      <Button type="button" className="anyu-button-block" onClick={handleReveal}>
        解鎖下一句怎麼回 — {price}
      </Button>
    </Card>
  );
}
