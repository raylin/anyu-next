/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "暗語 ANYU",
  description: "C-stage production foundation for 暗語 ANYU.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" data-module="ai-temperature">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
