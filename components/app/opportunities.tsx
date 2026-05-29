"use client";

import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowRightLeft,
  ArrowUp,
  Check,
  ChevronDown,
  ExternalLink,
  Loader2,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useAccount } from "wagmi";
import { useOpportunities } from "@/hooks/use-opportunities";
import { SCORE_MAX } from "@/lib/score";
import type { MatchedPool, OpportunitySet } from "@/lib/opportunities";
import type { ScoredPool, ScoreBreakdown } from "@/lib/score";
import type { ScanResult, ScannedToken } from "@/lib/scan";
import { PORTAL_CATEGORY_LABELS, type PortalCategory } from "@/lib/portal";
import { isAaveExecutable, poolUrl } from "@/lib/aave";
import { fmtApy, fmtTvl, fmtUsd } from "@/lib/format";
import { yearlyYield } from "@/lib/earnings";
import { DepositModal } from "@/components/app/deposit-modal";
import { PoolChart } from "@/components/app/pool-chart";
import iconManifest from "@/lib/icon-manifest.json";

const ICON_SLUGS = new Set(iconManifest as string[]);

const BREAKDOWN_LABELS: Record<keyof typeof SCORE_MAX, string> = {
  apy: "APY",
  tvl: "TVL",
  trust: "trust",
  stability: "stability",
  prediction: "forecast",
};

type GenPhase = "fetching" | "scoring" | "ranking" | "ready";

type ExecuteMode = "real" | "preview";

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
  const { address, isConnected } = useAccount();
  const [phase, setPhase] = useState<GenPhase>("fetching");

  // Real deposits only when the connected wallet is the one being scanned.
  // Otherwise (sample `?address=` mode, or a different connected wallet) the
  // deposit flow runs as a non-signable preview.
  const executeMode: ExecuteMode =
    isConnected &&
    !!address &&
    address.toLowerCase() === scan.address.toLowerCase()
      ? "real"
      : "preview";

  // Symbol → held token, for the Explore table's "in wallet" awareness.
  const held = useMemo(() => {
    const m = new Map<string, ScannedToken>();
    for (const t of scan.tokens) {
      if (t.balanceFormatted > 0) m.set(t.symbol.toUpperCase(), t);
    }
    return m;
  }, [scan]);

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
                  arbitrum yield
                </div>
                <h2 className="text-xl lg:text-2xl tracking-tight font-medium">
                  Where your{" "}
                  <span className="gradient-text-gold">idle capital</span> earns
                </h2>
              </div>
              <SourceBadge source={data.source} generatedAt={data.generatedAt} />
            </header>

            {data.perToken.length > 0 && (
              <PerTokenGrid
                sets={data.perToken}
                scan={scan}
                executeMode={executeMode}
              />
            )}

            <ExploreTable pools={data.pools} held={held} />

            {data.perToken.length === 0 && <EmptyPerToken />}
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

  // Once past scoring, show the full count without a setState-in-effect.
  const shown = phase === "scoring" ? count : target;

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
                  ? `${shown} / ${target} pools`
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
  // Skip the <img> entirely for protocols we have no local icon for — avoids a
  // guaranteed 404 to /icons/protocols/<slug>.png (honorable tier rotates).
  const slug = iconPath.split("/").pop()?.replace(/\.png$/, "") ?? "";
  const [failed, setFailed] = useState(() => !ICON_SLUGS.has(slug));
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

function PerTokenGrid({
  sets,
  scan,
  executeMode,
}: {
  sets: OpportunitySet[];
  scan: ScanResult;
  executeMode: ExecuteMode;
}) {
  return (
    <div className="space-y-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
        matched to your idle capital
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {sets.map((set) => (
          <TokenCard
            key={set.symbol}
            set={set}
            token={scan.tokens.find((t) => t.symbol === set.symbol)}
            executeMode={executeMode}
          />
        ))}
      </div>
    </div>
  );
}

