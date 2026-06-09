import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/landing/footer";
import { TextRewind } from "@/components/site/text-rewind";

export const metadata: Metadata = {
  title: "404 — Page not found · ArbiFlow",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-5 py-24">
        <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-8">
          error · 404
        </div>

        {/* Padding leaves room for the offset shadows (up to 45px down-right). */}
        <div className="px-12 pb-12">
          <TextRewind
            text="404"
            className="text-foreground text-[96px] sm:text-[150px] lg:text-[190px] leading-none"
            shadowColors={{
              first: "#2F7BFF",
              second: "#4A8FFF",
              third: "#F4B53F",
              fourth: "#FF5A6B",
              glow: "#FF5A6B",
            }}
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          This page took an off‑ramp.
        </h1>
        <p className="mt-3 text-muted-strong max-w-md leading-relaxed">
          The route you’re after doesn’t exist (or moved). Let’s get you back on
          Arbitrum.
        </p>

        <Link
          href="/"
          className="btn-primary text-white inline-flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium mt-8"
        >
          Back to home
          <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
      <Footer />
    </>
  );
}
