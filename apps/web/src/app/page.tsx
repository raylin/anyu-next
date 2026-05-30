import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/anyu/Wordmark";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";
import { LegalFooter } from "@/components/anyu/LegalFooter";
import { LEGAL_CONTACT_EMAIL } from "@/content/legal";

export const metadata: Metadata = {
  title: "曖昧溫度計｜AI 關係互動分析報告 | 暗語 ANYU",
  description:
    "暗語 ANYU 的曖昧溫度計提供 AI 輔助關係互動分析，包含免費初步分析與 NT$49 單次完整報告解鎖說明。",
};

const includedItems = [
  "免費初步分析：曖昧溫度、關係訊號與下一步提醒",
  "完整報告：3 種可能狀態、回覆策略與 48 小時觀察建議",
  "分析依據線索摘要：整理使用者提供情境中的關鍵互動訊號",
  "網頁交付：付款確認後於網頁提供完整分析；處理中會顯示等待狀態",
];

const refundItems = [
  "重複付款可聯絡客服申請協助退款。",
  "付款成功但完整報告未產生，或付費結果連結因系統問題無法開啟，可協助補發或退款。",
  "若為明確付款或系統異常，請提供付款時間、訂單資訊或錯誤狀況，無需提供原始對話內容。",
  "完整數位報告已成功產生並可查看後，通常不因主觀喜好或解讀感受提供退款。",
];

export default function Home() {
  return (
    <main className="anyu-shell anyu-storefront-shell">
      <section className="anyu-storefront">
        <header className="anyu-storefront-topbar">
          <Wordmark />
          <Link href="/legal" className="anyu-back-link">
            法律與說明
          </Link>
        </header>

        <section className="anyu-storefront-hero" aria-labelledby="storefront-title">
          <div className="anyu-storefront-copy">
            <p className="anyu-kicker">AI relationship report</p>
            <h1 id="storefront-title" className="anyu-title">
              曖昧溫度計｜AI 關係互動分析報告
            </h1>
            <p className="anyu-copy">
              暗語 ANYU 提供數位 AI 輔助關係互動分析服務。你可以輸入一段曖昧互動情境，
              先取得免費初步分析；正式解鎖後，可查看更完整的 AI 生成解讀報告。
            </p>
            <div className="anyu-storefront-actions">
              <Button asChild href="/m/ambiguous-temperature">
                開始免費初步分析
              </Button>
              <Link href="/refund" className="anyu-storefront-link">
                查看退款與補發政策
              </Link>
            </div>
          </div>

          <Card className="anyu-product-preview-card" aria-label="曖昧溫度計產品預覽">
            <div className="anyu-product-preview-head">
              <span className="anyu-kicker">product preview</span>
              <span className="anyu-product-preview-price">NT$ 49</span>
            </div>
            <div className="anyu-product-preview-meter" aria-hidden="true">
              <span />
            </div>
            <div className="anyu-product-preview-body">
              <p className="anyu-product-preview-label">完整報告範例區塊</p>
              <h2 className="anyu-section-title">他的回覆變慢，是冷掉還是在觀察？</h2>
              <p className="anyu-copy">
                報告會整理互動節奏、可能狀態、可直接使用的回覆方向，以及接下來 48 小時的觀察重點。
              </p>
            </div>
            <div className="anyu-product-preview-grid" aria-hidden="true">
              <span>3 種可能狀態</span>
              <span>回覆策略</span>
              <span>48 小時建議</span>
              <span>依據線索摘要</span>
            </div>
          </Card>
        </section>

        <section className="anyu-storefront-grid" aria-label="service details">
          <Card>
            <span className="anyu-kicker">service</span>
            <h2 className="anyu-section-title">服務內容</h2>
            <ul className="anyu-legal-list">
              {includedItems.map((item) => (
                <li key={item} className="anyu-copy">
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <span className="anyu-kicker">price</span>
            <h2 className="anyu-section-title">價格與收費方式</h2>
            <p className="anyu-copy">
              單次完整報告解鎖：NT$ 49。採一次性付款，非訂閱制，不會產生週期性收費。
            </p>
            <p className="anyu-small-note">
              付款功能依審核與上線狀態開放；正式付款完成並確認後，完整報告會於網頁交付。
            </p>
          </Card>

          <Card>
            <span className="anyu-kicker">delivery</span>
            <h2 className="anyu-section-title">交付方式</h2>
            <p className="anyu-copy">
              付款完成並確認後，系統會提供網頁完整報告；若 AI 產生內容需要處理時間，頁面會顯示處理中狀態，完成後即可查看。
            </p>
          </Card>

          <Card>
            <span className="anyu-kicker">refund</span>
            <h2 className="anyu-section-title">退款與補發</h2>
            <ul className="anyu-legal-list">
              {refundItems.map((item) => (
                <li key={item} className="anyu-copy">
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/refund" className="anyu-storefront-link">
              查看完整退款政策
            </Link>
          </Card>
        </section>

        <Card className="anyu-storefront-note">
          <span className="anyu-kicker">support</span>
          <h2 className="anyu-section-title">聯絡與服務限制</h2>
          <p className="anyu-copy">
            付款、連結、結果產生或資料處理問題，請來信{" "}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>。暗語 ANYU 是文字情境整理與溝通建議，
            不是心理治療、諮商、命理或關係結果保證。
          </p>
        </Card>

        <LegalFooter />
      </section>
    </main>
  );
}
