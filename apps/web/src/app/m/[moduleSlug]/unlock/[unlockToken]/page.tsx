import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/anyu/Card";
import { LegalFooter } from "@/components/anyu/LegalFooter";
import { TemperatureCard } from "@/components/anyu/TemperatureCard";
import { Wordmark } from "@/components/anyu/Wordmark";
import { isDbConfigured } from "@/lib/db/client";
import { getUnlockIntentByTokenHash } from "@/lib/db/runtime";
import { hashFulfillmentSecret, isExpired } from "@/lib/line/fulfillment";
import { getModuleBySlug } from "@/lib/modules/registry";
import { hasPaidResult, normalizePaidResultForDisplay } from "@/lib/ai/product-result-schema";

type UnlockPageProps = {
  params: Promise<{
    moduleSlug: string;
    unlockToken: string;
  }>;
};

export default async function UnlockPage({ params }: UnlockPageProps) {
  const { moduleSlug, unlockToken } = await params;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig) {
    notFound();
  }

  if (!isDbConfigured()) {
    return <UnlockError moduleSlug={moduleSlug} message="完整分析服務尚未設定完成，請稍後再試。" />;
  }

  const record = await getUnlockIntentByTokenHash(hashFulfillmentSecret(unlockToken));

  if (!record || record.unlockIntent.themeSlug !== moduleSlug) {
    return <UnlockError moduleSlug={moduleSlug} message="這組完整分析連結無效，請回到結果頁重新領取。" />;
  }

  if (isExpired(record.unlockIntent.unlockTokenExpiresAt)) {
    return <UnlockError moduleSlug={moduleSlug} message="這組完整分析連結已過期，請回到結果頁重新領取。" />;
  }

  const result = record.result.normalizedResultJson;

  if (!hasPaidResult(result)) {
    return <UnlockPending moduleSlug={moduleSlug} />;
  }

  const paidResult = normalizePaidResultForDisplay(result.paid_result);

  return (
    <main className="anyu-shell">
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
                <p className="anyu-subtle-note">可能性：{state.likelihood}</p>
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
    </main>
  );
}

function UnlockPending({ moduleSlug }: { moduleSlug: string }) {
  return (
    <main className="anyu-shell">
      <section className="anyu-result-stack">
        <div className="anyu-result-topbar">
          <Link href={`/m/${moduleSlug}`} className="anyu-back-link">
            ← 回到測驗
          </Link>
          <Wordmark showMark />
        </div>
        <Card className="anyu-quote-card">
          <p className="anyu-kicker">完整分析</p>
          <h1 className="anyu-section-title">完整分析目前仍在封測流程中</h1>
          <p className="anyu-copy">
            你的免費分析已經完成。完整分析的自動整理與 LINE 通知會在下一階段接上；目前請先回到結果頁保留這份免費結果。
          </p>
          <Link href={`/m/${moduleSlug}`} className="anyu-back-link">
            回到輸入頁
          </Link>
        </Card>
        <LegalFooter />
      </section>
    </main>
  );
}

function UnlockError({ moduleSlug, message }: { moduleSlug: string; message: string }) {
  return (
    <main className="anyu-shell">
      <section className="anyu-result-stack">
        <div className="anyu-result-topbar">
          <Link href={`/m/${moduleSlug}`} className="anyu-back-link">
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
    </main>
  );
}
