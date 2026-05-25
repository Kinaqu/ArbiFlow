"use client";

const items = [
  { proto: "Aave v3", asset: "USDC", apy: "4.31", chg: "+0.08" },
  { proto: "Radiant", asset: "USDC", apy: "6.84", chg: "+0.21" },
  { proto: "GMX v2", asset: "GLP", apy: "14.22", chg: "-0.45" },
  { proto: "Pendle", asset: "wstETH", apy: "9.18", chg: "+0.12" },
  { proto: "Uniswap", asset: "ETH/USDC", apy: "11.40", chg: "+0.33" },
  { proto: "Compound", asset: "USDC", apy: "3.92", chg: "-0.04" },
  { proto: "Camelot", asset: "ARB/ETH", apy: "21.65", chg: "+1.12" },
  { proto: "Stargate", asset: "USDT", apy: "5.10", chg: "+0.05" },
];

export function Ticker() {
  return (
    <div className="relative border-y border-border bg-surface/40 backdrop-blur-sm overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
          live · arbitrum
        </span>
      </div>
      <div className="flex animate-scroll-x py-2.5 whitespace-nowrap">
        {[...items, ...items, ...items].map((it, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-5 text-xs font-mono"
          >
            <span className="text-muted">{it.proto}</span>
            <span className="text-muted-strong">/ {it.asset}</span>
            <span className="text-foreground tabular font-medium">
              {it.apy}%
            </span>
            <span
              className={`tabular ${it.chg.startsWith("+") ? "text-mint" : "text-rose"}`}
            >
              {it.chg}
            </span>
            <span className="text-border-strong mx-3">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
