import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArbiFlow — Deploy idle capital into optimized DeFi yield",
  description:
    "ArbiFlow scans your Arbitrum wallet, ranks every yield opportunity by risk-adjusted, gas-aware net APY, and deploys into the top-scoring strategy in one signature. Non-custodial.",
  metadataBase: new URL("https://arbiflow.xyz"),
  openGraph: {
    title: "ArbiFlow — Deploy idle capital into optimized DeFi yield",
    description:
      "Connect your Arbitrum wallet, see ranked strategies, deploy in one click. Non-custodial — you sign every transaction.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
