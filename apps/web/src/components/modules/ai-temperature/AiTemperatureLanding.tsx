import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";
import { SituationChips } from "@/components/anyu/SituationChips";
import type { ProductModuleConfig } from "@/lib/modules/types";

type AiTemperatureLandingProps = {
  moduleConfig: ProductModuleConfig;
};

export function AiTemperatureLanding({
  moduleConfig,
}: AiTemperatureLandingProps) {
  return (
    <section className="anyu-module-stack">
      <Card>
        <span className="anyu-kicker">
          {moduleConfig.brand} · {moduleConfig.moduleId}
        </span>
        <h1 className="anyu-title">{moduleConfig.family}</h1>
        <p className="anyu-subtitle">{moduleConfig.title}</p>
        <p className="anyu-copy">{moduleConfig.subtitle}</p>
      </Card>

      <Card>
        <label className="anyu-field-label" htmlFor="situation-input">
          描述對話或情境
        </label>
        <textarea
          id="situation-input"
          className="anyu-textarea"
          placeholder="貼上最近的對話，或簡單描述目前的曖昧狀態。"
          rows={8}
          disabled
        />
        <SituationChips chips={moduleConfig.chips} />
        <div className="anyu-cta-row">
          <Button disabled>分析關係溫度（coming soon）</Button>
          <span className="anyu-meta">{moduleConfig.price} · one-time unlock</span>
        </div>
      </Card>
    </section>
  );
}
