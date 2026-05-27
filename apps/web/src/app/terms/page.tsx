import type { Metadata } from "next";
import { LegalPageShell } from "@/components/anyu/LegalPageShell";
import { termsPageContent } from "@/content/legal";

export const metadata: Metadata = {
  title: "使用條款 | 暗語 ANYU",
  description: "暗語 ANYU 使用條款。",
};

export default function TermsPage() {
  return <LegalPageShell page={termsPageContent} />;
}
