import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/components/anyu/Card";
import { LegalFooter } from "@/components/anyu/LegalFooter";
import { TemperatureCard } from "@/components/anyu/TemperatureCard";
import { Wordmark } from "@/components/anyu/Wordmark";
import { PaidResultPendingPoller } from "@/components/modules/ai-temperature/PaidResultPendingPoller";
import { ModuleThemeBoundary } from "@/components/modules/ai-temperature/ModuleThemeFrame";
import { LEGAL_CONTACT_EMAIL, uiNotices } from "@/content/legal";
import {
  UnlockedResultViewTracker,
  type UnlockedPaidResultSource,
} from "@/components/modules/ai-temperature/UnlockedResultViewTracker";
import { isDbConfigured } from "@/lib/db/client";
import {
  createOrUpdatePostPaymentEmailRecoveryContact,
  getPaymentRecoveryStatusSummary,
  type PaymentRecoveryStatusSummary,
} from "@/lib/db/payment-recovery-contacts";
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
import { createAndSendEmailRecoveryLink } from "@/lib/notifications/email-recovery-link";
import type { ProductModuleConfig } from "@/lib/modules/types";
import {
  hasPaidResult,
  normalizePaidResultForDisplay,
  type PaidResultEvidenceSummary,
  type ProductResult,
} from "@/lib/ai/product-result-schema";
import {
  PAID_RESULT_PROMPT_VERSION,
  PAID_RESULT_PROVIDER_FALLBACK_MODEL,
  PAID_RESULT_SCHEMA_VERSION,
} from "@/lib/ai/paid-result-generation";
import {
  resolvePaidAccessToken,
  type PaidAccessResolution,
} from "@/lib/payments/paid-access-resolver";
import { hasPaidAccessTokenPrefix } from "@/lib/payments/paid-access-token";
import { RecoveryContactConfigError } from "@/lib/payments/recovery-contact-crypto";

