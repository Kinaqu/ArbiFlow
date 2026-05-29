"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "./logo";
import { ConnectButton } from "@/components/wallet/connect-button";

const links = [
  { label: "Engine", href: "/engine" },
  { label: "Strategies", href: "/strategies" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Risk model", href: "/risk-model" },
  { label: "Docs", href: "/docs" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b hairline bg-background/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-10">
            <Logo />
            <nav className="hidden md:flex items-center gap-7">
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted">
              <span className="w-1 h-1 rounded-full bg-mint animate-pulse" />
              arbitrum one · live
            </div>
            <ConnectButton size="sm">
              Connect wallet
              <ArrowRight className="w-3.5 h-3.5" />
            </ConnectButton>
          </div>
        </div>
      </div>
    </header>
  );
}