function TokenCard({
  set,
  token,
  executeMode,
}: {
  set: OpportunitySet;
  token: ScannedToken | undefined;
  executeMode: ExecuteMode;
}) {
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
          {set.topPools[0] ? (
            <div className="mt-1.5 text-[11px] font-mono text-mint">
              → up to +{fmtUsd(yearlyYield(set.balanceUsd, set.topPools[0].apy))}/yr
              <span className="text-muted">
                {" "}at {fmtApy(set.topPools[0].apy)}
              </span>
            </div>
          ) : null}
        </div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted">
          top {set.topPools.length}
        </div>
      </div>
      <ul className="divide-y hairline">
        {set.topPools.map((pool) => (
          <PoolRow
            key={pool.id}
            pool={pool}
            token={token}
            executeMode={executeMode}
          />
        ))}
      </ul>
    </article>
  );
}

function PoolRow({
  pool,
  token,
  executeMode,
}: {
  pool: MatchedPool;
  token: ScannedToken | undefined;
  executeMode: ExecuteMode;
}) {
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
      {open ? (
        <PoolBreakdown pool={pool} token={token} executeMode={executeMode} />
      ) : null}
    </li>
  );
}

function BreakdownBars({ breakdown }: { breakdown: ScoreBreakdown }) {
  const keys = Object.keys(SCORE_MAX) as Array<keyof typeof SCORE_MAX>;
  return (
    <div className="space-y-1.5">
      {keys.map((k) => {
        const value = breakdown[k];
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
              <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PoolBreakdown({
  pool,
  token,
  executeMode,
}: {
  pool: MatchedPool;
  token: ScannedToken | undefined;
  executeMode: ExecuteMode;
}) {
  const [depositOpen, setDepositOpen] = useState(false);
  const executable =
    !!token &&
    token.address !== "native" &&
    isAaveExecutable(pool.project, token.symbol);

  return (
    <div className="px-5 pb-4 pt-1 bg-surface-2/40 border-t border-border space-y-3">
      <p className="text-sm text-muted-strong">{pool.rationale}</p>
      <BreakdownBars breakdown={pool.breakdown} />
      <PoolChart poolId={pool.id} />
      <div className="pt-1">
        {executable && token ? (
          <button
            type="button"
            onClick={() => setDepositOpen(true)}
            className="btn-primary inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium text-white"
          >
            {executeMode === "preview" ? "Preview deposit" : `Deposit ${token.symbol}`}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <a
            href={poolUrl(pool)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium text-foreground"
          >
            Open on {pool.projectLabel}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
      {depositOpen && token ? (
        <DepositModal
          pool={pool}
          token={token}
          preview={executeMode === "preview"}
          onClose={() => setDepositOpen(false)}
        />
      ) : null}
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
        broader Arbitrum yield landscape in the table above.
      </p>
    </div>
  );
}

type SortKey = "score" | "apy" | "tvl";

const SORT_ACCESSOR: Record<SortKey, (p: ScoredPool) => number> = {
  score: (p) => p.score,
  apy: (p) => p.apy,
  tvl: (p) => p.tvlUsd,
};

const PAGE_SIZE = 25;

function CuratedBadge({ category }: { category: PortalCategory | null }) {
  return (
    <span
      className="text-[9px] font-mono uppercase tracking-wider text-gold border border-gold/40 bg-gold/10 rounded px-1 py-0.5 inline-flex items-center gap-1 flex-shrink-0"
      title="Arbitrum Foundation curated · via portal.arbitrum.io/earn"
    >
      <span className="w-1 h-1 rounded-full bg-gold" />
      {category ? PORTAL_CATEGORY_LABELS[category] : "curated"}
    </span>
  );
}

function ScoreCell({ pool }: { pool: ScoredPool }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative inline-flex justify-end"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-mono tabular text-sm text-muted-strong underline decoration-dotted decoration-border underline-offset-4 hover:text-foreground focus:outline-none focus-visible:text-foreground"
        aria-label={`Score ${pool.score.toFixed(1)} of 100 — show breakdown`}
      >
        {pool.score.toFixed(1)}
      </button>
      {open ? (
        <div className="absolute right-0 top-full mt-2 z-20 w-64 rounded-lg border border-border bg-surface shadow-xl p-3 space-y-2 text-left">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
            score {pool.score.toFixed(1)} / 100
          </div>
          <p className="text-xs text-muted-strong leading-snug">
            {pool.rationale}
          </p>
          <BreakdownBars breakdown={pool.breakdown} />
        </div>
      ) : null}
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  sortKey: SortKey;
  active: boolean;
  dir: "asc" | "desc";
  onClick: (k: SortKey) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(sortKey)}
      className={`inline-flex items-center gap-1 hover:text-foreground transition-colors ${
        active ? "text-foreground" : ""
      } ${className ?? ""}`}
    >
      {label}
      {active ? (
        dir === "asc" ? (
          <ArrowUp className="w-3 h-3" />
        ) : (
          <ArrowDown className="w-3 h-3" />
        )
      ) : null}
    </button>
  );
}

function MinFilter({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 focus-within:border-accent">
      <span className="text-[10px] font-mono uppercase tracking-wider text-muted whitespace-nowrap">
        {label}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
        placeholder="0"
        className="w-12 bg-transparent text-sm text-right focus:outline-none placeholder:text-muted"
      />
      <span className="text-xs text-muted whitespace-nowrap">{unit}</span>
    </div>
  );
}

type HoldingStatus = "full" | "partial" | "none";

function holdingFor(
  symbols: string[],
  held: Map<string, ScannedToken>,
): { status: HoldingStatus; usd: number; idle: boolean } {
  const owned = symbols.filter((s) => held.has(s));
  if (owned.length === 0) return { status: "none", usd: 0, idle: false };
  const usd = owned.reduce((sum, s) => sum + (held.get(s)?.usdValue ?? 0), 0);
  const idle = owned.some((s) => held.get(s)?.idle);
  return {
    status: owned.length === symbols.length ? "full" : "partial",
    usd,
    idle,
  };
}

function HoldingBadge({
  symbols,
  held,
}: {
  symbols: string[];
  held: Map<string, ScannedToken>;
}) {
  const { status, usd, idle } = holdingFor(symbols, held);
  if (status === "none") {
    return (
      <span className="text-[9px] font-mono uppercase tracking-wider text-muted border border-border rounded px-1 py-0.5 flex-shrink-0">
        not held
      </span>
    );
  }
  return (
    <span
      className="text-[9px] font-mono uppercase tracking-wider text-mint border border-mint/40 bg-mint/10 rounded px-1 py-0.5 inline-flex items-center gap-1 flex-shrink-0"
      title={idle ? "in your wallet · idle capital" : "in your wallet"}
    >
      <span className="w-1 h-1 rounded-full bg-mint" />
      in wallet · {fmtUsd(usd)}
      {status === "partial" ? <span className="text-muted">· partial</span> : null}
    </span>
  );
}

function ExploreTable({
  pools,
  held,
}: {
  pools: ScoredPool[];
  held: Map<string, ScannedToken>;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [curatedOnly, setCuratedOnly] = useState(false);
  const [heldOnly, setHeldOnly] = useState(false);
  const [minApy, setMinApy] = useState("");
  const [minTvl, setMinTvl] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset paging whenever a filter changes (not on re-sort).
  const resetPaging = () => setVisibleCount(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    const minApyN = Number(minApy) || 0;
    const minTvlN = (Number(minTvl) || 0) * 1_000_000;
    const accessor = SORT_ACCESSOR[sortKey];
    const dir = sortDir === "asc" ? 1 : -1;
    return pools
      .filter((p) => {
        if (curatedOnly && !p.portalFeatured) return false;
        if (heldOnly && holdingFor(p.symbols, held).status === "none")
          return false;
        if (p.apy < minApyN) return false;
        if (p.tvlUsd < minTvlN) return false;
        if (q && !`${p.projectLabel} ${p.symbol}`.toUpperCase().includes(q))
          return false;
        return true;
      })
      .sort((a, b) => {
        const diff = accessor(a) - accessor(b);
        if (diff !== 0) return diff * dir;
        return a.id.localeCompare(b.id);
      });
  }, [pools, held, search, curatedOnly, heldOnly, minApy, minTvl, sortKey, sortDir]);

  const visible = filtered.slice(0, visibleCount);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir("desc");
    }
  };

  const inputCls =
    "px-2 py-1.5 rounded-lg border border-border bg-surface text-sm placeholder:text-muted focus:outline-none focus:border-accent";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted mr-auto">
          explore arbitrum
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPaging();
            }}
            placeholder="Search protocol or token"
            className={`${inputCls} pl-8 w-52`}
          />
        </div>
        <MinFilter
          label="min apy"
          unit="%"
          value={minApy}
          onChange={(v) => {
            setMinApy(v);
            resetPaging();
          }}
        />
        <MinFilter
          label="min tvl"
          unit="$M"
          value={minTvl}
          onChange={(v) => {
            setMinTvl(v);
            resetPaging();
          }}
        />
        <button
          type="button"
          onClick={() => {
            setCuratedOnly((v) => !v);
            resetPaging();
          }}
          aria-pressed={curatedOnly}
          className={`text-[11px] font-mono uppercase tracking-wider rounded-lg px-3 py-1.5 border transition-colors ${
            curatedOnly
              ? "border-gold/50 bg-gold/10 text-gold"
              : "border-border text-muted hover:text-foreground"
          }`}
        >
          curated by Arbitrum
        </button>
        <button
          type="button"
          onClick={() => {
            setHeldOnly((v) => !v);
            resetPaging();
          }}
          aria-pressed={heldOnly}
          className={`text-[11px] font-mono uppercase tracking-wider rounded-lg px-3 py-1.5 border transition-colors ${
            heldOnly
              ? "border-mint/50 bg-mint/10 text-mint"
              : "border-border text-muted hover:text-foreground"
          }`}
        >
          in my wallet
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface">
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-surface-2 rounded-t-xl text-[10px] font-mono uppercase tracking-widest text-muted">
          <div className="col-span-5">pool</div>
          <div className="col-span-3 flex justify-end">
            <SortHeader
              label="TVL"
              sortKey="tvl"
              active={sortKey === "tvl"}
              dir={sortDir}
              onClick={toggleSort}
            />
          </div>
          <div className="col-span-2 flex justify-end">
            <SortHeader
              label="APY"
              sortKey="apy"
              active={sortKey === "apy"}
              dir={sortDir}
              onClick={toggleSort}
            />
          </div>
          <div className="col-span-2 flex justify-end">
            <SortHeader
              label="score"
              sortKey="score"
              active={sortKey === "score"}
              dir={sortDir}
              onClick={toggleSort}
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-strong">
            No pools match these filters.
          </div>
        ) : (
          <ul className="divide-y hairline">
            {visible.map((pool) => (
              <li
                key={pool.id}
                className="grid grid-cols-12 gap-4 px-5 py-3 items-center hover:bg-surface-2/60 transition-colors"
              >
                <div className="col-span-7 md:col-span-5 min-w-0 flex items-center gap-2.5">
                  <ProtocolIcon iconPath={pool.iconPath} tier={pool.tier} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate flex items-center gap-1.5">
                      <span className="truncate">{pool.projectLabel}</span>
                      <a
                        href={poolUrl(pool)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Open ${pool.projectLabel} pool on DeFiLlama`}
                        className="text-muted hover:text-foreground flex-shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="text-[11px] text-muted font-mono truncate flex items-center gap-1.5">
                      <span className="truncate">{pool.symbol}</span>
                      {pool.portalFeatured ? (
                        <CuratedBadge category={pool.portalCategory} />
                      ) : null}
                      <HoldingBadge symbols={pool.symbols} held={held} />
                    </div>
                  </div>
                </div>
                <div className="hidden md:block col-span-3 text-right font-mono tabular text-sm text-muted-strong">
                  {fmtTvl(pool.tvlUsd)}
                </div>
                <div className="col-span-3 md:col-span-2 text-right font-mono tabular text-sm font-medium">
                  {fmtApy(pool.apy)}
                </div>
                <div className="col-span-2 text-right">
                  <ScoreCell pool={pool} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
          showing {visible.length} of {filtered.length}
        </div>
        {visibleCount < filtered.length ? (
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="text-[11px] font-mono uppercase tracking-wider rounded-lg px-3 py-1.5 border border-border text-muted-strong hover:text-foreground hover:border-accent transition-colors"
          >
            Show more
          </button>
        ) : null}
      </div>
    </div>
  );
}
