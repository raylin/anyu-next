"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/anyu/Button";
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

type UnlockFulfillmentState = {
  fulfillmentCode: string | null;
  fulfillmentExpiresAt: string | null;
  unlockToken: string | null;
  liffUrl: string | null;
  lineAddUrl: string | null;
};

export function AiTemperatureResult({
  moduleConfig,
  result,
  mode,
  resultId,
}: AiTemperatureResultProps) {
  const [showContact, setShowContact] = useState(false);
  const [unlockIntentId, setUnlockIntentId] = useState<string | null>(null);
  const [unlockFulfillment, setUnlockFulfillment] =
    useState<UnlockFulfillmentState | null>(null);
  const [unlockIntentFailed, setUnlockIntentFailed] = useState(false);
  const paidPreviewRef = useRef<HTMLDivElement | null>(null);
  const contactPanelRef = useRef<HTMLDivElement | null>(null);
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

  function scrollToNextStep() {
    const target = contactPanelRef.current ?? paidPreviewRef.current;

    target?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function revealContact(source = "paid_preview") {
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
          source,
        }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        unlockIntentId?: string;
        fulfillmentCode?: string;
        fulfillmentExpiresAt?: string;
        unlockToken?: string;
        liffUrl?: string | null;
        lineAddUrl?: string | null;
        message?: string;
      };

      if (!response.ok || !data.ok || !data.unlockIntentId) {
        setUnlockIntentId(null);
        setUnlockFulfillment(null);
        setUnlockIntentFailed(true);
        setShowContact(true);
        return {
          ok: true,
        };
      }

      setUnlockIntentId(data.unlockIntentId);
      setUnlockFulfillment({
        fulfillmentCode: data.fulfillmentCode ?? null,
        fulfillmentExpiresAt: data.fulfillmentExpiresAt ?? null,
        unlockToken: data.unlockToken ?? null,
        liffUrl: data.liffUrl ?? null,
        lineAddUrl: data.lineAddUrl ?? null,
      });
      setUnlockIntentFailed(false);
      setShowContact(true);
      return { ok: true };
    } catch {
      setUnlockIntentId(null);
      setUnlockFulfillment(null);
      setUnlockIntentFailed(true);
      setShowContact(true);
      return {
        ok: true,
      };
    }
  }

  async function handleInlineResultCta() {
    scrollToNextStep();
    await revealContact("inline_result_cta");

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        scrollToNextStep();
      }, 80);
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
        <Wordmark showMark />
      </div>

      <TemperatureCard score={result.score} stateLabel={result.stateLabel} />

      <Card className="anyu-quote-card">
        <p className="anyu-lead-quote t-quote">{result.oneSentenceRead}</p>
      </Card>

      <section className="anyu-signals-card" aria-labelledby="anyu-observed-signals-title">
        <div className="anyu-section-head">
          <div>
            <p className="anyu-kicker t-label-accent">他這邊的訊號</p>
            <h2 id="anyu-observed-signals-title" className="anyu-section-title">
              觀察到的三個小訊號
            </h2>
          </div>
          <span className="anyu-meta t-label-dim">3 個維度</span>
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
        <p className="anyu-kicker t-label-dim">insight layer</p>
        <h2 className="anyu-section-title">{result.insightTitle}</h2>
        <p className="anyu-copy t-reading">{result.insight}</p>
        <p className="anyu-reassurance t-reading">{result.reassurance}</p>
        <p className="anyu-insight-soft-end t-kai-quote">
          「現在最不該做的，是把壓力全部丟到自己身上。」
        </p>
      </Card>

      <Card className="anyu-transition-card anyu-transition-card-soft">
        <div className="anyu-transition-copy">
          <p className="anyu-kicker t-label-dim">next step</p>
          <h2 className="anyu-section-title">想知道下一句怎麼回？</h2>
          <p className="anyu-copy">
            解鎖 3 種下一句回法、對方可能的 3 種狀態、48 小時觀察策略與可收藏摘要卡。
          </p>
        </div>
        <Button
          type="button"
          className="anyu-button-block anyu-button-secondary"
          onClick={() => {
            void handleInlineResultCta();
          }}
        >
          看下一句怎麼回
        </Button>
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

      <div ref={paidPreviewRef}>
        <PaidPreviewCard
          headline={result.paidHeadline}
          price={result.paidPrice || moduleConfig.price}
          includedSections={result.paidIncludedSections}
          previewCopy={result.paidPreviewCopy}
          onRevealContact={revealContact}
        />
      </div>

      <div ref={contactPanelRef}>
        <ContactCapture
          visible={showContact}
          lineAddUrl={unlockFulfillment?.lineAddUrl ?? lineAddUrl}
          liffUrl={unlockFulfillment?.liffUrl}
          fulfillmentCode={unlockFulfillment?.fulfillmentCode}
          fulfillmentExpiresAt={unlockFulfillment?.fulfillmentExpiresAt}
          noticeMessage={
            unlockIntentFailed
              ? "內測記錄暫時無法建立，但你仍可留下聯絡方式。"
              : undefined
          }
          onLineAddClick={handleLineAddClick}
          onEmailFallbackOpen={handleEmailFallbackOpen}
          onSubmit={submitContact}
        />
      </div>

      <LegalFooter />
    </section>
  );
}
