import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { Providers } from "./providers";
import { Nav } from "@/components/landing/nav";
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
    "ArbiFlow scans your Arbitrum wallet, ranks every pool by a 0–100 composite score, and deploys into the top-scoring strategy in one signature. Non-custodial.",
  metadataBase: new URL("https://arbiflow.xyz"),
  openGraph: {
    title: "ArbiFlow — Deploy idle capital into optimized DeFi yield",
    description:
      "Connect your Arbitrum wallet, see ranked strategies, deploy in one click. Non-custodial — you sign every transaction.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(
    wagmiConfig,
    (await headers()).get("cookie"),
  );

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers initialState={initialState}>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
