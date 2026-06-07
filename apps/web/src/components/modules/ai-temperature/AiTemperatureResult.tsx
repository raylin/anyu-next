"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";
import { LegalFooter } from "@/components/anyu/LegalFooter";
import { PaidPreviewCard } from "@/components/anyu/PaidPreviewCard";
import { ShareCardPreview } from "@/components/anyu/ShareCardPreview";
import { TemperatureCard } from "@/components/anyu/TemperatureCard";
import { Wordmark } from "@/components/anyu/Wordmark";
import { ModuleThemeShell, useModuleThemeController } from "@/components/modules/ai-temperature/ModuleThemeFrame";
import { uiNotices } from "@/content/legal";
import { trackClientEvent } from "@/lib/events/client";
import { getModuleThemeEventMetadata } from "@/lib/modules/module-theme";
import {
  buildShareText,
  getClientAnonymousSessionId,
  scoreToBucket,
} from "@/lib/modules/ai-temperature-ui";
import type { ProductModuleConfig } from "@/lib/modules/types";
import type { AiTemperatureResultViewModel } from "@/lib/modules/ai-temperature-ui";
import type { PaidCtaAvailability } from "@/lib/modules/paid-cta-view-model";

type AiTemperatureResultProps = {
  moduleConfig: ProductModuleConfig;
  result: AiTemperatureResultViewModel;
  mode: "demo" | "runtime";
  resultId: string;
  paidCtaAvailability?: PaidCtaAvailability;
  checkoutHref?: string;
};

export function AiTemperatureResult({
  moduleConfig,
  result,
  mode,
  resultId,
  paidCtaAvailability = "review_pending",
  checkoutHref,
}: AiTemperatureResultProps) {
  const hasTrackedPageView = useRef(false);
  const paidPreviewRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useModuleThemeController(moduleConfig);
  const themeMetadata = useMemo(() => getModuleThemeEventMetadata(theme), [theme]);

  useEffect(() => {
    if (!theme.hydrated || hasTrackedPageView.current) {
      return;
    }

    hasTrackedPageView.current = true;
    void trackClientEvent({
      eventName: "page_view",
      moduleConfig,
      anonymousSessionId: getClientAnonymousSessionId(),
      scoreBucket: scoreToBucket(result.score),
      metadata: {
        pageType: mode === "demo" ? "result_demo" : "result_runtime",
        resultId,
        ...themeMetadata,
      },
    });
  }, [mode, moduleConfig, result.score, resultId, theme.hydrated, themeMetadata]);

  function scrollToNextStep() {
    paidPreviewRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleInlineResultCta() {
    scrollToNextStep();

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        scrollToNextStep();
      }, 80);
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
        ...themeMetadata,
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
    <ModuleThemeShell moduleConfig={moduleConfig} surface="result" theme={theme}>
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
          onClick={handleInlineResultCta}
        >
          看下一句怎麼回
        </Button>
      </Card>

      <p className="anyu-subtle-note">{uiNotices.resultDisclaimer}</p>

      <ShareCardPreview
        moduleTitle={moduleConfig.title}
        moduleSubtitle={moduleConfig.subtitle}
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
          availability={paidCtaAvailability}
          primaryHref={checkoutHref}
        />
      </div>

        <LegalFooter />
      </section>
    </ModuleThemeShell>
  );
}
