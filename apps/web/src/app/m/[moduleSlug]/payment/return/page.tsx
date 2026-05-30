import Link from "next/link";
import { Card } from "@/components/anyu/Card";
import { isDbConfigured } from "@/lib/db/client";
import { getModuleBySlug } from "@/lib/modules/registry";
import { resolvePaymentAccessHandoff } from "@/lib/payments/payment-access-handoff";

type ReturnPageProps = {
  params: Promise<{
    moduleSlug: string;
  }>;
  searchParams: Promise<{
    merchantOrderNo?: string;
    checkoutToken?: string;
  }>;
};

function PendingMessage({
  moduleSlug,
  state,
  accessPath,
}: {
  moduleSlug: string;
  state?: string | null;
  accessPath?: string | null;
}) {
  const isReady = state === "paid_ready" && accessPath;

  return (
    <main className="anyu-shell">
      <Card>
        <p className="anyu-kicker">Payment pending</p>
        <h1 className="anyu-section-title">
          {isReady ? "付款已確認" : "正在確認付款狀態"}
        </h1>
        <p className="anyu-copy">
          {isReady
            ? "完整分析已準備好，請使用下方安全連結繼續查看。"
            : "我們正在等待金流確認。這個頁面只顯示等待狀態，不會直接解鎖完整分析。"}
        </p>
        {state ? <p className="anyu-copy">目前狀態：{state}</p> : null}
        <p className="anyu-copy">
          若付款已完成但結果尚未出現，請稍後重新整理，或保留付款資訊聯繫客服協助確認。
        </p>
        {isReady ? (
          <Link href={accessPath} className="anyu-button">
            查看完整分析
          </Link>
        ) : null}
        <Link href={`/m/${moduleSlug}`} className="anyu-back-link">
          回到曖昧溫度計
        </Link>
      </Card>
    </main>
  );
}

export default async function NewebPayReturnPage({ params, searchParams }: ReturnPageProps) {
  const { moduleSlug } = await params;
  const { checkoutToken } = await searchParams;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig) {
    return <PendingMessage moduleSlug="ambiguous-temperature" />;
  }

  if (!checkoutToken || !isDbConfigured()) {
    return <PendingMessage moduleSlug={moduleConfig.slug} />;
  }

  const handoff = await resolvePaymentAccessHandoff({
    moduleSlug: moduleConfig.slug,
    checkoutToken,
  });

  if (!handoff.ok) {
    return <PendingMessage moduleSlug={moduleConfig.slug} state={handoff.state} />;
  }

  return (
    <PendingMessage
      moduleSlug={moduleConfig.slug}
      state={handoff.state}
      accessPath={handoff.accessPath}
    />
  );
}
