import Link from "next/link";
import type { LegalPageContent } from "@/content/legal";
import { LEGAL_CONTACT_EMAIL, legalLinks } from "@/content/legal";
import { CoreShell } from "@/components/anyu/CoreShell";
import { Wordmark } from "@/components/anyu/Wordmark";

type LegalPageShellProps = {
  page: LegalPageContent;
};

export function LegalPageShell({ page }: LegalPageShellProps) {
  return (
    <CoreShell className="anyu-legal-shell">
      <section className="anyu-legal-page">
        <header className="anyu-legal-header">
          <div className="anyu-legal-header-top">
            <Link href="/m/ambiguous-temperature" className="anyu-back-link">
              ← 回到曖昧溫度計
            </Link>
            <Wordmark className="anyu-wordmark-quiet" />
          </div>
          <div className="anyu-legal-header-copy">
            <p className="anyu-kicker">{page.pageTitle}</p>
            <h1 className="anyu-title">{page.heading}</h1>
            <p className="anyu-copy">{page.intro}</p>
            <div className="anyu-legal-meta">
              <span>版本 {page.version}</span>
              <span>更新日期 {page.lastUpdated}</span>
              <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
            </div>
          </div>
        </header>

        <nav className="anyu-legal-nav" aria-label="legal page links">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "anyu-legal-nav-link",
                link.href === page.href ? "anyu-legal-nav-link-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <article className="anyu-legal-article">
          {page.sections.map((section) => (
            <section key={section.title} className="anyu-legal-section">
              <h2 className="anyu-section-title">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="anyu-copy">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="anyu-legal-list">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="anyu-copy">
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </section>
    </CoreShell>
  );
}
