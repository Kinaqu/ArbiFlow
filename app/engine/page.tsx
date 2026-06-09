import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Engine — ArbiFlow",
  description:
    "How ArbiFlow's decision engine scans wallets and ranks Arbitrum DeFi pools with a single 0–100 composite score over APY, TVL, trust, stability and forecast.",
};

const pipeline = [
  {
    n: "01",
    title: "Wallet ingest",
    body:
      "Read public balances with viem multicall across Arbitrum, Base and Optimism — a couple of RPC round-trips, no signature.",
    detail: "multicall · no signature",
  },
  {
    n: "02",
    title: "Idle classification",
    body:
      "Any stablecoin sitting above the $5 dust threshold is flagged idle. Volatile assets (ETH, WBTC) are tracked but never flagged.",
    detail: "deterministic · transparent",
  },
  {
    n: "03",
    title: "Pool fetch",
    body:
      "Pull live Arbitrum pools from DeFiLlama — yield, TVL, and a Stable/Up forecast — refreshed every 5 minutes with a snapshot fallback.",
    detail: "DeFiLlama · 5-min refresh",
  },
  {
    n: "04",
    title: "Score & rank",
    body:
      "Apply the composite to every curated and honorable-mention pool, then sort by the 0–100 score (ties broken by TVL).",
    detail: "S = APY + TVL + Trust + Stability + Forecast",
  },
  {
    n: "05",
    title: "Deploy",
    body:
      "Build the transaction in-browser. You sign with your wallet. Funds route straight to the protocol — Aave native, Enso routing, or a cross-chain bridge. ArbiFlow never custodies.",
    detail: "1 signature · non-custodial",
  },
];

const factors: { sym: string; color: string; desc: string; pts: string }[] = [
  { sym: "APY", color: "#34E0A1", desc: "live pool yield (base + reward), log-scaled", pts: "40" },
  { sym: "TVL", color: "#2F7BFF", desc: "pool depth, log-scaled to $100M", pts: "20" },
  { sym: "Trust", color: "#F4B53F", desc: "curated tier — blue-chip vs honorable", pts: "15" },
  { sym: "Stability", color: "#6FA5FF", desc: "stablecoin + no impermanent loss", pts: "15" },
  { sym: "Forecast", color: "#FF8A3F", desc: "DeFiLlama Stable/Up probability", pts: "10" },
];

export default function EnginePage() {
  return (
    <PageShell>
      <PageHeader
        section="[A] · Engine"
        title={
          <>
            The decision engine for{" "}
            <span className="gradient-text-gold">idle capital.</span>
          </>
        }
        subtitle="ArbiFlow is not a yield aggregator. It is a scoring pipeline that turns a wallet address into an ordered list of pools, with the math behind every score exposed."
      />

      <Section number="01" label="Pipeline" title="From address to deploy in five stages.">
        <div className="lg:col-span-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-border rounded-xl overflow-hidden">
          {pipeline.map((p) => (
            <div key={p.n} className="bg-background p-6 flex flex-col">
              <div className="font-mono text-xs text-muted mb-3">{p.n}</div>
              <div className="text-base font-medium mb-2">{p.title}</div>
              <p className="text-sm text-muted-strong leading-relaxed flex-1">
                {p.body}
              </p>
              <div className="mt-5 pt-4 border-t hairline text-[10px] font-mono uppercase tracking-widest text-muted">
                {p.detail}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section number="02" label="Scoring formula" title="One composite. Run on every pool.">
        <div className="lg:col-span-5">
          <p className="text-muted-strong leading-relaxed">
            Every pool produces a single 0–100 score. The weights are fixed
            across the universe — no per-partner tuning, no hidden multipliers.
            The same breakdown you see here shows up on every strategy card in
            the dashboard.
          </p>
        </div>
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-border-strong bg-surface-2 p-8 font-mono">
            <div className="text-[10px] uppercase tracking-widest text-muted mb-4">
              score(pool) · 0–100
            </div>
            <div className="text-xl lg:text-2xl tabular leading-relaxed flex flex-wrap items-baseline gap-x-2">
              <span className="text-foreground">S =</span>
              {factors.map((f, i) => (
                <span key={f.sym} className="inline-flex items-baseline gap-2">
                  {i > 0 && <span className="text-muted-strong">+</span>}
                  <span style={{ color: f.color }}>{f.sym}</span>
                </span>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-[auto_1fr_auto] gap-y-3 gap-x-6 text-xs items-baseline">
              {factors.map((f) => (
                <FactorRow key={f.sym} {...f} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section number="03" label="Trust model" title="Read the math. No partner priority.">
        <div className="lg:col-span-7">
          <p className="text-muted-strong leading-relaxed mb-6">
            Every strategy card in the dashboard breaks its score into the five
            factors above, with the raw APY, TVL and forecast visible at a
            glance. The same formula runs across every pool.
          </p>
          <p className="text-muted-strong leading-relaxed">
            No A/B tests on weights. No partner-priority ordering. If a worse
            pool comes from a protocol we like more, the better pool still ranks
            first.
          </p>
        </div>
        <div className="lg:col-span-5 space-y-3">
          <Link
            href="/risk-model"
            className="block rounded-lg border border-border bg-surface p-5 hover:border-border-strong transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Risk model</span>
              <ArrowRight className="w-4 h-4 text-muted" />
            </div>
            <p className="text-xs text-muted">
              How trust, stability, and forecast price resilience into the score.
            </p>
          </Link>
          <Link
            href="/methodology"
            className="block rounded-lg border border-border bg-surface p-5 hover:border-border-strong transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Methodology</span>
              <ArrowRight className="w-4 h-4 text-muted" />
            </div>
            <p className="text-xs text-muted">
              Data sources, refresh cadence, and known limits.
            </p>
          </Link>
          <Link
            href="/architecture"
            className="block rounded-lg border border-border bg-surface p-5 hover:border-border-strong transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Architecture</span>
              <ArrowRight className="w-4 h-4 text-muted" />
            </div>
            <p className="text-xs text-muted">
              Live mainnet intelligence + the testnet delegation vault.
            </p>
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}

function FactorRow({
  sym,
  color,
  desc,
  pts,
}: {
  sym: string;
  color: string;
  desc: string;
  pts: string;
}) {
  return (
    <>
      <div style={{ color }}>{sym}</div>
      <div className="text-muted-strong">{desc}</div>
      <div className="text-muted tabular text-right">{pts}</div>
    </>
  );
}
