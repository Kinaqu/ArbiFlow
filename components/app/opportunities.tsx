"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  ChevronDown,
  Loader2,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useOpportunities } from "@/hooks/use-opportunities";
import { SCORE_MAX } from "@/lib/score";
import type {
  MatchedPool,
  OpportunitySet,
} from "@/lib/opportunities";
import type { ScoredPool } from "@/lib/score";
import type { ScanResult } from "@/lib/scan";

const fmtApy = (apy: number) => `${apy.toFixed(2)}%`;
const fmtTvl = (n: number) => {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};
const fmtUsd = (n: number) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const BREAKDOWN_LABELS: Record<keyof typeof SCORE_MAX, string> = {
  apy: "APY",
  tvl: "TVL",
  trust: "trust",
  stability: "stability",
  prediction: "forecast",
};

export function Opportunities({ scan }: { scan: ScanResult }) {
  const { data, isLoading, isError } = useOpportunities(scan);

  if (isLoading) {
    return (
      <section
        id="opportunities"
        className="rounded-xl border border-border bg-surface p-10 flex flex-col items-center justify-center gap-4 scroll-mt-24"
      >
        <Loader2 className="w-5 h-5 animate-spin text-accent" />
        <div className="text-sm text-muted">
          Scoring Arbitrum opportunities · ranking pools…
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section
        id="opportunities"
        className="rounded-xl border border-rose/30 bg-rose/5 p-6 scroll-mt-24"
      >
        <div className="text-[10px] font-mono uppercase tracking-widest text-rose mb-2">
          opportunities unavailable
        </div>
        <p className="text-sm text-muted-strong">
          Live yield data is currently unreachable. Refresh to retry.
        </p>
      </section>
    );
  }

  return (
    <section id="opportunities" className="space-y-8 scroll-mt-24">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
            ranked opportunities
          </div>
          <h2 className="text-xl lg:text-2xl tracking-tight font-medium">
            Where your{" "}
            <span className="gradient-text-gold">idle capital</span> earns
          </h2>
        </div>
        <SourceBadge source={data.source} generatedAt={data.generatedAt} />
      </header>

      {data.perToken.length > 0 ? (
        <PerTokenGrid sets={data.perToken} />
      ) : (
        <EmptyPerToken />
      )}

      <ExploreSection pools={data.explore} />
    </section>
  );
}

function SourceBadge({
  source,
  generatedAt,
}: {
  source: "live" | "snapshot";
  generatedAt: string;
}) {
  const isSnapshot = source === "snapshot";
  const time = new Date(generatedAt);
  const stamp = Number.isNaN(time.getTime())
    ? generatedAt
    : time.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
  return (
    <div
      className={`text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 ${
        isSnapshot ? "text-gold" : "text-muted"
      }`}
      title={
        isSnapshot
          ? "Live DeFiLlama feed unreachable — serving recent snapshot"
          : "Live data from DeFiLlama yields API"
      }
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isSnapshot ? "bg-gold" : "bg-mint"
        }`}
      />
      {isSnapshot ? "snapshot" : "live"} · {stamp}
    </div>
  );
}

function PerTokenGrid({ sets }: { sets: OpportunitySet[] }) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {sets.map((set) => (
        <TokenCard key={set.symbol} set={set} />
      ))}
    </div>
  );
}

function TokenCard({ set }: { set: OpportunitySet }) {
  return (
    <article className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
            idle · {set.symbol}
          </div>
          <div className="font-mono tabular text-2xl font-semibold gradient-text-gold leading-none">
            {fmtUsd(set.balanceUsd)}
          </div>
        </div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted">
          top {set.topPools.length}
        </div>
      </div>
      <ul className="divide-y hairline">
        {set.topPools.map((pool) => (
          <PoolRow key={pool.id} pool={pool} />
        ))}
      </ul>
    </article>
  );
}

function PoolRow({ pool }: { pool: MatchedPool }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-surface-2/60 transition-colors text-left"
      >
        <div className="min-w-0 flex items-center gap-2.5">
          {pool.tier === "core" ? (
            <Shield className="w-3.5 h-3.5 text-accent flex-shrink-0" />
          ) : (
            <TrendingUp className="w-3.5 h-3.5 text-mint flex-shrink-0" />
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">
              {pool.projectLabel}{" "}
              <span className="font-mono text-muted">/ {pool.symbol}</span>
            </div>
            <div className="text-[11px] text-muted font-mono">
              {fmtTvl(pool.tvlUsd)} TVL · score {pool.score.toFixed(1)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {pool.requiresSwap ? (
            <span
              className="text-[10px] font-mono uppercase tracking-wider text-gold border border-gold/40 bg-gold/10 rounded px-1.5 py-0.5 inline-flex items-center gap-1"
              title="Pool uses an equivalent token — a swap is required"
            >
              <ArrowRightLeft className="w-3 h-3" />
              swap
            </span>
          ) : null}
          <div className="font-mono tabular text-base font-semibold">
            {fmtApy(pool.apy)}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
      {open ? <PoolBreakdown pool={pool} /> : null}
    </li>
  );
}

function PoolBreakdown({ pool }: { pool: MatchedPool }) {
  const keys = Object.keys(SCORE_MAX) as Array<keyof typeof SCORE_MAX>;
  return (
    <div className="px-5 pb-4 pt-1 bg-surface-2/40 border-t border-border space-y-3">
      <p className="text-sm text-muted-strong">{pool.rationale}</p>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {keys.map((k) => {
          const value = pool.breakdown[k];
          const max = SCORE_MAX[k];
          const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
          return (
            <div key={k} className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted">
                <span>{BREAKDOWN_LABELS[k]}</span>
                <span className="text-foreground">
                  {value.toFixed(1)}
                  <span className="text-muted">/{max}</span>
                </span>
              </div>
              <div className="h-1 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyPerToken() {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-8 text-center">
      <Sparkles className="w-5 h-5 text-muted mx-auto mb-3" />
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
        no idle capital detected
      </div>
      <p className="text-sm text-muted-strong max-w-md mx-auto">
        Your stablecoin balances are below the idle threshold. Explore the
        broader Arbitrum yield landscape below.
      </p>
    </div>
  );
}

function ExploreSection({ pools }: { pools: ScoredPool[] }) {
  if (pools.length === 0) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
          explore arbitrum · top {pools.length}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-surface-2 text-[10px] font-mono uppercase tracking-widest text-muted">
          <div className="col-span-5">pool</div>
          <div className="col-span-3 text-right">TVL</div>
          <div className="col-span-2 text-right">APY</div>
          <div className="col-span-2 text-right">score</div>
        </div>
        <ul className="divide-y hairline">
          {pools.map((pool) => (
            <li
              key={pool.id}
              className="grid grid-cols-12 gap-4 px-5 py-3 items-center hover:bg-surface-2/60 transition-colors"
            >
              <div className="col-span-7 md:col-span-5 min-w-0 flex items-center gap-2.5">
                {pool.tier === "core" ? (
                  <Shield className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 text-mint flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {pool.projectLabel}
                  </div>
                  <div className="text-[11px] text-muted font-mono truncate">
                    {pool.symbol}
                  </div>
                </div>
              </div>
              <div className="hidden md:block col-span-3 text-right font-mono tabular text-sm text-muted-strong">
                {fmtTvl(pool.tvlUsd)}
              </div>
              <div className="col-span-3 md:col-span-2 text-right font-mono tabular text-sm font-medium">
                {fmtApy(pool.apy)}
              </div>
              <div className="col-span-2 text-right font-mono tabular text-sm text-muted">
                {pool.score.toFixed(1)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
