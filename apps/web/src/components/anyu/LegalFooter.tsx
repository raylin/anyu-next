import Link from "next/link";
import { legalLinks } from "@/content/legal";

export function LegalFooter() {
  return (
    <footer className="anyu-legal-footer" aria-label="legal links">
      <nav className="anyu-legal-footer-nav">
        <span className="anyu-legal-footer-item">
          <Link href="/" className="anyu-legal-footer-link">
            服務介紹
          </Link>
        </span>
        {legalLinks.map((link) => (
          <span key={link.href} className="anyu-legal-footer-item">
            <span className="anyu-legal-footer-separator">｜</span>
            <Link href={link.href} className="anyu-legal-footer-link">
              {link.label}
            </Link>
          </span>
        ))}
      </nav>
    </footer>
  );
}
