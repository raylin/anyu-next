import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/anyu/Card";
import { LegalFooter } from "@/components/anyu/LegalFooter";
import { TemperatureCard } from "@/components/anyu/TemperatureCard";
import { Wordmark } from "@/components/anyu/Wordmark";
import { PaidResultPendingPoller } from "@/components/modules/ai-temperature/PaidResultPendingPoller";
import { ModuleThemeBoundary } from "@/components/modules/ai-temperature/ModuleThemeFrame";
import {
  UnlockedResultViewTracker,
  type UnlockedPaidResultSource,
} from "@/components/modules/ai-temperature/UnlockedResultViewTracker";
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
import {
  hasPaidResult,
  normalizePaidResultForDisplay,
  type PaidResultEvidenceSummary,
} from "@/lib/ai/product-result-schema";
import {
  PAID_RESULT_PROMPT_VERSION,
  PAID_RESULT_PROVIDER_FALLBACK_MODEL,
  PAID_RESULT_SCHEMA_VERSION,
} from "@/lib/ai/paid-result-generation";

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
  const currentPaidResult = await getPaidResultForAnalysisResult({
    analysisResultId: record.result.id,
    promptVersion: PAID_RESULT_PROMPT_VERSION,
    schemaVersion: PAID_RESULT_SCHEMA_VERSION,
  });
  const storedPaidResult =
    currentPaidResult ??
    (await getPaidResultForAnalysisResult({
      analysisResultId: record.result.id,
      status: "completed",
    }));
  const routeState = resolveUnlockPaidRouteState({
    result,
    storedPaidResult,
    fulfillmentStatus: record.unlockIntent.fulfillmentStatus,
  });

  if (routeState !== "completed") {
    return (
      <UnlockPending
        moduleConfig={moduleConfig}
        initialTheme={initialTheme}
        unlockToken={unlockToken}
        initialStatus={getInitialPendingStatus(routeState)}
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
          <UnlockedResultViewTracker
            moduleConfig={moduleConfig}
            anonymousSessionId={record.unlockIntent.anonymousSessionId}
            scoreBucket={record.result.scoreBucket}
            themeVariant={initialTheme?.variant ?? "unknown"}
            themeSource={initialTheme?.source ?? "unknown"}
            themeCarryoverSource={initialTheme ? "unlock_intent" : null}
            paidResultSource={getUnlockedPaidResultSource({ storedPaidResult, result })}
            resultAgeBucket={getResultAgeBucket(record.result.createdAt)}
          />
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

        <EvidenceSummarySection evidenceSummary={paidResult.evidenceSummary} />

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

export function EvidenceSummarySection({
  evidenceSummary,
}: {
  evidenceSummary?: PaidResultEvidenceSummary | null;
}) {
  if (!evidenceSummary || evidenceSummary.items.length === 0) {
    return null;
  }

  return (
    <Card className="anyu-evidence-card">
      <p className="anyu-kicker t-label-accent">evidence</p>
      <h2 className="anyu-section-title">{evidenceSummary.title || "這份分析主要參考了這些線索"}</h2>
      <div className="anyu-signal-list">
        {evidenceSummary.items.map((item) => (
          <article key={`${item.label}-${item.summary}`} className="anyu-signal-item">
            <strong>{item.label}</strong>
            <p className="anyu-copy t-reading">{item.summary}</p>
            <p className="anyu-subtle-note">{item.reason}</p>
          </article>
        ))}
      </div>
    </Card>
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

export type UnlockPaidRouteState =
  | "completed"
  | "processing"
  | "requested"
  | "claimed_missing"
  | "not_requested"
  | "failed"
  | "expired";

export type ResultAgeBucket = "lt_1h" | "1_24h" | "1_7d" | "gt_7d" | "unknown";

export function getResultAgeBucket(createdAt?: Date | string | null, now = new Date()): ResultAgeBucket {
  if (!createdAt) {
    return "unknown";
  }

  const parsed = createdAt instanceof Date ? createdAt : new Date(createdAt);

  if (Number.isNaN(parsed.getTime())) {
    return "unknown";
  }

  const ageMs = Math.max(0, now.getTime() - parsed.getTime());
  const hourMs = 60 * 60 * 1000;
  const dayMs = 24 * hourMs;

  if (ageMs < hourMs) {
    return "lt_1h";
  }

  if (ageMs < dayMs) {
    return "1_24h";
  }

  if (ageMs < 7 * dayMs) {
    return "1_7d";
  }

  return "gt_7d";
}

export function getUnlockedPaidResultSource(input: {
  storedPaidResult?: {
    status?: string | null;
    model?: string | null;
    paidResultJson?: unknown;
  } | null;
  result: unknown;
}): UnlockedPaidResultSource {
  if (input.storedPaidResult?.status === "completed" && input.storedPaidResult.paidResultJson) {
    if (input.storedPaidResult.model === PAID_RESULT_PROVIDER_FALLBACK_MODEL) {
      return "fallback";
    }

    return input.storedPaidResult.model ? "provider" : "unknown";
  }

  if (hasPaidResult(input.result)) {
    return "legacy";
  }

  return "unknown";
}

export function resolveUnlockPaidRouteState(input: {
  result: unknown;
  storedPaidResult?: {
    status?: string | null;
    paidResultJson?: unknown;
  } | null;
  fulfillmentStatus?: string | null;
}): UnlockPaidRouteState {
  const storedStatus = input.storedPaidResult?.status;

  if (storedStatus === "failed") {
    return "failed";
  }

  if (storedStatus === "expired") {
    return "expired";
  }

  if (storedStatus === "processing") {
    return "processing";
  }

  if (storedStatus === "pending") {
    return "requested";
  }

  if (storedStatus === "completed" && (input.storedPaidResult?.paidResultJson || hasPaidResult(input.result))) {
    return "completed";
  }

  if (input.storedPaidResult?.paidResultJson || hasPaidResult(input.result)) {
    return "completed";
  }

  if (isFulfillmentClaimed(input.fulfillmentStatus)) {
    return "claimed_missing";
  }

  return "not_requested";
}

function isFulfillmentClaimed(status?: string | null) {
  return status === "bound" || status === "delivered";
}

function getInitialPendingStatus(
  state: Exclude<UnlockPaidRouteState, "completed">,
): "missing" | "pending" | "processing" | "failed" {
  switch (state) {
    case "processing":
      return "processing";
    case "failed":
    case "expired":
      return "failed";
    case "requested":
    case "claimed_missing":
      return "pending";
    case "not_requested":
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
