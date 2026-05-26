import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Engine — ArbiFlow",
  description:
    "How ArbiFlow's decision engine scans wallets, ranks DeFi strategies by risk-adjusted net APY, and surfaces what your capital is missing.",
};

const pipeline = [
  {
    n: "01",
    title: "Wallet ingest",
    body:
      "Read public balances directly from Arbitrum via multicall — one RPC round-trip for the entire Top-20 token index.",
    detail: "~600ms · no signature",
  },
  {
    n: "02",
    title: "Idle classification",
    body:
      "Any stable asset sitting in an EOA above the $5 dust threshold is marked idle. Volatile assets (ETH, WBTC) are tracked but never flagged.",
    detail: "deterministic · transparent",
  },
  {
    n: "03",
    title: "Protocol fetch",
    body:
      "Pull live yields for ~40 Arbitrum venues from DeFiLlama, then re-normalize over a 30-day window to strip out spike noise.",
    detail: "30-day TWAP · gas-adjusted",
  },
  {
    n: "04",
    title: "Score & rank",
    body:
      "Apply the published formula to every (token × protocol) pair. Sort by net APY after risk, IL, and your wallet-size gas curve.",
    detail: "S = APY + INC − R − σ − IL − G",
  },
  {
    n: "05",
    title: "Deploy",
    body:
      "Build the transaction in-browser. You sign with your wallet. Funds route directly to the protocol — ArbiFlow never custodies.",
    detail: "1 signature · non-custodial",
  },
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
        subtitle="ArbiFlow is not a yield aggregator. It is a scoring pipeline that turns a wallet address into an ordered list of strategies, with the math behind every position exposed and editable."
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

      <Section number="02" label="Scoring formula" title="One formula. Run on every pair.">
        <div className="lg:col-span-5">
          <p className="text-muted-strong leading-relaxed">
            Every (token, protocol) combination produces a single net score.
            The formula is fixed across the universe — no per-partner tuning,
            no hidden multipliers. You can override the weights yourself in
            the dashboard once Phase 2 lands.
          </p>
        </div>
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-border-strong bg-surface-2 p-8 font-mono">
            <div className="text-[10px] uppercase tracking-widest text-muted mb-4">
              score(token, protocol)
            </div>
            <div className="text-xl lg:text-2xl tabular leading-relaxed">
              <span className="text-foreground">S = </span>
              <span className="text-mint">APY</span>
              <span className="text-muted-strong"> + </span>
              <span className="text-mint">INC</span>
              <span className="text-muted-strong"> − </span>
              <span className="text-gold">R</span>
              <span className="text-muted-strong"> − </span>
              <span className="text-gold">σ</span>
              <span className="text-muted-strong"> − </span>
              <span className="text-gold">IL</span>
              <span className="text-muted-strong"> − </span>
              <span className="text-rose">G</span>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
              <div className="text-muted">APY</div>
              <div>raw protocol yield, 30-day TWAP</div>
              <div className="text-muted">INC</div>
              <div>incentive token, decay-adjusted</div>
              <div className="text-muted">R</div>
              <div>protocol risk weight (0–10)</div>
              <div className="text-muted">σ</div>
              <div>30-day volatility of underlying</div>
              <div className="text-muted">IL</div>
              <div>impermanent loss estimate (LP only)</div>
              <div className="text-muted">G</div>
              <div>gas cost amortized over hold period</div>
            </div>
          </div>
        </div>
      </Section>

      <Section number="03" label="Trust model" title="Read the math. Override the weights.">
        <div className="lg:col-span-7">
          <p className="text-muted-strong leading-relaxed mb-6">
            The engine&apos;s outputs are only as good as the inputs you can
            audit. Every strategy card in the dashboard breaks down its score
            into the six terms above, with the raw values and sources visible
            in a single click. If you disagree with our default risk weight
            for a venue, override it — the engine recomputes in milliseconds.
          </p>
          <p className="text-muted-strong leading-relaxed">
            We publish the dataset, the formula, and the rankings together.
            No A/B tests on weights. No partner-priority ordering. If a worse
            protocol is paying us more, you still see the better protocol
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
              How protocol risk, liquidity, and volatility are scored.
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
              Data sources, normalization, refresh cadence, known limits.
            </p>
          </Link>
          <Link
            href="/open-data"
            className="block rounded-lg border border-border bg-surface p-5 hover:border-border-strong transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Open data</span>
              <ArrowRight className="w-4 h-4 text-muted" />
            </div>
            <p className="text-xs text-muted">
              Daily snapshots of the full strategy universe — CSV + JSON.
            </p>
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
