"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ScannedToken } from "@/lib/scan";
import { fmtUsdN } from "@/lib/format";
import { ChainBadge } from "@/components/app/chain-badge";
import { CHAINS, tokenLogo, type ChainKey } from "@/lib/tokens";

const fmtBalance = (n: number) => {
  if (n === 0) return "0";
  if (n < 0.0001) return n.toExponential(2);
  if (n < 1) return n.toFixed(4);
  if (n < 1000) return n.toFixed(3);
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
};

// Arbitrum is the home chain — list it first within a currency.
const CHAIN_RANK: Record<ChainKey, number> = { arbitrum: 0, base: 1, optimism: 2 };

type Source = {
  chain: ChainKey;
  balanceFormatted: number;
  usdValue: number | null;
  idle: boolean;
};

type AggToken = {
  symbol: string;
  name: string;
  logo: string | null;
  color: string;
  usdPrice: number | null;
  totalBalance: number;
  totalUsd: number;
  idle: boolean;
  sources: Source[];
};

// One row per currency: the same symbol held on several chains collapses into a
// single entry, with the per-chain split kept for the expand drill-down.
function aggregate(tokens: ScannedToken[]): AggToken[] {
  const map = new Map<string, AggToken>();
  for (const t of tokens) {
    let agg = map.get(t.symbol);
    if (!agg) {
      agg = {
        symbol: t.symbol,
        name: t.name,
        logo: tokenLogo(t.symbol),
        color: t.color,
        usdPrice: t.usdPrice,
        totalBalance: 0,
        totalUsd: 0,
        idle: false,
        sources: [],
      };
      map.set(t.symbol, agg);
    }
    agg.totalBalance += t.balanceFormatted;
    agg.totalUsd += t.usdValue ?? 0;
    agg.idle = agg.idle || t.idle;
    if (agg.usdPrice == null) agg.usdPrice = t.usdPrice;
    agg.sources.push({
      chain: t.chain,
      balanceFormatted: t.balanceFormatted,
      usdValue: t.usdValue,
      idle: t.idle,
    });
  }
  const rows = [...map.values()];
  for (const r of rows) {
    r.sources.sort((a, b) => CHAIN_RANK[a.chain] - CHAIN_RANK[b.chain]);
  }
  rows.sort((a, b) => b.totalUsd - a.totalUsd);
  return rows;
}

function TokenMark({
  logo,
  color,
  symbol,
}: {
  logo: string | null;
  color: string;
  symbol: string;
}) {
  if (logo) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={logo}
        alt={symbol}
        width={20}
        height={20}
        className="w-5 h-5 rounded-[22%] object-contain flex-shrink-0"
      />
    );
  }
  return (
    <span
      className="w-5 h-5 rounded-[22%] flex-shrink-0"
      style={{ background: color }}
    />
  );
}

function AggRow({ t }: { t: AggToken }) {
  const [open, setOpen] = useState(false);
  const expandable = t.sources.length >= 2;
  return (
    <li>
      <button
        type="button"
        onClick={() => {
          if (expandable) setOpen((v) => !v);
        }}
        aria-expanded={expandable ? open : undefined}
        className={`w-full grid grid-cols-12 gap-4 px-5 py-3.5 items-center text-left ${
          expandable
            ? "hover:bg-surface-2/60 transition-colors"
            : "cursor-default"
        }`}
      >
        <div className="col-span-7 md:col-span-4 flex items-center gap-3 min-w-0">
          <TokenMark logo={t.logo} color={t.color} symbol={t.symbol} />
          <div className="min-w-0">
            <div className="font-medium text-foreground truncate flex items-center gap-1.5">
              <span className="truncate">{t.symbol}</span>
              <span className="flex items-center gap-1 flex-shrink-0">
                {t.sources.map((s) => (
                  <ChainBadge key={s.chain} chain={s.chain} />
                ))}
              </span>
            </div>
            <div className="text-[11px] text-muted truncate font-mono">
              {t.name}
            </div>
          </div>
        </div>
        <div className="col-span-5 md:col-span-3 text-right font-mono tabular text-sm flex items-center justify-end gap-1.5">
          {fmtBalance(t.totalBalance)}
          {expandable && (
            <ChevronDown
              className={`w-3.5 h-3.5 text-muted transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
        <div className="hidden md:block col-span-2 text-right font-mono tabular text-sm text-muted">
          {fmtUsdN(t.usdPrice)}
        </div>
        <div className="hidden md:block col-span-2 text-right font-mono tabular text-sm font-medium">
          {fmtUsdN(t.totalUsd)}
        </div>
        <div className="hidden md:flex col-span-1 justify-end">
          {t.idle ? (
            <span className="text-[10px] font-mono uppercase tracking-wider text-gold border border-gold/40 bg-gold/10 rounded px-1.5 py-0.5">
              idle
            </span>
          ) : (
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
              —
            </span>
          )}
        </div>
      </button>

      {expandable && open && (
        <div className="bg-surface-2/40 border-t hairline">
          {t.sources.map((s) => (
            <div
              key={s.chain}
              className="grid grid-cols-12 gap-4 px-5 py-2.5 items-center"
            >
              <div className="col-span-7 md:col-span-4 flex items-center gap-2 min-w-0 pl-8">
                <ChainBadge chain={s.chain} />
                <span className="text-xs text-muted-strong truncate">
                  {CHAINS[s.chain].label}
                </span>
              </div>
              <div className="col-span-5 md:col-span-3 text-right font-mono tabular text-xs text-muted-strong">
                {fmtBalance(s.balanceFormatted)}
              </div>
              <div className="hidden md:block col-span-2" />
              <div className="hidden md:block col-span-2 text-right font-mono tabular text-xs text-muted-strong">
                {fmtUsdN(s.usdValue)}
              </div>
              <div className="hidden md:block col-span-1" />
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

export function BalanceTable({ tokens }: { tokens: ScannedToken[] }) {
  const rows = useMemo(() => aggregate(tokens), [tokens]);

  if (tokens.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface/40 p-10 text-center">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">
          empty wallet
        </div>
        <p className="text-muted-strong">
          No tokens detected in the Top-20 Arbitrum index for this address.
          Bridge or fund the wallet to see balances here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-surface-2 text-[10px] font-mono uppercase tracking-widest text-muted">
        <div className="col-span-4">asset</div>
        <div className="col-span-3 text-right">balance</div>
        <div className="col-span-2 text-right">price</div>
        <div className="col-span-2 text-right">value</div>
        <div className="col-span-1 text-right">status</div>
      </div>
      <ul className="divide-y hairline">
        {rows.map((t) => (
          <AggRow key={t.symbol} t={t} />
        ))}
      </ul>
    </div>
  );
}
