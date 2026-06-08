import type { Metadata } from "next";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Risk model — ArbiFlow",
  description:
    "How ArbiFlow prices risk: resilience is built into the 100-point score through TVL, protocol trust, stability and a yield forecast — and what the model deliberately does not do.",
};

// The five score factors (lib/score.ts). 60 of the 100 points reward
// resilience; the remaining 40 reward raw yield.
const factors = [
  {
    name: "APY",
    pts: 40,
    color: "#34E0A1",
    role: "yield",
    how: "Base + reward APY from DeFiLlama on a log curve that saturates near 30%, so a 4% pool and a 6% pool are close, not 50% apart.",
  },
  {
    name: "TVL",
    pts: 20,
    color: "#2F7BFF",
    role: "resilience",
    how: "Pool depth, log-scaled to $100M. Deeper liquidity is harder to move and cheaper to exit, so it scores higher.",
  },
  {
    name: "Trust",
    pts: 15,
    color: "#F4B53F",
    role: "resilience",
    how: "Full marks for the curated blue-chip protocols; honorable-mention pools from the wider universe earn partial credit.",
  },
  {
    name: "Stability",
    pts: 15,
    color: "#6FA5FF",
    role: "resilience",
    how: "Stablecoin pools score on the asset; pools with no impermanent-loss exposure score on IL. A stable, single-sided pool earns both.",
  },
  {
    name: "Forecast",
    pts: 10,
    color: "#FF8A3F",
    role: "resilience",
    how: "DeFiLlama's Stable/Up probability that the pool's yield holds rather than decaying — straight from their prediction feed.",
  },
];

const notModeled: [string, string][] = [
  [
    "Audit / security scoring",
    "We curate by protocol reputation (trust factor); we don't grade individual audits or attestations.",
  ],
  [
    "Asset volatility (σ)",
    "No per-asset standard deviation or depeg history. Stability is a binary stablecoin / IL signal, not a variance model.",
  ],
  [
    "Gas & impermanent-loss simulation",
    "The score is not net of gas, and IL is a yes/no flag — not a position-level simulation against price ranges.",
  ],
  [
    "Withdrawal latency",
    "Cooldowns, queues, and exit delays aren't modeled. TVL is the only liquidity proxy.",
  ],
  [
    "Point-in-time data",
    "APY and TVL are the latest DeFiLlama reading (refreshed ~5 min), not a 30-day average — fresh spikes are visible, not smoothed.",
  ],
  [
    "Other chains",
    "Scoring is Arbitrum-only. Balances are read on Base and Optimism so idle capital can be bridged in, but pools are ranked on Arbitrum.",
  ],
];

export default function RiskModelPage() {
  return (
    <PageShell>
      <PageHeader
        section="[B] · Risk model"
        title={
          <>
            Risk, priced into{" "}
            <span className="gradient-text-gold">the score.</span>
          </>
        }
        subtitle="ArbiFlow doesn't bolt a separate risk grade onto a yield number. Resilience is built into the 100-point composite — 60 of the points reward depth, trust, stable assets and a holding forecast; the other 40 reward yield."
      />

      <Section number="01" label="Factors" title="Where every point comes from.">
        <div className="lg:col-span-12 rounded-xl border border-border-strong bg-surface overflow-hidden">
          {factors.map((f) => (
            <div
              key={f.name}
              className="px-6 py-5 border-b border-border last:border-0 grid lg:grid-cols-12 gap-4 items-baseline"
            >
              <div className="lg:col-span-3 flex items-center gap-3">
                <span
                  className="w-2 h-8 rounded-sm flex-shrink-0"
                  style={{ background: f.color }}
                />
                <div>
                  <div className="text-sm font-medium">{f.name}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-0.5">
                    {f.role}
                  </div>
                </div>
              </div>
              <p className="lg:col-span-8 text-sm text-muted-strong leading-relaxed">
                {f.how}
              </p>
              <div className="lg:col-span-1 font-mono tabular text-2xl font-semibold text-right">
                {f.pts}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        number="02"
        label="Limits"
        title="What this model deliberately does not do."
      >
        <div className="lg:col-span-12">
          <p className="text-muted-strong leading-relaxed mb-8 max-w-2xl">
            The honest version: the score is a clear, deterministic composite —
            not a risk oracle. These are the things it does not claim to capture.
          </p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
            {notModeled.map(([k, v]) => (
              <li key={k} className="bg-background p-6">
                <div className="text-sm font-medium mb-2">{k}</div>
                <p className="text-sm text-muted leading-relaxed">{v}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </PageShell>
  );
}
