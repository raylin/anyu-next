import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/anyu/Card";
import { LegalFooter } from "@/components/anyu/LegalFooter";
import { TemperatureCard } from "@/components/anyu/TemperatureCard";
import { Wordmark } from "@/components/anyu/Wordmark";
import { PaidResultPendingPoller } from "@/components/modules/ai-temperature/PaidResultPendingPoller";
import { ModuleThemeBoundary } from "@/components/modules/ai-temperature/ModuleThemeFrame";
import { isDbConfigured } from "@/lib/db/client";
import { getUnlockIntentByTokenHash } from "@/lib/db/runtime";
import { getPaidResultForAnalysisResult } from "@/lib/db/paid-results";
import { hashFulfillmentSecret, isExpired } from "@/lib/line/fulfillment";
import { formatPaidLikelihoodLabel } from "@/lib/modules/ai-temperature-ui";
import {
  getModuleThemeFromSearchParams,
  getModuleThemeFromUnlockToken,
  type ModuleThemeState,
} from "@/lib/modules/module-theme";
import { getModuleBySlug } from "@/lib/modules/registry";
import type { ProductModuleConfig } from "@/lib/modules/types";
import { hasPaidResult, normalizePaidResultForDisplay } from "@/lib/ai/product-result-schema";
import { PAID_RESULT_PROMPT_VERSION, PAID_RESULT_SCHEMA_VERSION } from "@/lib/ai/paid-result-generation";

