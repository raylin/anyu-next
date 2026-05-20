import type { Metadata } from "next";
import { LegalPageShell } from "@/components/anyu/LegalPageShell";
import { privacyPageContent } from "@/content/legal";

export const metadata: Metadata = {
  title: "隱私權政策 | 暗語 ANYU",
  description: "暗語 ANYU v0 隱私權政策。",
};

export default function PrivacyPage() {
  return <LegalPageShell page={privacyPageContent} />;
}

