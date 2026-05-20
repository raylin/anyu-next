import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "暗語 ANYU",
  description: "C-stage production foundation for 暗語 ANYU.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" data-module="ai-temperature">
      <body>{children}</body>
    </html>
  );
}
