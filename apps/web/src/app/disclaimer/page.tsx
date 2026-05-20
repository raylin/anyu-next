import type { Metadata } from "next";
import { LegalPageShell } from "@/components/anyu/LegalPageShell";
import { disclaimerPageContent } from "@/content/legal";

export const metadata: Metadata = {
  title: "免責聲明 | 暗語 ANYU",
  description: "暗語 ANYU v0 免責聲明。",
};

export default function DisclaimerPage() {
  return <LegalPageShell page={disclaimerPageContent} />;
}

