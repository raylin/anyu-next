"use client";

import { useState } from "react";
import { Button } from "@/components/anyu/Button";
import { Wordmark } from "@/components/anyu/Wordmark";

type ShareCardPreviewProps = {
  moduleTitle: string;
  moduleSubtitle: string;
  persona: string;
  quote: string;
  score: number;
  stateLabel: string;
  onShareClick?: () => void;
  onCopyShareText?: () => Promise<{ ok: boolean; message: string }>;
};

export function ShareCardPreview({
  moduleTitle,
  moduleSubtitle,
  persona,
  quote,
  score,
  stateLabel,
  onShareClick,
  onCopyShareText,
}: ShareCardPreviewProps) {
  const [shareStatus, setShareStatus] = useState("");

  async function handleCopyShare() {
    if (!onCopyShareText) {
      return;
    }

    const response = await onCopyShareText();
    setShareStatus(response.message);
  }

  async function handlePrimaryShare() {
    onShareClick?.();
    await handleCopyShare();
  }

  return (
    <div className="anyu-share-preview" aria-label="分享卡預覽">
      <div className="anyu-share-shell">
        <div className="anyu-share-top">
          <Wordmark className="anyu-wordmark-share" showMark />
        </div>

        <div className="anyu-share-body">
          <span className="anyu-kicker t-label-dim">module</span>
          <strong className="anyu-share-persona">{moduleTitle}</strong>
          <p className="anyu-share-quote t-kai-quote">{moduleSubtitle}</p>
          <span className="anyu-kicker t-label-dim">my persona · {persona}</span>
          <p className="anyu-subtle-note">「{quote}」</p>
        </div>

        <div className="anyu-share-footer">
          <div>
            <span className="anyu-kicker t-label-faint">temperature</span>
            <div className="anyu-share-temp">
              <span className="anyu-share-score">{score}°</span>
              <span className="anyu-share-state">{stateLabel}</span>
            </div>
          </div>
          <div className="anyu-share-link">
            <span className="anyu-kicker t-label-faint">測一次 ↗</span>
            <span>anyu.app</span>
          </div>
        </div>
      </div>

      <div className="anyu-share-actions">
        <Button
          type="button"
          className="anyu-share-action anyu-share-action-primary"
          onClick={handlePrimaryShare}
        >
          分享這個結果
        </Button>
        <p className="anyu-share-action-detail">複製成 LINE / Threads 可以貼上的文字</p>
      </div>
      {shareStatus ? <p className="anyu-status-message">{shareStatus}</p> : null}
    </div>
  );
}
