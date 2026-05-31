import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";
import { LegalFooter } from "@/components/anyu/LegalFooter";
import { Wordmark } from "@/components/anyu/Wordmark";
import { ModuleThemeBoundary } from "@/components/modules/ai-temperature/ModuleThemeFrame";
import { LEGAL_CONTACT_EMAIL } from "@/content/legal";
import { isDbConfigured } from "@/lib/db/client";
import { getModuleBySlug } from "@/lib/modules/registry";
import type { ProductModuleConfig } from "@/lib/modules/types";
import { createNewebPayCheckout } from "@/lib/payments/newebpay/checkout-service";
import { canStartNewebPayCheckoutFromResult } from "@/lib/runtime/feature-flags";

export const dynamic = "force-dynamic";

type CheckoutStartPageProps = {
  params: Promise<{
    moduleSlug: string;
    resultId: string;
  }>;
};

function CheckoutBridgeShell({
  moduleConfig,
  resultId,
  children,
}: {
  moduleConfig: ProductModuleConfig;
  resultId?: string;
  children: ReactNode;
}) {
  const backHref = resultId
    ? `/m/${moduleConfig.slug}/result/${resultId}`
    : `/m/${moduleConfig.slug}`;
  const backLabel = resultId ? "返回免費結果" : "回到曖昧溫度計";

  return (
    <main className="anyu-shell">
      <ModuleThemeBoundary
        moduleConfig={moduleConfig}
        surface="unlock"
        showThemeToggle={false}
      >
        <section className="anyu-result-stack anyu-checkout-bridge">
          <div className="anyu-result-topbar">
            <Link href={backHref} className="anyu-back-link">
              ← {backLabel}
            </Link>
            <Wordmark showMark />
          </div>
          {children}
          <LegalFooter />
        </section>
      </ModuleThemeBoundary>
    </main>
  );
}

function ModuleCheckoutIdentity({ moduleConfig }: { moduleConfig: ProductModuleConfig }) {
  return (
    <Card className="anyu-checkout-identity-card">
      <div className="anyu-checkout-identity-copy">
        <p className="anyu-kicker">MODULE 01</p>
        <h1 className="anyu-section-title">{moduleConfig.title}</h1>
        <p className="anyu-copy">完整報告 · 下一句怎麼回</p>
      </div>
      <ol className="anyu-checkout-stepper" aria-label="付款流程">
        {["付款", "生成", "完成"].map((step, index) => (
          <li
            key={step}
            className={index === 0 ? "anyu-checkout-step is-active" : "anyu-checkout-step"}
          >
            <span>{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
    </Card>
  );
}

function OrderSummary({ moduleConfig }: { moduleConfig: ProductModuleConfig }) {
  return (
    <div className="anyu-checkout-order-summary" aria-label="訂單摘要">
      <div>
        <p className="anyu-kicker t-label-dim">order summary</p>
        <h2 className="anyu-checkout-order-title">{moduleConfig.title}｜完整報告</h2>
      </div>
      <dl className="anyu-checkout-order-list">
        <div>
          <dt>內容</dt>
          <dd>完整報告</dd>
        </div>
        <div>
          <dt>付款</dt>
          <dd>一次性付款</dd>
        </div>
        <div>
          <dt>訂閱</dt>
          <dd>非訂閱制</dd>
        </div>
        <div className="anyu-checkout-order-total">
          <dt>金額</dt>
          <dd>{moduleConfig.price}</dd>
        </div>
      </dl>
    </div>
  );
}

function CheckoutTrustBridge() {
  return (
    <div className="anyu-checkout-trust-bridge">
      <p className="anyu-kicker t-label-dim">NewebPay secure payment</p>
      <p>你將前往藍新金流完成安全付款。</p>
      <p>付款完成後，我們會等候藍新的正式通知，再為你準備完整報告。</p>
    </div>
  );
}

function CheckoutUnavailable({
  moduleConfig,
  title = "完整報告即將開放",
  message = "完整報告解鎖功能準備中。正式開放後，可使用 NT$49 單次付款解鎖完整 AI 關係互動分析報告。",
}: {
  moduleConfig: ProductModuleConfig;
  title?: string;
  message?: string;
}) {
  return (
    <CheckoutBridgeShell moduleConfig={moduleConfig}>
      <ModuleCheckoutIdentity moduleConfig={moduleConfig} />
      <Card className="anyu-checkout-main-card">
        <p className="anyu-kicker">checkout unavailable</p>
        <h2 className="anyu-section-title">{title}</h2>
        <p className="anyu-copy">{message}</p>
        <p className="anyu-subtle-note">
          若付款、連結或報告產生異常，請來信{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>，我們會在 3–7 個工作天內回覆處理結果。
        </p>
        <div className="anyu-paid-policy-actions">
          <Link href={`/m/${moduleConfig.slug}`} className="anyu-storefront-link">
            回到曖昧溫度計
          </Link>
          <Link href="/refund" className="anyu-storefront-link">
            查看退款政策
          </Link>
        </div>
      </Card>
    </CheckoutBridgeShell>
  );
}

export default async function CheckoutStartPage({ params }: CheckoutStartPageProps) {
  const { moduleSlug, resultId } = await params;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig) {
    notFound();
  }

  if (!canStartNewebPayCheckoutFromResult()) {
    return <CheckoutUnavailable moduleConfig={moduleConfig} />;
  }

  if (!isDbConfigured()) {
    return (
      <CheckoutUnavailable
        moduleConfig={moduleConfig}
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
        moduleConfig={moduleConfig}
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
    <CheckoutBridgeShell moduleConfig={moduleConfig} resultId={resultId}>
      <ModuleCheckoutIdentity moduleConfig={moduleConfig} />
      <Card className="anyu-checkout-main-card anyu-paid-card">
        <div className="anyu-checkout-main-copy">
          <p className="anyu-kicker">secure checkout</p>
          <h2 className="anyu-section-title">前往藍新安全付款頁</h2>
          <p className="anyu-copy">
            你即將解鎖「{moduleConfig.title}」完整報告。單次付款 NT$49，非訂閱制。
          </p>
          <p className="anyu-copy">
            付款完成並由金流正式通知後，完整報告將於網頁中提供查看。返回頁只顯示確認狀態，不會直接判定付款成功。
          </p>
        </div>

        <OrderSummary moduleConfig={moduleConfig} />
        <CheckoutTrustBridge />

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
    </CheckoutBridgeShell>
  );
}
