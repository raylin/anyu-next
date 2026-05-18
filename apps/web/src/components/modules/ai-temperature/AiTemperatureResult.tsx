"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/anyu/Card";
import { ContactCapture } from "@/components/anyu/ContactCapture";
import { PaidPreviewCard } from "@/components/anyu/PaidPreviewCard";
import { ShareCardPreview } from "@/components/anyu/ShareCardPreview";
import { TemperatureCard } from "@/components/anyu/TemperatureCard";
import { Wordmark } from "@/components/anyu/Wordmark";
import { getClientAnonymousSessionId } from "@/lib/modules/ai-temperature-ui";
import type { ProductModuleConfig } from "@/lib/modules/types";
import type { AiTemperatureResultViewModel } from "@/lib/modules/ai-temperature-ui";

type AiTemperatureResultProps = {
  moduleConfig: ProductModuleConfig;
  result: AiTemperatureResultViewModel;
  mode: "demo" | "runtime";
  resultId: string;
};

export function AiTemperatureResult({
  moduleConfig,
  result,
  mode,
  resultId,
}: AiTemperatureResultProps) {
  const [showContact, setShowContact] = useState(false);
  const [unlockIntentId, setUnlockIntentId] = useState<string | null>(null);

  async function revealContact() {
    if (mode === "demo") {
      setShowContact(true);
      return { ok: true };
    }

    try {
      const response = await fetch("/api/unlock-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resultId,
          moduleId: moduleConfig.moduleId,
          themeSlug: moduleConfig.slug,
          anonymousSessionId: getClientAnonymousSessionId(),
        }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        unlockIntentId?: string;
        message?: string;
      };

      if (!response.ok || !data.ok || !data.unlockIntentId) {
        return {
          ok: false,
          message: data.message ?? "目前無法開啟完整分析，請稍後再試。",
        };
      }

      setUnlockIntentId(data.unlockIntentId);
      setShowContact(true);
      return { ok: true };
    } catch {
      return {
        ok: false,
        message: "目前無法開啟完整分析，請稍後再試。",
      };
    }
  }

  async function submitContact(payload: {
    email?: string;
    lineId?: string;
    consent: boolean;
  }) {
    if (mode === "demo") {
      return {
        ok: true,
        message: "這是 demo 路線，目前不會真的送出，但正式流程已預留位置。",
      };
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resultId,
          unlockIntentId,
          moduleId: moduleConfig.moduleId,
          themeSlug: moduleConfig.slug,
          anonymousSessionId: getClientAnonymousSessionId(),
          email: payload.email,
          lineId: payload.lineId,
          consent: payload.consent,
        }),
      });

      const data = (await response.json()) as { ok: boolean; message: string };

      return {
        ok: response.ok && data.ok,
        message: data.message,
      };
    } catch {
      return {
        ok: false,
        message: "目前聯絡收集服務忙碌中，請稍後再試。",
      };
    }
  }

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
        <h2 className="anyu-section-title">{result.insightTitle}</h2>
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
        headline={result.paidHeadline}
        price={result.paidPrice || moduleConfig.price}
        includedSections={result.paidIncludedSections}
        previewCopy={result.paidPreviewCopy}
        onRevealContact={revealContact}
      />

      <ContactCapture visible={showContact} onSubmit={submitContact} />
    </section>
  );
}