type UnlockPageProps = {
  params: Promise<{
    moduleSlug: string;
    unlockToken: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type PaidAccessResolved = Extract<PaidAccessResolution, { ok: true }>;

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

  if (hasPaidAccessTokenPrefix(unlockToken)) {
    const paidAccess = await resolvePaidAccessToken({
      moduleSlug,
      rawToken: unlockToken,
    });

    if (!paidAccess.ok) {
      return (
        <UnlockError
          moduleConfig={moduleConfig}
          initialTheme={initialTheme}
          message="這組完整分析連結無效，請確認你開啟的是最新的付款完成連結。"
        />
      );
    }

    const terminalMessage = getPaidAccessTerminalMessage(paidAccess.state);

    if (terminalMessage) {
      return (
        <UnlockError
          moduleConfig={moduleConfig}
          initialTheme={initialTheme}
          message={terminalMessage}
        />
      );
    }

    if (paidAccess.state !== "ready") {
      return (
        <UnlockPending
          moduleConfig={moduleConfig}
          initialTheme={initialTheme}
          unlockToken={unlockToken}
          initialStatus={getPaidAccessInitialPendingStatus(paidAccess.state)}
        />
      );
    }

    const recoverySummary = await getPaymentRecoveryStatusSummary({
      moduleSlug,
      analysisResultId: paidAccess.entitlement.analysisResultId,
      paymentIntentId: paidAccess.entitlement.paymentIntentId,
      entitlementId: paidAccess.entitlement.id,
    });
    const resolvedAnalysisResultId = paidAccess.entitlement.analysisResultId;
    const resolvedPaymentIntentId = paidAccess.entitlement.paymentIntentId;
    const resolvedEntitlementId = paidAccess.entitlement.id;
    const resolvedModuleSlug = moduleSlug;
    const resolvedModuleTitle = moduleConfig.title;
    const resolvedUnlockToken = unlockToken;

    async function savePaidAccessRecoveryEmail(formData: FormData) {
      "use server";

      const email = formData.get("email");
      const marketingOptIn = formData.get("marketingOptIn") === "1";
      const redirectPath = `/m/${resolvedModuleSlug}/unlock/${encodeURIComponent(
        resolvedUnlockToken,
      )}`;

      if (typeof email !== "string" || !email.trim()) {
        redirect(`${redirectPath}?recovery=email_error`);
      }

      let recoveryState = "email_saved";

      try {
        const recoveryContact = await createOrUpdatePostPaymentEmailRecoveryContact({
          moduleSlug: resolvedModuleSlug,
          analysisResultId: resolvedAnalysisResultId,
          paymentIntentId: resolvedPaymentIntentId,
          entitlementId: resolvedEntitlementId,
          email,
          source: "completed_result",
          marketingOptInAt: marketingOptIn ? new Date() : null,
        });
        const sendResult = await createAndSendEmailRecoveryLink({
          moduleSlug: resolvedModuleSlug,
          moduleTitle: resolvedModuleTitle,
          analysisResultId: resolvedAnalysisResultId,
          paymentIntentId: resolvedPaymentIntentId,
          entitlementId: resolvedEntitlementId,
          recoveryContact,
        }).catch(() => null);

        if (sendResult?.status === "sent") {
          recoveryState = "email_sent";
        }
      } catch (error) {
        if (error instanceof RecoveryContactConfigError) {
          redirect(`${redirectPath}?recovery=email_error`);
        }

        redirect(`${redirectPath}?recovery=email_error`);
      }

      redirect(`${redirectPath}?recovery=${recoveryState}`);
    }

    return (
      <UnlockCompleted
        moduleConfig={moduleConfig}
        moduleSlug={moduleSlug}
        initialTheme={initialTheme}
        result={paidAccess.record.result.normalizedResultJson}
        storedPaidResult={paidAccess.storedPaidResult}
        anonymousSessionId={paidAccess.record.request.anonymousSessionId}
        scoreBucket={paidAccess.record.result.scoreBucket}
        resultCreatedAt={paidAccess.record.result.createdAt}
        themeCarryoverSource="paid_access_token"
        recoverySummary={recoverySummary}
        recoveryState={getSingleSearchParam(resolvedSearchParams?.recovery)}
        recoveryEmailAction={savePaidAccessRecoveryEmail}
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

  return (
    <UnlockCompleted
      moduleConfig={moduleConfig}
      moduleSlug={moduleSlug}
      initialTheme={initialTheme}
      result={result}
      storedPaidResult={storedPaidResult}
      anonymousSessionId={record.unlockIntent.anonymousSessionId}
      scoreBucket={record.result.scoreBucket}
      resultCreatedAt={record.result.createdAt}
      themeCarryoverSource={initialTheme ? "unlock_intent" : null}
    />
  );
}

export function UnlockCompleted({
  moduleConfig,
  moduleSlug,
  initialTheme,
  result,
  storedPaidResult,
  anonymousSessionId,
  scoreBucket,
  resultCreatedAt,
  themeCarryoverSource,
  recoverySummary,
  recoveryState,
  recoveryEmailAction,
}: {
  moduleConfig: ProductModuleConfig;
  moduleSlug: string;
  initialTheme?: ModuleThemeState | null;
  result: ProductResult;
  storedPaidResult?: {
    status?: string | null;
    model?: string | null;
    paidResultJson?: unknown;
  } | null;
  anonymousSessionId?: string | null;
  scoreBucket?: string | null;
  resultCreatedAt?: Date | string | null;
  themeCarryoverSource?: string | null;
  recoverySummary?: PaymentRecoveryStatusSummary | null;
  recoveryState?: string | null;
  recoveryEmailAction?: (formData: FormData) => Promise<void>;
}) {
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
            anonymousSessionId={anonymousSessionId}
            scoreBucket={scoreBucket}
            themeVariant={initialTheme?.variant ?? "unknown"}
            themeSource={initialTheme?.source ?? "unknown"}
            themeCarryoverSource={themeCarryoverSource}
            paidResultSource={getUnlockedPaidResultSource({ storedPaidResult, result })}
            resultAgeBucket={getResultAgeBucket(resultCreatedAt)}
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
            <p className="anyu-copy">
              這是依照剛剛結果整理出的完整回覆建議。{uiNotices.paidUnlockNote}
            </p>
            <p className="anyu-subtle-note">
              本結果是文字情境整理與溝通建議，不是心理治療、諮商、命理判斷，也不保證任何關係結果。
            </p>
          </Card>

          <PaidResultRecoverySaveSection
            recoverySummary={recoverySummary}
            recoveryState={recoveryState}
            recoveryEmailAction={recoveryEmailAction}
          />

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

function PaidResultRecoverySaveSection({
  recoverySummary,
  recoveryState,
  recoveryEmailAction,
}: {
  recoverySummary?: PaymentRecoveryStatusSummary | null;
  recoveryState?: string | null;
  recoveryEmailAction?: (formData: FormData) => Promise<void>;
}) {
  if (!recoveryEmailAction && !recoverySummary) {
    return null;
  }

  const emailSent = recoveryState === "email_sent";
  const emailSaved = emailSent || recoveryState === "email_saved" || recoverySummary?.hasRecoveryContact;
  const emailError =
    recoveryState === "email_error" ||
    recoverySummary?.recommendedPostPaymentAction === "retry_email";

  if (emailSaved) {
    return (
      <Card className="anyu-recovery-soft-gate" aria-labelledby="paid-result-recovery-title">
        <div className="anyu-recovery-soft-gate-header">
          <div>
            <p className="anyu-kicker t-label-dim">result recovery</p>
            <h2 id="paid-result-recovery-title" className="anyu-recovery-title">
              這份完整分析已保存
            </h2>
          </div>
          <span className="anyu-recovery-saved-badge">已保存</span>
        </div>
        <p className="anyu-copy">
          {recoverySummary?.safeDisplayContact
            ? `已保存找回方式：${recoverySummary.safeDisplayContact.maskedValue}`
            : "之後若換裝置或找不到頁面，可透過已保存的方式協助找回。"}
        </p>
        <p className="anyu-subtle-note">
          {emailSent
            ? "已準備並寄出找回連結；完整報告仍以此網頁查看為準，Email 不包含報告內容。"
            : "Email / LINE 只作為找回、完成通知與客服協助；完整報告仍以此網頁查看為準。"}
        </p>
      </Card>
    );
  }

  return (
    <Card className="anyu-recovery-soft-gate" aria-labelledby="paid-result-recovery-title">
      <div className="anyu-recovery-soft-gate-header">
        <div>
          <p className="anyu-kicker t-label-dim">result recovery</p>
          <h2 id="paid-result-recovery-title" className="anyu-recovery-title">
            保存這份完整分析
          </h2>
        </div>
        <span className="anyu-recovery-soon-badge">建議保存</span>
      </div>
      <p className="anyu-copy">
        之後換裝置、關閉頁面或清除瀏覽資料時，可以用 Email 協助找回。完整報告仍以網頁查看為準，Email 不會交付報告內容。
      </p>

      {recoveryEmailAction ? (
        <form action={recoveryEmailAction} className="anyu-recovery-email-form">
          <label className="anyu-recovery-label" htmlFor="paid-result-recovery-email">
            Email 找回
          </label>
          <div className="anyu-recovery-email-row">
            <input
              id="paid-result-recovery-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="anyu-recovery-input"
              aria-describedby="paid-result-recovery-email-help"
              required
            />
            <button type="submit" className="anyu-button">
              保存
            </button>
          </div>
          <p id="paid-result-recovery-email-help" className="anyu-subtle-note">
            保存後會準備一個找回連結；若 Email 寄送服務尚未啟用，系統仍會先保存找回方式。Email 不會包含完整報告內容。
          </p>
          <label className="anyu-recovery-checkbox">
            <input type="checkbox" name="marketingOptIn" value="1" />
            <span>也想收到新測驗、早鳥或限時解鎖通知</span>
          </label>
          {emailError ? (
            <p className="anyu-recovery-error" role="status">
              Email 保存暫時沒有成功，但不影響你查看完整報告。可以稍後再試，或來信{" "}
              <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a> 協助。
            </p>
          ) : null}
        </form>
      ) : (
        <p className="anyu-subtle-note">
          找回功能暫時無法使用；若之後找不到完整報告，請來信{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a> 協助。
        </p>
      )}

      <div className="anyu-recovery-line-option" aria-label="LINE 找回選項">
        <div>
          <p className="anyu-recovery-label">LINE 找回</p>
          <p className="anyu-subtle-note">
            LINE 之後會作為找回、完成通知與客服輔助，不是完整報告的交付管道。
          </p>
        </div>
        <span className="anyu-recovery-soon-badge">稍後支援</span>
      </div>
    </Card>
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

function getPaidAccessInitialPendingStatus(
  state: Exclude<PaidAccessResolved["state"], "ready">,
): "missing" | "pending" | "processing" | "failed" {
  switch (state) {
    case "processing":
      return "processing";
    case "failed":
    case "expired":
    case "revoked":
    case "refunded":
      return "failed";
    case "pending":
    case "missing_generation_job":
    case "recovery_required":
      return "pending";
  }
}

function getPaidAccessTerminalMessage(state: PaidAccessResolved["state"]) {
  switch (state) {
    case "expired":
      return "這組完整分析連結已過期。若你已完成付款，請聯絡客服協助補發。";
    case "revoked":
      return "這組完整分析連結目前已停止使用。若你認為這是錯誤，請聯絡客服。";
    case "refunded":
      return "這組完整分析連結已因退款而停止使用。若你需要協助，請聯絡客服。";
    default:
      return null;
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

function getSingleSearchParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
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
