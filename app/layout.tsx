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
  title: "ArbiFlow — Capital intelligence for Arbitrum",
  description:
    "Turn idle crypto into optimized DeFi yield on Arbitrum. ArbiFlow scans your wallet and recommends risk-adjusted strategies with real net APY after gas.",
  metadataBase: new URL("https://arbiflow.xyz"),
  openGraph: {
    title: "ArbiFlow — Capital intelligence for Arbitrum",
    description:
      "Wallet-native engine that ranks DeFi yield strategies on Arbitrum by risk-adjusted, gas-aware net return.",
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
