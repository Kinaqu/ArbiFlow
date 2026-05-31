import Link from "next/link";
import { Logo } from "./logo";

type Item = { label: string; href: string; external?: boolean };

const cols: { title: string; items: Item[] }[] = [
  {
    title: "Product",
    items: [
      { label: "Engine", href: "/engine" },
      { label: "Strategies", href: "/strategies" },
      { label: "Risk model", href: "/risk-model" },
      { label: "Dashboard", href: "/app" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Docs", href: "/docs" },
      { label: "API", href: "/api-docs" },
      { label: "Methodology", href: "/methodology" },
      { label: "Open data", href: "/open-data" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "GitHub", href: "https://github.com/Kinaqu/ArbiFlow", external: true },
      { label: "Contact", href: "/contact" },
      { label: "Press kit", href: "/press-kit" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-14">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Logo />
            <p className="mt-5 text-sm text-muted max-w-sm leading-relaxed">
              An Arbitrum-native capital intelligence layer for retail and
              prosumer DeFi users.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted">
              <span className="w-1 h-1 rounded-full bg-mint animate-pulse" />
              all systems operational · arbitrum one
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
                        className="text-sm text-muted hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  ) : (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted hover:text-foreground transition-colors"
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
