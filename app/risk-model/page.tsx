import type { Metadata } from "next";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Risk model — ArbiFlow",
  description:
    "ArbiFlow's four-axis risk model: protocol, volatility, liquidity, and execution cost. Published weights and per-dimension scoring criteria.",
};

const axes = [
  {
    name: "Protocol risk",
    weight: 30,
    color: "#F4B53F",
    inputs: [
      "Audit count and severity from registries",
      "Time live (decayed past 24 months)",
      "TVL stability over 90-day window",
      "Historical exploit / freeze events",
    ],
    floor:
      "A protocol with no audits and < 30 days of mainnet history caps at 5/10 regardless of TVL.",
  },
  {
    name: "Volatility (σ)",
    weight: 25,
    color: "#2F7BFF",
    inputs: [
      "30-day rolling standard deviation of the underlying asset",
      "Depeg history for stables (any deviation > 1% counted)",
      "Correlation to ETH for non-stables",
    ],
    floor:
      "Stable assets that have depegged in the last 18 months get a permanent +2 volatility penalty.",
  },
  {
    name: "Liquidity",
    weight: 25,
    color: "#34E0A1",
    inputs: [
      "Pool TVL (direct withdrawal capacity)",
      "Aggregator depth at ±2% slippage",
      "Withdrawal cooldown or queue delay",
    ],
    floor:
      "Any strategy where the worst-case withdrawal at $10k exceeds 7 days is automatically excluded.",
  },
  {
    name: "Execution cost (G)",
    weight: 20,
    color: "#FF5A6B",
    inputs: [
      "Gas estimate for entry and exit txs at current basefee",
      "Simulated against your wallet size (cost amortization)",
      "Bridge or wrap surcharges if applicable",
    ],
    floor:
      "If gas + slippage on $1k entry exceeds 5% of annualized yield, the strategy is hidden by default.",
  },
];

export default function RiskModelPage() {
  return (
    <PageShell>
      <PageHeader
        section="[B] · Risk model"
        title={
          <>
            Four axes.{" "}
            <span className="text-muted">Published weights.</span>
          </>
        }
        subtitle="Risk is impossible to price without a model. We publish ours — every axis, every input, every floor. If you disagree with a weight, override it in the dashboard."
      />

      <Section number="01" label="Weights" title="The default weighting.">
        <div className="lg:col-span-5">
          <p className="text-muted-strong leading-relaxed mb-6">
            These weights sum to 100% and apply to every strategy uniformly.
            They were calibrated on Q4 2025 Arbitrum data, validated against
            12 months of realized PnL, and rebalanced quarterly. The exact
            calibration dataset is published under{" "}
            <span className="text-foreground">Open data</span>.
          </p>
          <p className="text-muted-strong leading-relaxed">
            Sliding any weight in the dashboard re-runs the engine instantly
            — you can immediately see how aggressive or conservative your
            view reshuffles the ranking.
          </p>
        </div>
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-border-strong bg-surface overflow-hidden">
            {axes.map((a) => (
              <div
                key={a.name}
                className="px-6 py-5 border-b border-border last:border-0 flex items-center gap-5"
              >
                <span
                  className="w-2 h-12 rounded-sm flex-shrink-0"
                  style={{ background: a.color }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{a.name}</div>
                  <div className="text-xs text-muted mt-0.5">{a.inputs.length} inputs</div>
                </div>
                <div className="font-mono tabular text-2xl font-semibold">
                  {a.weight}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {axes.map((a, i) => (
        <Section
          key={a.name}
          number={String(i + 2).padStart(2, "0")}
          label={a.name}
          title={
            <>
              {a.name}{" "}
              <span className="text-muted font-mono">· {a.weight}% weight</span>
            </>
          }
        >
          <div className="lg:col-span-7">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">
              inputs
            </div>
            <ul className="space-y-3">
              {a.inputs.map((inp) => (
                <li key={inp} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: a.color }}
                  />
                  <span className="text-muted-strong">{inp}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">
              hard floor
            </div>
            <p className="text-muted-strong leading-relaxed">{a.floor}</p>
          </div>
        </Section>
      ))}

      <Section number="06" label="What we do not model" title="What this model deliberately ignores.">
        <div className="lg:col-span-12">
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
            {[
              {
                k: "Governance risk",
                v: "Token-vote rug potential. Too qualitative for a deterministic score.",
              },
              {
                k: "Counterparty risk on CEX",
                v: "We only rank on-chain DeFi. CEX earn products are out of scope.",
              },
              {
                k: "Regulatory exposure",
                v: "Jurisdiction is the user's responsibility, not the model's.",
              },
              {
                k: "MEV / sandwich loss",
                v: "Captured indirectly via execution cost; not modeled per-tx.",
              },
              {
                k: "Smart contract upgrades",
                v: "Upgradable proxies penalized once in protocol-risk weight, not re-scored daily.",
              },
              {
                k: "Macro / market beta",
                v: "We measure asset volatility, not directional thesis. That is your call.",
              },
            ].map((x) => (
              <li key={x.k} className="bg-background p-6">
                <div className="text-sm font-medium mb-2">{x.k}</div>
                <p className="text-sm text-muted leading-relaxed">{x.v}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </PageShell>
  );
}
