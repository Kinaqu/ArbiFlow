"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { LogoMark } from "./logo";
import { ConnectButton } from "@/components/wallet/connect-button";

const links = [
  { label: "Engine", href: "/engine" },
  { label: "Strategies", href: "/strategies" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Risk model", href: "/risk-model" },
  { label: "Docs", href: "/docs" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * One nav pill. On hover an accent circle scales up from the bottom-center to
 * flood the pill while the label slides up and a white duplicate slides into
 * place — the PillNav effect, done with Tailwind transitions (no gsap).
 */
function PillLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full px-4 text-sm font-medium transition-colors ${
        active ? "text-foreground" : "text-muted hover:text-foreground"
      }`}
    >
      {active && (
        <span aria-hidden className="absolute inset-0 rounded-full bg-white/[0.05]" />
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-full aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-accent transition-transform duration-300 ease-out group-hover:scale-100"
      />
      <span className="relative z-10 block overflow-hidden leading-none">
        <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-[150%]">
          {label}
        </span>
        <span
          aria-hidden
          className="absolute inset-0 translate-y-[150%] text-white transition-transform duration-300 ease-out group-hover:translate-y-0"
        >
          {label}
        </span>
      </span>
    </Link>
  );
}

export function Nav() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={reduced ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 px-4 py-3 sm:py-4"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3">
        {/* Main pill — logo + nav links (desktop) */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 rounded-full border border-border bg-surface/70 p-1.5 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl md:flex"
        >
          <Link
            href="/"
            aria-label="ArbiFlow home"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface-2"
          >
            <motion.span
              whileHover={reduced ? undefined : { rotate: 360 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="grid place-items-center"
            >
              <LogoMark size={18} />
            </motion.span>
          </Link>
          {links.map((l) => (
            <PillLink
              key={l.href}
              label={l.label}
              href={l.href}
              active={isActive(pathname, l.href)}
            />
          ))}
        </nav>

        {/* Live status (lg+) */}
        <div className="hidden h-12 shrink-0 items-center gap-2 rounded-full border border-border bg-surface/70 px-3.5 font-mono text-[10px] uppercase tracking-widest text-muted backdrop-blur-xl lg:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
          live
        </div>

        {/* Connect pill (desktop) */}
        <ConnectButton
          size="sm"
          className="hidden h-12 shrink-0 rounded-full px-5 md:inline-flex"
        >
          Connect wallet
          <ArrowRight className="h-3.5 w-3.5" />
        </ConnectButton>

        {/* Mobile bar */}
        <div className="flex w-full items-center justify-between rounded-full border border-border bg-surface/70 p-1.5 backdrop-blur-xl md:hidden">
          <Link href="/" aria-label="ArbiFlow home" className="flex items-center gap-2 pr-2">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface-2">
              <LogoMark size={18} />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Arbi<span className="text-muted-strong">Flow</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface-2 text-foreground"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile popover — overlays content, doesn't reflow the page */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-x-0 top-full px-4 md:hidden"
          >
            <nav
              aria-label="Mobile"
              className="mx-auto flex max-w-7xl flex-col gap-1 rounded-3xl border border-border bg-surface/90 p-3 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl"
            >
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(pathname, l.href) ? "page" : undefined}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(pathname, l.href)
                      ? "bg-white/[0.05] text-foreground"
                      : "text-muted hover:bg-white/[0.04] hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <ConnectButton
                size="md"
                className="mt-1 w-full justify-center rounded-xl"
              >
                Connect wallet
                <ArrowRight className="h-4 w-4" />
              </ConnectButton>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