type UnlockPageProps = {
  params: Promise<{
    moduleSlug: string;
    unlockToken: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UnlockPage({ params, searchParams }: UnlockPageProps) {
  const { moduleSlug, unlockToken } = await params;
  const resolvedSearchParams = await searchParams;
  const moduleConfig = getModuleBySlug(moduleSlug);
  const initialTheme =
    getModuleThemeFromSearchParams(toUrlSearchParams(resolvedSearchParams)) ??
    getModuleThemeFromUnlockToken(unlockToken);

  if (!moduleConfig) {
    notFound();
  }

  if (!isDbConfigured()) {
    return (
      <UnlockError
        moduleConfig={moduleConfig}
        initialTheme={initialTheme}
        message="完整分析服務尚未設定完成，請稍後再試。"
      />
    );
  }

  const record = await getUnlockIntentByTokenHash(hashFulfillmentSecret(unlockToken));

  if (!record || record.unlockIntent.themeSlug !== moduleSlug) {
    return (
      <UnlockError
        moduleConfig={moduleConfig}
        initialTheme={initialTheme}
        message="這組完整分析連結無效，請回到結果頁重新領取。"
      />
    );
  }

  if (isExpired(record.unlockIntent.unlockTokenExpiresAt)) {
    return (
      <UnlockError
        moduleConfig={moduleConfig}
        initialTheme={initialTheme}
        message="這組完整分析連結已過期，請回到結果頁重新領取。"
      />
    );
  }

  const result = record.result.normalizedResultJson;
  const storedPaidResult = await getPaidResultForAnalysisResult({
    analysisResultId: record.result.id,
    promptVersion: PAID_RESULT_PROMPT_VERSION,
    schemaVersion: PAID_RESULT_SCHEMA_VERSION,
  });

  if (!hasPaidResult(result) && !storedPaidResult?.paidResultJson) {
    if (storedPaidResult?.status === "processing") {
      return (
        <UnlockPending
          moduleConfig={moduleConfig}
          initialTheme={initialTheme}
          unlockToken={unlockToken}
          initialStatus="processing"
        />
      );
    }

    if (storedPaidResult?.status === "failed") {
      return (
        <UnlockPending
          moduleConfig={moduleConfig}
          initialTheme={initialTheme}
          unlockToken={unlockToken}
          initialStatus="failed"
        />
      );
    }

    return (
      <UnlockPending
        moduleConfig={moduleConfig}
        initialTheme={initialTheme}
        unlockToken={unlockToken}
        initialStatus={getPendingPaidStatus(storedPaidResult?.status)}
      />
    );
  }

  const paidResult = normalizePaidResultForDisplay(
    storedPaidResult?.paidResultJson ?? result.paid_result,
  );

  return (
    <main className="anyu-shell">
      <ModuleThemeBoundary
        moduleConfig={moduleConfig}
        surface="unlock"
        initialTheme={initialTheme}
        showThemeToggle={false}
      >
        <section className="anyu-result-stack">
          <div className="anyu-result-topbar">
            <Link href={`/m/${moduleSlug}`} className="anyu-back-link">
              ← 回到測驗
            </Link>
            <Wordmark showMark />
          </div>

        <Card className="anyu-quote-card">
          <p className="anyu-kicker">完整分析</p>
          <h1 className="anyu-section-title">{result.paid_preview.headline}</h1>
          <p className="anyu-copy">這是依照剛剛結果整理出的完整回覆建議。這次內測不會真的收費。</p>
        </Card>

        <TemperatureCard
          score={result.free_result.temperature_score}
          stateLabel={result.free_result.state_label}
        />

        <Card className="anyu-insight-card">
          <p className="anyu-kicker t-label-dim">deeper signal</p>
          <h2 className="anyu-section-title">更深一層的訊號</h2>
          <p className="anyu-copy t-reading">{paidResult.fullSummary}</p>
          <div className="anyu-signal-list">
            {paidResult.signalDeepDive.map((item) => (
              <article key={item.title} className="anyu-signal-item">
                <strong>{item.title}</strong>
                <p className="anyu-subtle-note">{item.evidence}</p>
                <p className="anyu-subtle-note">{item.whatItMayMean}</p>
              </article>
            ))}
          </div>
        </Card>

        <Card>
          <p className="anyu-kicker t-label-dim">possible states</p>
          <h2 className="anyu-section-title">三種可能狀態</h2>
          <div className="anyu-signal-list">
            {paidResult.possibleStates.map((state) => (
              <article key={state.label} className="anyu-signal-item">
                <strong>{state.label}</strong>
                <p className="anyu-subtle-note">可能性：{formatPaidLikelihoodLabel(state.likelihood)}</p>
                <p className="anyu-subtle-note">{state.explanation}</p>
              </article>
            ))}
          </div>
        </Card>

        <Card>
          <p className="anyu-kicker t-label-dim">reply strategy</p>
          <h2 className="anyu-section-title">三種不失控的回法</h2>
          <div className="anyu-signal-list">
            {paidResult.replyStrategies.map((strategy) => (
              <article key={strategy.label} className="anyu-signal-item">
                <strong>{strategy.label}</strong>
                {strategy.tone ? (
                  <p className="anyu-subtle-note">語氣：{strategy.tone}</p>
                ) : null}
                <p className="anyu-subtle-note">{strategy.whenToUse}</p>
                <p className="anyu-subtle-note">{strategy.whyItWorks}</p>
                {strategy.possibleReaction ? (
                  <p className="anyu-subtle-note">可能反應：{strategy.possibleReaction}</p>
                ) : null}
                <ul className="anyu-plain-list">
                  {strategy.copyableMessages.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
                {strategy.followUpIfTheyReply ? (
                  <p className="anyu-subtle-note">如果他回了：{strategy.followUpIfTheyReply}</p>
                ) : null}
              </article>
            ))}
          </div>
        </Card>

        <Card>
          <p className="anyu-kicker t-label-dim">risk guardrail</p>
          <h2 className="anyu-section-title">先不要做的事</h2>
          <p className="anyu-copy t-reading">{paidResult.softInsight}</p>
          <ul className="anyu-plain-list">
            {paidResult.avoidDoing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <p className="anyu-kicker t-label-dim">next 48 hours</p>
          <h2 className="anyu-section-title">接下來 48 小時</h2>
          <ul className="anyu-plain-list">
            {paidResult.next48HourPlan.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>

        <Card className="anyu-quote-card">
          <p className="anyu-kicker t-label-dim">summary card</p>
          <h2 className="anyu-section-title">{paidResult.summaryCard.headline}</h2>
          <p className="anyu-copy t-reading">{paidResult.summaryCard.body}</p>
          <p className="anyu-copy t-reading">{paidResult.summaryCard.nextMove}</p>
        </Card>

          <LegalFooter />
        </section>
      </ModuleThemeBoundary>
    </main>
  );
}

function UnlockPending({
  moduleConfig,
  initialTheme,
  unlockToken,
  initialStatus,
}: {
  moduleConfig: ProductModuleConfig;
  initialTheme?: ModuleThemeState | null;
  unlockToken: string;
  initialStatus: "missing" | "pending" | "processing" | "failed";
}) {
  return (
    <main className="anyu-shell">
      <ModuleThemeBoundary
        moduleConfig={moduleConfig}
        surface="unlock"
        initialTheme={initialTheme}
        showThemeToggle={false}
      >
        <section className="anyu-result-stack">
          <div className="anyu-result-topbar">
            <Link href={`/m/${moduleConfig.slug}`} className="anyu-back-link">
              ← 回到測驗
            </Link>
            <Wordmark showMark />
          </div>
          <PaidResultPendingPoller
            moduleSlug={moduleConfig.slug}
            unlockToken={unlockToken}
            initialStatus={initialStatus}
          />
          <LegalFooter />
        </section>
      </ModuleThemeBoundary>
    </main>
  );
}

function getPendingPaidStatus(
  status?: string | null,
): "missing" | "pending" | "processing" | "failed" {
  switch (status) {
    case "pending":
    case "processing":
    case "failed":
      return status;
    default:
      return "missing";
  }
}

function toUrlSearchParams(input?: Record<string, string | string[] | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(input ?? {})) {
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item);
      }
      continue;
    }

    if (typeof value === "string") {
      searchParams.set(key, value);
    }
  }

  return searchParams;
}

function UnlockError({
  moduleConfig,
  initialTheme,
  message,
}: {
  moduleConfig: ProductModuleConfig;
  initialTheme?: ModuleThemeState | null;
  message: string;
}) {
  return (
    <main className="anyu-shell">
      <ModuleThemeBoundary
        moduleConfig={moduleConfig}
        surface="unlock"
        initialTheme={initialTheme}
        showThemeToggle={false}
      >
        <section className="anyu-result-stack">
          <div className="anyu-result-topbar">
            <Link href={`/m/${moduleConfig.slug}`} className="anyu-back-link">
              ← 回到測驗
            </Link>
            <Wordmark showMark />
          </div>
          <Card>
            <p className="anyu-kicker">完整分析</p>
            <h1 className="anyu-section-title">連結暫時不能使用</h1>
            <p className="anyu-copy">{message}</p>
          </Card>
          <LegalFooter />
        </section>
      </ModuleThemeBoundary>
    </main>
  );
}
