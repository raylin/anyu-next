"use client";

type ShareCardPreviewProps = {
  persona: string;
  quote: string;
  score: number;
  stateLabel: string;
  onShareClick?: () => void;
};

export function ShareCardPreview({
  persona,
  quote,
  score,
  stateLabel,
  onShareClick,
}: ShareCardPreviewProps) {
  return (
    <div className="anyu-share-preview" aria-label="分享卡預覽">
      <div className="anyu-share-shell">
        <div className="anyu-share-top">
          <span className="anyu-kicker">暗語 ANYU</span>
          <span className="anyu-share-dot" aria-hidden="true" />
        </div>

        <div className="anyu-share-body">
          <span className="anyu-kicker">my persona</span>
          <strong className="anyu-share-persona">{persona}</strong>
          <p className="anyu-share-quote">「{quote}」</p>
        </div>

        <div className="anyu-share-footer">
          <div>
            <span className="anyu-kicker">temperature</span>
            <div className="anyu-share-temp">
              <span className="anyu-share-score">{score}°</span>
              <span className="anyu-share-state">{stateLabel}</span>
            </div>
          </div>
          <div className="anyu-share-link">
            <span className="anyu-kicker">測一次 ↗</span>
            <span>anyu.app</span>
          </div>
        </div>
      </div>

      <button type="button" className="anyu-share-action" onClick={onShareClick}>
        這張卡可直接截圖分享
      </button>
    </div>
  );
}
