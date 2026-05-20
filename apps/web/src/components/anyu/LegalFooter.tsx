import Link from "next/link";
import { legalLinks } from "@/content/legal";

export function LegalFooter() {
  return (
    <footer className="anyu-legal-footer" aria-label="legal links">
      <nav className="anyu-legal-footer-nav">
        {legalLinks.map((link, index) => (
          <span key={link.href} className="anyu-legal-footer-item">
            {index > 0 ? <span className="anyu-legal-footer-separator">｜</span> : null}
            <Link href={link.href} className="anyu-legal-footer-link">
              {link.label}
            </Link>
          </span>
        ))}
      </nav>
    </footer>
  );
}

