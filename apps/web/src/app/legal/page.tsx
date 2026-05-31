import Link from "next/link";
import type { Metadata } from "next";
import { Wordmark } from "@/components/anyu/Wordmark";
import { LEGAL_CONTACT_EMAIL, legalLinks } from "@/content/legal";

export const metadata: Metadata = {
  title: "法律與說明 | 暗語 ANYU",
  description: "暗語 ANYU 退款政策、隱私權政策、使用條款與免責聲明。",
};

export default function LegalIndexPage() {
  return (
    <main className="anyu-shell anyu-legal-shell">
      <section className="anyu-legal-page">
        <header className="anyu-legal-header">
          <div className="anyu-legal-header-top">
            <Link href="/m/ambiguous-temperature" className="anyu-back-link">
              ← 回到曖昧溫度計
            </Link>
            <Wordmark className="anyu-wordmark-quiet" />
          </div>
          <div className="anyu-legal-header-copy">
            <p className="anyu-kicker">legal</p>
            <h1 className="anyu-title">法律與說明</h1>
            <p className="anyu-copy">
              這裡整理 ANYU 目前對外公開的退款補發、隱私、使用規則與免責說明。
            </p>
            <div className="anyu-legal-meta">
              <span>版本 2026-05-31</span>
              <span>更新日期 2026-05-31</span>
              <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
            </div>
          </div>
        </header>

        <nav className="anyu-legal-nav" aria-label="legal page links">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="anyu-legal-nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
