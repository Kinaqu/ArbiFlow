import Link from "next/link";
import { Logo } from "./logo";
import { BackgroundBoxes } from "./background-boxes";

type Item = { label: string; href: string; external?: boolean };

const cols: { title: string; items: Item[] }[] = [
  {
    title: "Product",
    items: [
      { label: "Engine", href: "/engine" },
      { label: "Strategies", href: "/strategies" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Risk model", href: "/risk-model" },
      { label: "Dashboard", href: "/app" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "User docs", href: "/docs" },
      { label: "Developer API", href: "/api-docs" },
      { label: "Methodology", href: "/methodology" },
      { label: "Architecture", href: "/architecture" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "GitHub", href: "https://github.com/Kinaqu/ArbiFlow", external: true },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-surface/40">
      {/* Decorative hover grid (desktop only, reduced-motion-safe). It sits at
          z-0 and stays hit-testable; the content layer below is
          pointer-events-none so hover in the gaps lights up the cells, while
          each link re-enables pointer events to stay clickable. */}
      <BackgroundBoxes className="absolute inset-0 z-0 hidden md:block" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8 py-14 md:pointer-events-none">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <span className="pointer-events-auto inline-flex">
              <Logo />
            </span>
            <p className="mt-5 text-sm text-muted max-w-sm leading-relaxed">
              An Arbitrum-native capital intelligence layer for retail and
              prosumer DeFi users.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted">
              <span className="w-1 h-1 rounded-full bg-mint animate-pulse" />
              non‑custodial · arbitrum one
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title} className="lg:col-span-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-strong mb-4">
                {c.title}
              </div>
              <ul className="space-y-2.5">
                {c.items.map((item) =>
                  item.external ? (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pointer-events-auto text-sm text-muted hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  ) : (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="pointer-events-auto text-sm text-muted hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 pt-6 border-t hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted">
          <div>© 2026 ArbiFlow. All rights reserved.</div>
          <div className="flex items-center gap-5 font-mono">
            <span>Built for Arbitrum</span>
            <span className="text-border-strong">·</span>
            <span>v0.1.0 — pre-launch</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
