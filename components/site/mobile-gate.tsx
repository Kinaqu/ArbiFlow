"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { GlitchText } from "@/components/site/glitch-text";

/**
 * Phones get a desktop-only screen for the marketing site; the product app
 * (/app) is mobile-friendly and always passes through. Gated by viewport
 * (md = 768px — the same breakpoint the landing animations switch on) via
 * `md:hidden`, so desktop never renders it and there's no hydration flash.
 */
export function MobileGate() {
  const pathname = usePathname();
  if (pathname === "/app" || pathname.startsWith("/app/")) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background px-6 text-center md:hidden">
      <div className="text-[11px] font-mono uppercase tracking-widest text-muted">
        arbiflow · desktop experience
      </div>
      <GlitchText text="DESKTOP ONLY" textClassName="text-4xl sm:text-5xl" />
      <p className="max-w-xs text-muted-strong leading-relaxed">
        The ArbiFlow landing is built around motion that needs a big screen.
        Open it on desktop — or jump straight into the app, which works great on
        mobile.
      </p>
      <Link
        href="/app"
        className="btn-primary text-white inline-flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium"
      >
        Open the app
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
