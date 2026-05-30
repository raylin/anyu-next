import type { Metadata } from "next";
import { LegalPageShell } from "@/components/anyu/LegalPageShell";
import { refundPageContent } from "@/content/legal";

export const metadata: Metadata = {
  title: "退款政策 | 暗語 ANYU",
  description: "暗語 ANYU 曖昧溫度計完整分析的退款、補發與數位內容交付政策。",
};

export default function RefundPage() {
  return <LegalPageShell page={refundPageContent} />;
}
