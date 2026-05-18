"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/anyu/Card";
import { ContactCapture } from "@/components/anyu/ContactCapture";
import { PaidPreviewCard } from "@/components/anyu/PaidPreviewCard";
import { ShareCardPreview } from "@/components/anyu/ShareCardPreview";
import { TemperatureCard } from "@/components/anyu/TemperatureCard";
import { Wordmark } from "@/components/anyu/Wordmark";
import type { ProductModuleConfig } from "@/lib/modules/types";
import type { DemoResult } from "@/lib/modules/ai-temperature-ui";

type AiTemperatureResultProps = {
  moduleConfig: ProductModuleConfig;
  result: DemoResult;
};

export function AiTemperatureResult({
  moduleConfig,
  result,
}: AiTemperatureResultProps) {
  const [showContact, setShowContact] = useState(false);

  return (
    <section className="anyu-result-stack">
      <div className="anyu-result-topbar">
        <Link href={`/m/${moduleConfig.slug}`} className="anyu-back-link">
          ← 重新整理輸入
        </Link>
        <Wordmark />
      </div>

      <TemperatureCard score={result.score} stateLabel={result.stateLabel} />

      <Card className="anyu-quote-card">
        <p className="anyu-lead-quote">{result.oneSentenceRead}</p>
      </Card>

      <Card className="anyu-signals-card">
        <div className="anyu-section-head">
          <div>
            <p className="anyu-kicker">他這邊的訊號</p>
            <h2 className="anyu-section-title">觀察到的三個小訊號</h2>
          </div>
          <span className="anyu-meta">observed signals</span>
        </div>

        <div className="anyu-signal-list">
          {result.observedSignals.map((signal) => (
            <article key={signal.label} className="anyu-signal-item">
              <div className="anyu-signal-top">
                <strong>{signal.label}</strong>
                <span>{signal.value}</span>
              </div>
              <div className="anyu-meter anyu-meter-thin" aria-hidden="true">
                <span className="anyu-meter-fill" style={{ width: `${signal.value}%` }} />
              </div>
              <p className="anyu-subtle-note">{signal.note}</p>
            </article>
          ))}
        </div>
      </Card>

      <Card className="anyu-insight-card">
        <p className="anyu-kicker">insight layer</p>
        <h2 className="anyu-section-title">你卡住的，不只是回覆慢。</h2>
        <p className="anyu-copy">{result.insight}</p>
        <p className="anyu-reassurance">{result.reassurance}</p>
      </Card>

      <ShareCardPreview
        persona={result.persona}
        quote={result.shareQuote}
        score={result.score}
        stateLabel={result.stateLabel}
      />

      <PaidPreviewCard
        price={moduleConfig.price}
        onRevealContact={() => setShowContact(true)}
      />

      <ContactCapture visible={showContact} />
    </section>
  );
}
