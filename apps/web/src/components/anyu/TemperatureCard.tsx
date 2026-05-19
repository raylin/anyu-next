import { Card } from "@/components/anyu/Card";

type TemperatureCardProps = {
  score: number;
  stateLabel: string;
};

export function TemperatureCard({ score, stateLabel }: TemperatureCardProps) {
  return (
    <Card className="anyu-signature-card">
      <div className="anyu-signature-head">
        <div>
          <p className="anyu-kicker">當前溫度</p>
          <h2 className="anyu-section-title">現在比較像哪一種溫差</h2>
        </div>
        <span className="anyu-orb" aria-hidden="true" />
      </div>

      <div className="anyu-score-wrap">
        <span className="anyu-score-value">{score}</span>
        <span className="anyu-score-unit">/100</span>
      </div>

      <p className="anyu-state-label">{stateLabel}</p>
      <div className="anyu-meter" aria-hidden="true">
        <span className="anyu-meter-fill" style={{ width: `${score}%` }} />
      </div>
      <div className="anyu-meter-labels">
        <span>cold</span>
        <span>warm</span>
        <span>hot</span>
      </div>
    </Card>
  );
}
