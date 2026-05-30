import Link from "next/link";
import { Card } from "@/components/anyu/Card";
import { isDbConfigured } from "@/lib/db/client";
import { getPaymentIntentByMerchantOrderNo } from "@/lib/db/payment-intents";
import { getModuleBySlug } from "@/lib/modules/registry";

type ReturnPageProps = {
  params: Promise<{
    moduleSlug: string;
  }>;
  searchParams: Promise<{
    merchantOrderNo?: string;
  }>;
};

function PendingMessage({
  moduleSlug,
  status,
}: {
  moduleSlug: string;
  status?: string | null;
}) {
  return (
    <main className="anyu-shell">
      <Card>
        <p className="anyu-kicker">Payment pending</p>
        <h1 className="anyu-section-title">正在確認付款狀態</h1>
        <p className="anyu-copy">
          我們正在等待金流確認。這個頁面只顯示等待狀態，不會直接解鎖完整分析。
        </p>
        {status ? <p className="anyu-copy">目前狀態：{status}</p> : null}
        <p className="anyu-copy">
          若付款已完成但結果尚未出現，請稍後重新整理，或保留付款資訊聯繫客服協助確認。
        </p>
        <Link href={`/m/${moduleSlug}`} className="anyu-back-link">
          回到曖昧溫度計
        </Link>
      </Card>
    </main>
  );
}

export default async function NewebPayReturnPage({ params, searchParams }: ReturnPageProps) {
  const { moduleSlug } = await params;
  const { merchantOrderNo } = await searchParams;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig) {
    return <PendingMessage moduleSlug="ambiguous-temperature" />;
  }

  if (!merchantOrderNo || !isDbConfigured()) {
    return <PendingMessage moduleSlug={moduleConfig.slug} />;
  }

  const paymentIntent = await getPaymentIntentByMerchantOrderNo(merchantOrderNo);

  if (!paymentIntent || paymentIntent.moduleSlug !== moduleConfig.slug) {
    return <PendingMessage moduleSlug={moduleConfig.slug} />;
  }

  return <PendingMessage moduleSlug={moduleConfig.slug} status={paymentIntent.status} />;
}
