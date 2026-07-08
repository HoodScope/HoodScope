import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hoodscope.pro"),
  title: "HoodScope — Know the Risk Before You Buy",
  description:
    "AI token security scanner for Robinhood Chain. CLEAR, REVIEW, or FLAGGED — across 8 supported networks.",
  keywords: ["token security", "honeypot", "Robinhood Chain", "crypto scanner"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
