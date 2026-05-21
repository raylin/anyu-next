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
  const paidResult = result.paid_result;

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
          <p className="anyu-copy t-reading">{paidResult.deeper_signal_analysis}</p>
          <p className="anyu-copy t-reading">{paidResult.possible_interpretation}</p>
        </Card>

        <Card>
          <p className="anyu-kicker t-label-dim">reply strategy</p>
          <h2 className="anyu-section-title">三種不失控的回法</h2>
          <div className="anyu-signal-list">
            {Object.entries(paidResult.reply_strategies).map(([label, copy]) => (
              <article key={label} className="anyu-signal-item">
                <strong>{label}</strong>
                <p className="anyu-subtle-note">{copy}</p>
              </article>
            ))}
          </div>
        </Card>

        <Card>
          <p className="anyu-kicker t-label-dim">risk guardrail</p>
          <h2 className="anyu-section-title">先不要做的事</h2>
          <p className="anyu-copy t-reading">{paidResult.risk_warning}</p>
          <ul className="anyu-plain-list">
            {paidResult.what_not_to_do.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
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
