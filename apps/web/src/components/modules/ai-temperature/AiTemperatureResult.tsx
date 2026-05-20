"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/anyu/Card";
import { ContactCapture } from "@/components/anyu/ContactCapture";
import { LegalFooter } from "@/components/anyu/LegalFooter";
import { PaidPreviewCard } from "@/components/anyu/PaidPreviewCard";
import { ShareCardPreview } from "@/components/anyu/ShareCardPreview";
import { TemperatureCard } from "@/components/anyu/TemperatureCard";
import { Wordmark } from "@/components/anyu/Wordmark";
import { uiNotices } from "@/content/legal";
import { trackClientEvent, trackClientEventBeacon } from "@/lib/events/client";
import {
  buildShareText,
  getClientAnonymousSessionId,
  getLineAddUrl,
  scoreToBucket,
} from "@/lib/modules/ai-temperature-ui";
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
  const [unlockIntentFailed, setUnlockIntentFailed] = useState(false);
  const lineAddUrl = getLineAddUrl();

  useEffect(() => {
    void trackClientEvent({
      eventName: "page_view",
      moduleConfig,
      anonymousSessionId: getClientAnonymousSessionId(),
      scoreBucket: scoreToBucket(result.score),
      metadata: {
        pageType: mode === "demo" ? "result_demo" : "result_runtime",
        resultId,
      },
    });
  }, [mode, moduleConfig, result.score, resultId]);

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
        setUnlockIntentId(null);
        setUnlockIntentFailed(true);
        setShowContact(true);
        return {
          ok: true,
        };
      }

      setUnlockIntentId(data.unlockIntentId);
      setUnlockIntentFailed(false);
      setShowContact(true);
      return { ok: true };
    } catch {
      setUnlockIntentId(null);
      setUnlockIntentFailed(true);
      setShowContact(true);
      return {
        ok: true,
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
        message:
          response.ok && data.ok
            ? "已收到，我們會在完整分析開放時通知你。"
            : "目前內測表單暫時無法送出，請稍後再試。",
      };
    } catch {
      return {
        ok: false,
        message: "目前內測表單暫時無法送出，請稍後再試。",
      };
    }
  }

  function handleShareClick() {
    void trackClientEvent({
      eventName: "share_card_clicked",
      moduleConfig,
      anonymousSessionId: getClientAnonymousSessionId(),
      scoreBucket: scoreToBucket(result.score),
      metadata: {
        resultId,
      },
    });
  }

  function handleEmailFallbackOpen() {
    void trackClientEvent({
      eventName: "email_fallback_opened",
      moduleConfig,
      anonymousSessionId: getClientAnonymousSessionId(),
      scoreBucket: scoreToBucket(result.score),
      metadata: {
        resultId,
        unlockIntentId,
        source: "contact_capture",
      },
    });
  }

  function handleLineAddClick() {
    trackClientEventBeacon({
      eventName: "line_add_clicked",
      moduleConfig,
      anonymousSessionId: getClientAnonymousSessionId(),
      scoreBucket: scoreToBucket(result.score),
      metadata: {
        resultId,
        unlockIntentId,
        source: "contact_capture",
      },
    });
  }

  async function handleCopyShareText() {
    const shareText = buildShareText(
      result,
      moduleConfig,
      typeof window !== "undefined" ? window.location.origin : "https://staging.anyu.tw",
    );

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          text: shareText,
        });
      } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        throw new Error("share_unavailable");
      }

      return {
        ok: true,
        message: "已複製，可以貼到 LINE / Threads",
      };
    } catch {
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareText);
          return {
            ok: true,
            message: "已複製，可以貼到 LINE / Threads",
          };
        }
      } catch {
        return {
          ok: false,
          message: "複製失敗，請手動選取文字",
        };
      }

      return {
        ok: false,
        message: "複製失敗，請手動選取文字",
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

      <section className="anyu-signals-card" aria-labelledby="anyu-observed-signals-title">
        <div className="anyu-section-head">
          <div>
            <p className="anyu-kicker">他這邊的訊號</p>
            <h2 id="anyu-observed-signals-title" className="anyu-section-title">
              觀察到的三個小訊號
            </h2>
          </div>
          <span className="anyu-meta">3 個維度</span>
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
      </section>

      <Card className="anyu-insight-card">
        <p className="anyu-kicker">insight layer</p>
        <h2 className="anyu-section-title">{result.insightTitle}</h2>
        <p className="anyu-copy">{result.insight}</p>
        <p className="anyu-reassurance">{result.reassurance}</p>
      </Card>

      <p className="anyu-subtle-note">{uiNotices.resultDisclaimer}</p>

      <ShareCardPreview
        persona={result.persona}
        quote={result.shareQuote}
        score={result.score}
        stateLabel={result.stateLabel}
        onShareClick={handleShareClick}
        onCopyShareText={handleCopyShareText}
      />

      <PaidPreviewCard
        headline={result.paidHeadline}
        price={result.paidPrice || moduleConfig.price}
        includedSections={result.paidIncludedSections}
        previewCopy={result.paidPreviewCopy}
        onRevealContact={revealContact}
      />

      <ContactCapture
        visible={showContact}
        lineAddUrl={lineAddUrl}
        noticeMessage={
          unlockIntentFailed
            ? "內測記錄暫時無法建立，但你仍可留下聯絡方式。"
            : undefined
        }
        onLineAddClick={handleLineAddClick}
        onEmailFallbackOpen={handleEmailFallbackOpen}
        onSubmit={submitContact}
      />

      <LegalFooter />
    </section>
  );
}
