"use client";

import { ArrowRight } from "lucide-react";
import { Logo } from "./logo";

const links = [
  { label: "Engine", href: "#engine" },
  { label: "Strategies", href: "#opportunities" },
  { label: "Risk model", href: "#risk" },
  { label: "Docs", href: "#" },
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
                <a
                  key={l.label}
                  href={l.href}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted">
              <span className="w-1 h-1 rounded-full bg-mint animate-pulse" />
              block 287,402,118
            </div>
            <a
              href="#cta"
              className="btn-primary text-sm font-medium px-3.5 py-1.5 rounded-md text-white flex items-center gap-1.5"
            >
              Connect wallet
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
