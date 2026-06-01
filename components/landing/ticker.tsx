"use client";

const items = [
  { proto: "Aave v3", slug: "aave-v3", asset: "USDC", apy: "4.31", chg: "+0.08" },
  { proto: "Radiant", slug: "radiant-v2", asset: "USDC", apy: "6.84", chg: "+0.21" },
  { proto: "GMX v2", slug: "gmx-v2-perps", asset: "GLP", apy: "14.22", chg: "-0.45" },
  { proto: "Pendle", slug: "pendle", asset: "wstETH", apy: "9.18", chg: "+0.12" },
  { proto: "Uniswap", slug: "uniswap-v3", asset: "ETH/USDC", apy: "11.40", chg: "+0.33" },
  { proto: "Compound", slug: "compound-v3", asset: "USDC", apy: "3.92", chg: "-0.04" },
  { proto: "Camelot", slug: "camelot-v3", asset: "ARB/ETH", apy: "21.65", chg: "+1.12" },
  { proto: "Curve", slug: "curve-dex", asset: "crvUSD", apy: "7.45", chg: "+0.18" },
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
      <div className="flex animate-scroll-x py-3 whitespace-nowrap">
        {[...items, ...items, ...items].map((it, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-5 text-xs font-mono"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/icons/protocols/${it.slug}.png`}
              alt=""
              width={18}
              height={18}
              className="w-[18px] h-[18px] rounded-[22%] object-contain shrink-0"
            />
            <span className="text-muted-strong">{it.proto}</span>
            <span className="text-muted">/ {it.asset}</span>
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
