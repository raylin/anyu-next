import Link from "next/link";
import type { LegalPageContent } from "@/content/legal";
import { LEGAL_CONTACT_EMAIL, legalLinks } from "@/content/legal";
import { CoreShell } from "@/components/anyu/CoreShell";
import { LegalFooter } from "@/components/anyu/LegalFooter";
import { Wordmark } from "@/components/anyu/Wordmark";

type LegalPageShellProps = {
  page: LegalPageContent;
};

export function LegalPageShell({ page }: LegalPageShellProps) {
  return (
    <CoreShell className="anyu-core-static-shell anyu-legal-shell">
      <section className="anyu-core-static-page anyu-core-legal-page" data-core-static-page="legal-detail">
        <header className="anyu-core-topbar anyu-legal-header-top" data-core-header="true">
          <div className="anyu-core-nav-cluster">
            <Link href="/" className="anyu-core-nav-link">
              服務介紹
            </Link>
            <Link href="/m/ambiguous-temperature" className="anyu-core-nav-link">
              曖昧溫度計
            </Link>
          </div>
          <Wordmark className="anyu-wordmark-quiet" />
        </header>

        <section className="anyu-core-hero anyu-core-legal-hero" data-core-hero="legal">
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
        </section>

        <nav className="anyu-core-legal-nav anyu-legal-nav" aria-label="legal page links">
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

        <article className="anyu-core-article anyu-legal-article" data-core-article="legal">
          {page.sections.map((section) => (
            <section
              key={section.title}
              className="anyu-core-article-section anyu-legal-section"
              data-core-section="legal"
            >
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

        <div data-core-footer="true">
          <LegalFooter />
        </div>
      </section>
    </CoreShell>
  );
}
