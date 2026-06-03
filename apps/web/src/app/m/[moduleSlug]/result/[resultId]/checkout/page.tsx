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
import { getPaymentRecoveryContactsByResultId } from "@/lib/db/payment-recovery-contacts";
import { createLineRecoveryBindHref } from "@/lib/line/recovery-bind-link";
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
  searchParams?: Promise<{
    recovery?: string;
    lineRecovery?: string;
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

async function getExistingRecoveryState(resultId: string) {
  try {
    const contacts = await getPaymentRecoveryContactsByResultId(resultId);
    const activeContacts = contacts.filter((contact) => contact.status !== "revoked");

    return {
      hasEmail: activeContacts.some((contact) => contact.contactType === "email"),
      hasLine: activeContacts.some((contact) => contact.contactType === "line"),
      hasAny: activeContacts.length > 0,
    };
  } catch {
    return {
      hasEmail: false,
      hasLine: false,
      hasAny: false,
    };
  }
}

function RecoverySoftGate({
  moduleSlug,
  resultId,
  paymentIntentId,
  recovery,
  lineRecovery,
  existingRecovery,
}: {
  moduleSlug: string;
  resultId: string;
  paymentIntentId: string;
  recovery?: string;
  lineRecovery?: string;
  existingRecovery: Awaited<ReturnType<typeof getExistingRecoveryState>>;
}) {
  const emailSaved = recovery === "email_saved" || existingRecovery.hasEmail;
  const emailError = recovery === "email_error";
  const lineSaved = lineRecovery === "line_saved" || existingRecovery.hasLine;
  const lineError = lineRecovery === "line_error";
  const lineBind = createLineRecoveryBindHref({
    moduleSlug,
    resultId,
    paymentIntentId,
    source: "checkout_start",
    returnPath: `/m/${moduleSlug}/result/${resultId}/checkout`,
  });
  const savedLabel = emailSaved
    ? "已保存到 Email"
    : lineSaved
      ? "已保存到 LINE"
      : null;

  return (
    <div className="anyu-recovery-soft-gate" aria-labelledby="payment-recovery-title">
      <div className="anyu-recovery-soft-gate-header">
        <div>
          <p className="anyu-kicker t-label-dim">report access link</p>
          <h2 id="payment-recovery-title" className="anyu-recovery-title">
            先保存查看連結
          </h2>
        </div>
        {savedLabel ? <span className="anyu-recovery-saved-badge">{savedLabel}</span> : null}
      </div>
      <p className="anyu-copy">
        付款完成後，我們會把完整報告的專屬查看連結寄到你的 Email 或傳到 LINE。之後即使關閉頁面，也可以在有效期限內從連結回到 ANYU 查看。
      </p>

      <div className="anyu-recovery-options">
        <form
          method="post"
          action={`/api/modules/${encodeURIComponent(moduleSlug)}/result/${encodeURIComponent(
            resultId,
          )}/recovery/email`}
          className="anyu-recovery-email-form"
        >
          <input type="hidden" name="paymentIntentId" value={paymentIntentId} />
          <label className="anyu-recovery-label" htmlFor="recovery-email">
            Email 查看連結
          </label>
          <div className="anyu-recovery-email-row">
            <input
              id="recovery-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="anyu-recovery-input"
              aria-describedby="recovery-email-help"
              required
            />
            <Button type="submit">用 Email 保存查看連結</Button>
          </div>
          <p id="recovery-email-help" className="anyu-subtle-note">
            Email 只會收到回到 ANYU 查看完整報告的連結，不會包含完整報告內容。
          </p>
          <label className="anyu-recovery-checkbox">
            <input type="checkbox" name="marketingOptIn" value="1" />
            <span>也想收到新測驗、早鳥或限時解鎖通知</span>
          </label>
          {emailError ? (
            <p className="anyu-recovery-error" role="status">
              Email 保存暫時失敗，但你仍可繼續付款；若之後找不到完整報告，請聯絡客服協助。
            </p>
          ) : null}
        </form>

        <div className="anyu-recovery-line-option" aria-label="LINE 查看連結選項">
          <div>
            <p className="anyu-recovery-label">LINE 查看連結</p>
            <p className="anyu-subtle-note">
              用 LINE 保存查看連結。之後可以從 LINE 回到 ANYU 查看完整報告；LINE 綁定失敗也不影響付款或查看報告。
            </p>
            {lineError ? (
              <p className="anyu-recovery-error" role="status">
                LINE 保存沒有完成。你仍可繼續付款，或改用 Email 保存。
              </p>
            ) : null}
          </div>
          {lineBind.ok ? (
            <Link href={lineBind.href} className="anyu-storefront-link">
              用 LINE 保存查看連結
            </Link>
          ) : (
            <span className="anyu-recovery-soon-badge">暫時無法啟動</span>
          )}
        </div>
      </div>

      {existingRecovery.hasAny || emailSaved || lineSaved ? (
        <p className="anyu-recovery-confirmation" role="status">
          已保存查看連結。你可以繼續前往藍新安全付款頁。
        </p>
      ) : (
        <div className="anyu-recovery-skip-warning">
          <p className="anyu-kicker t-label-dim">skip allowed</p>
          <p>
            你仍然可以繼續付款。但如果未保存查看連結，關閉頁面或更換裝置後，可能需要聯絡客服協助查詢。
          </p>
        </div>
      )}
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

export default async function CheckoutStartPage({ params, searchParams }: CheckoutStartPageProps) {
  const { moduleSlug, resultId } = await params;
  const query = await searchParams;
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
  const existingRecovery = await getExistingRecoveryState(resultId);
  const recoverySaved = query?.recovery === "email_saved" || existingRecovery.hasAny;

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
        <RecoverySoftGate
          moduleSlug={moduleConfig.slug}
          resultId={resultId}
          paymentIntentId={checkout.paymentIntent.id}
          recovery={query?.recovery}
          lineRecovery={query?.lineRecovery}
          existingRecovery={existingRecovery}
        />
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
          {recoverySaved ? null : (
            <label className="anyu-recovery-provider-ack">
              <input type="checkbox" required />
              <span>我了解尚未保存查看連結，仍要繼續付款。</span>
            </label>
          )}
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
