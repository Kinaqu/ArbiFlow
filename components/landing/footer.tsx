import { Logo } from "./logo";

const cols = [
  {
    title: "Product",
    items: ["Engine", "Strategies", "Risk model", "Dashboard", "Changelog"],
  },
  {
    title: "Resources",
    items: ["Docs", "API", "Methodology", "Open data", "Status"],
  },
  {
    title: "Company",
    items: ["About", "Twitter / X", "GitHub", "Contact", "Press kit"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
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
                {c.items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
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
