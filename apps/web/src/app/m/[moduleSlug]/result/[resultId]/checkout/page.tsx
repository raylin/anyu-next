import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";
import { LegalFooter } from "@/components/anyu/LegalFooter";
import { LEGAL_CONTACT_EMAIL } from "@/content/legal";
import { isDbConfigured } from "@/lib/db/client";
import { getModuleBySlug } from "@/lib/modules/registry";
import { createNewebPayCheckout } from "@/lib/payments/newebpay/checkout-service";
import { canStartNewebPayCheckoutFromResult } from "@/lib/runtime/feature-flags";

export const dynamic = "force-dynamic";

type CheckoutStartPageProps = {
  params: Promise<{
    moduleSlug: string;
    resultId: string;
  }>;
};

function CheckoutUnavailable({
  moduleSlug,
  title = "完整報告即將開放",
  message = "完整報告解鎖功能準備中。正式開放後，可使用 NT$49 單次付款解鎖完整 AI 關係互動分析報告。",
}: {
  moduleSlug: string;
  title?: string;
  message?: string;
}) {
  return (
    <main className="anyu-shell">
      <section className="anyu-result-stack">
        <Card>
          <p className="anyu-kicker">checkout unavailable</p>
          <h1 className="anyu-section-title">{title}</h1>
          <p className="anyu-copy">{message}</p>
          <p className="anyu-subtle-note">
            若付款、連結或報告產生異常，請來信{" "}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>，我們會在 3–7 個工作天內回覆處理結果。
          </p>
          <div className="anyu-paid-policy-actions">
            <Link href={`/m/${moduleSlug}`} className="anyu-storefront-link">
              回到曖昧溫度計
            </Link>
            <Link href="/refund" className="anyu-storefront-link">
              查看退款政策
            </Link>
          </div>
        </Card>
        <LegalFooter />
      </section>
    </main>
  );
}

export default async function CheckoutStartPage({ params }: CheckoutStartPageProps) {
  const { moduleSlug, resultId } = await params;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig) {
    notFound();
  }

  if (!canStartNewebPayCheckoutFromResult()) {
    return <CheckoutUnavailable moduleSlug={moduleConfig.slug} />;
  }

  if (!isDbConfigured()) {
    return (
      <CheckoutUnavailable
        moduleSlug={moduleConfig.slug}
        title="付款功能暫時無法使用"
        message="目前付款服務尚未設定完成，請稍後再試。"
      />
    );
  }

  const checkout = await createNewebPayCheckout({
    moduleConfig,
    resultId,
  });

  if (!checkout.ok) {
    return (
      <CheckoutUnavailable
        moduleSlug={moduleConfig.slug}
        title={
          checkout.error === "source_result_not_found"
            ? "找不到這份分析結果"
            : "付款連結暫時無法建立"
        }
        message={
          checkout.error === "source_result_not_found"
            ? "這份分析可能已過期，或連結不完整。請回到測驗重新產生結果。"
            : "目前付款連結暫時無法建立。若問題持續，請聯絡客服協助。"
        }
      />
    );
  }

  const { checkoutContract } = checkout;

  return (
    <main className="anyu-shell">
      <section className="anyu-result-stack">
        <Card>
          <p className="anyu-kicker">secure checkout</p>
          <h1 className="anyu-section-title">前往藍新安全付款頁</h1>
          <p className="anyu-copy">
            你即將解鎖「{moduleConfig.title}」完整報告。單次付款 NT$49，非訂閱制。
          </p>
          <p className="anyu-copy">
            付款完成並由金流正式通知後，完整報告將於網頁中提供查看。返回頁只顯示確認狀態，不會直接判定付款成功。
          </p>

          <div className="anyu-paid-policy-panel">
            <p className="anyu-kicker t-label-dim">交付與退款</p>
            <ul className="anyu-paid-policy-list">
              <li>完整報告會在付款確認後於網頁提供查看。</li>
              <li>若付款成功但報告未產生、連結無法開啟或重複付款，可協助補發或退款。</li>
              <li>
                客服信箱：<a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>，3–7 個工作天內回覆處理結果。
              </li>
            </ul>
          </div>

          <form method={checkoutContract.method} action={checkoutContract.actionUrl}>
            {Object.entries(checkoutContract.fields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <Button type="submit" className="anyu-button-block">
              前往藍新安全付款頁
            </Button>
          </form>

          <p className="anyu-subtle-note">
            請只在藍新付款頁輸入付款資訊。暗語 ANYU 不會向你索取完整卡號、密碼或任何支付驗證碼。
          </p>

          <div className="anyu-paid-policy-actions">
            <Link href={`/m/${moduleConfig.slug}/result/${resultId}`} className="anyu-storefront-link">
              返回免費結果
            </Link>
            <Link href="/refund" className="anyu-storefront-link">
              查看退款政策
            </Link>
          </div>
        </Card>
        <LegalFooter />
      </section>
    </main>
  );
}
