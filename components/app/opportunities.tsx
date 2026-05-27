"use client";

import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightLeft,
  Check,
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
  PortalCategoryGroup,
} from "@/lib/opportunities";
import type { ScoredPool } from "@/lib/score";
import type { ScanResult } from "@/lib/scan";
import { PORTAL_CATEGORY_LABELS } from "@/lib/portal";

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

type GenPhase = "fetching" | "scoring" | "ranking" | "ready";

const PHASE_LABELS: Record<Exclude<GenPhase, "ready">, string> = {
  fetching: "Fetching live pools",
  scoring: "Scoring opportunities",
  ranking: "Ranking for your wallet",
};

const PHASE_ORDER: Record<GenPhase, number> = {
  fetching: 0,
  scoring: 1,
  ranking: 2,
  ready: 3,
};

export function Opportunities({ scan }: { scan: ScanResult }) {
  const { data, isLoading, isError } = useOpportunities(scan, true);
  const [phase, setPhase] = useState<GenPhase>("fetching");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("scoring"), 700);
    const t2 = setTimeout(() => setPhase("ranking"), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (phase !== "ranking") return;
    if (isLoading || !data) return;
    const t = setTimeout(() => setPhase("ready"), 400);
    return () => clearTimeout(t);
  }, [phase, isLoading, data]);

  if (isError) {
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
      <AnimatePresence mode="wait" initial={false}>
        {phase !== "ready" || !data ? (
          <motion.div
            key="pipeline"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <GenerationPipeline phase={phase} />
          </motion.div>
        ) : (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-8"
          >
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

            {data.portal.length > 0 && <PortalTier groups={data.portal} />}

            {data.perToken.length > 0 ? (
              <PerTokenGrid sets={data.perToken} />
            ) : (
              <EmptyPerToken />
            )}

            <ExploreSection pools={data.explore} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function GenerationPipeline({ phase }: { phase: GenPhase }) {
  const target = 562;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (phase !== "scoring") return;
    const start = Date.now();
    const duration = 700;
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / duration);
      setCount(Math.round(target * t));
      if (t >= 1) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "ranking" || phase === "ready") setCount(target);
  }, [phase]);

  const phases: Array<Exclude<GenPhase, "ready">> = [
    "fetching",
    "scoring",
    "ranking",
  ];

  const statusOf = (p: Exclude<GenPhase, "ready">) => {
    if (PHASE_ORDER[phase] > PHASE_ORDER[p]) return "done";
    if (PHASE_ORDER[phase] === PHASE_ORDER[p]) return "active";
    return "queued";
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 lg:p-8 scroll-mt-24">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
        generating strategies
      </div>
      <h2 className="text-xl lg:text-2xl tracking-tight font-medium mb-6">
        Scoring Arbitrum yield in{" "}
        <span className="gradient-text-gold">real time</span>
      </h2>
      <ul className="space-y-3">
        {phases.map((p) => {
          const status = statusOf(p);
          return (
            <li
              key={p}
              className="flex items-center justify-between gap-3 py-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {status === "done" ? (
                    <Check className="w-4 h-4 text-mint" />
                  ) : status === "active" ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-border" />
                  )}
                </span>
                <span
                  className={`text-sm font-medium ${
                    status === "queued" ? "text-muted" : "text-foreground"
                  }`}
                >
                  {PHASE_LABELS[p]}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
                {p === "scoring"
                  ? `${count} / ${target} pools`
                  : status === "done"
                    ? "done"
                    : status === "active"
                      ? "…"
                      : "queued"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ProtocolIcon({
  iconPath,
  tier,
}: {
  iconPath: string;
  tier: "core" | "honorable";
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return tier === "core" ? (
      <Shield className="w-5 h-5 text-accent flex-shrink-0" />
    ) : (
      <TrendingUp className="w-5 h-5 text-mint flex-shrink-0" />
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={iconPath}
      alt=""
      width={20}
      height={20}
      onError={(e: SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.style.display = "none";
        setFailed(true);
      }}
      className="w-5 h-5 rounded-sm flex-shrink-0 bg-surface-2"
    />
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

function PortalTier({ groups }: { groups: PortalCategoryGroup[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
        <span className="text-gold">Arbitrum Foundation curated</span>
        <span className="text-muted">· via portal.arbitrum.io/earn</span>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {groups.map((g) => (
          <div
            key={g.category}
            className="rounded-xl border border-border bg-surface overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border bg-surface-2 text-[10px] font-mono uppercase tracking-widest text-muted">
              {PORTAL_CATEGORY_LABELS[g.category]}
            </div>
            <ul className="divide-y hairline">
              {g.pools.map((pool) => (
                <li
                  key={pool.id}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <ProtocolIcon iconPath={pool.iconPath} tier={pool.tier} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {pool.projectLabel}
                    </div>
                    <div className="text-[11px] text-muted font-mono truncate">
                      {pool.symbol}
                    </div>
                  </div>
                  <div className="font-mono tabular text-sm font-semibold">
                    {fmtApy(pool.apy)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function PerTokenGrid({ sets }: { sets: OpportunitySet[] }) {
  return (
    <div className="space-y-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
        matched to your idle capital
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {sets.map((set) => (
          <TokenCard key={set.symbol} set={set} />
        ))}
      </div>
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
          <ProtocolIcon iconPath={pool.iconPath} tier={pool.tier} />
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
  const keys = useMemo(
    () => Object.keys(SCORE_MAX) as Array<keyof typeof SCORE_MAX>,
    [],
  );
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
                <ProtocolIcon iconPath={pool.iconPath} tier={pool.tier} />
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
