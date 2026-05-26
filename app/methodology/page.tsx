import type { Metadata } from "next";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Methodology — ArbiFlow",
  description:
    "Data sources, normalization, gas simulation, refresh cadence, and known limitations behind ArbiFlow's scoring pipeline.",
};

const sources = [
  {
    name: "DeFiLlama",
    used: "Protocol yields, TVL, incentive token decay curves",
    refresh: "60s cache · 30-day TWAP applied",
  },
  {
    name: "Arbitrum public RPC",
    used: "Wallet balances, on-chain prices for read-time validation",
    refresh: "live · multicall batched",
  },
  {
    name: "CoinGecko / DeFiLlama prices",
    used: "USD valuation for every tracked token",
    refresh: "60s cache · fallback chain on 404",
  },
  {
    name: "Audit registries",
    used: "Audit count, severity, attestation source",
    refresh: "weekly · manual diff review",
  },
];

export default function MethodologyPage() {
  return (
    <PageShell>
      <PageHeader
        section="[C] · Methodology"
        title={
          <>
            How a yield becomes a{" "}
            <span className="gradient-text-gold">score.</span>
          </>
        }
        subtitle="Everything that happens between a raw protocol APY and the number you see in the dashboard. Sources, transforms, and the limits we have not solved yet."
      />

      <Section number="01" label="Data sources" title="Where every input comes from.">
        <div className="lg:col-span-12">
          <div className="rounded-xl border border-border-strong overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-2 border-b border-border text-[10px] font-mono uppercase tracking-widest text-muted">
              <div className="col-span-3">source</div>
              <div className="col-span-6">used for</div>
              <div className="col-span-3">refresh</div>
            </div>
            <ul className="divide-y hairline">
              {sources.map((s) => (
                <li key={s.name} className="grid md:grid-cols-12 gap-4 px-6 py-5 bg-surface">
                  <div className="md:col-span-3 font-medium">{s.name}</div>
                  <div className="md:col-span-6 text-muted-strong">{s.used}</div>
                  <div className="md:col-span-3 font-mono text-xs text-muted">{s.refresh}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section
        number="02"
        label="APY normalization"
        title="From raw advertised yield to comparable net APY."
      >
        <div className="lg:col-span-7 space-y-5 text-muted-strong leading-relaxed">
          <p>
            Protocols quote yield in incompatible ways: spot, weekly, monthly,
            with or without incentive tokens, sometimes annualized off a 3-day
            sample. We pull the raw figure, then apply three transforms before
            it enters the score.
          </p>
          <ol className="list-decimal pl-5 space-y-2.5">
            <li>
              <span className="text-foreground">30-day TWAP</span> on base APY
              to strip out flash incentive spikes.
            </li>
            <li>
              <span className="text-foreground">Incentive decay</span> models
              token rewards over the next 90 days at the protocol&apos;s
              advertised emission schedule.
            </li>
            <li>
              <span className="text-foreground">Net of gas</span> at your wallet
              size — we simulate entry and exit transactions at current basefee
              and subtract amortized cost over a 90-day hold.
            </li>
          </ol>
        </div>
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-border bg-surface-2 p-6 font-mono text-sm">
            <div className="text-[10px] uppercase tracking-widest text-muted mb-3">
              example · Aave USDC
            </div>
            <div className="space-y-2 text-muted-strong">
              <div className="flex justify-between">
                <span>raw advertised</span>
                <span className="text-foreground">5.92%</span>
              </div>
              <div className="flex justify-between">
                <span>30-day TWAP</span>
                <span className="text-foreground">4.71%</span>
              </div>
              <div className="flex justify-between">
                <span>+ incentive (decay)</span>
                <span className="text-mint">+0.14%</span>
              </div>
              <div className="flex justify-between">
                <span>− gas (on $1k)</span>
                <span className="text-rose">−0.18%</span>
              </div>
              <div className="border-t hairline pt-2 flex justify-between">
                <span className="text-muted">net APY</span>
                <span className="gradient-text-gold font-semibold">4.67%</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section number="03" label="Gas simulation" title="Why your wallet size changes the ranking.">
        <div className="lg:col-span-12 grid md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
          {[
            {
              size: "$100",
              winner: "Aave USDC",
              note: "Gas dominates. High-fixed-cost LP strategies are unreachable.",
            },
            {
              size: "$2,500",
              winner: "Radiant USDC",
              note: "Sweet spot for the middle of the curve — incentives outweigh gas.",
            },
            {
              size: "$25,000",
              winner: "Pendle USDC PT",
              note: "Gas is rounding error. Fixed-yield and concentrated LP win.",
            },
          ].map((c) => (
            <div key={c.size} className="bg-background p-6">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">
                deploy size · {c.size}
              </div>
              <div className="text-lg font-medium mb-2">{c.winner}</div>
              <p className="text-sm text-muted leading-relaxed">{c.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section number="04" label="Known limits" title="What this engine cannot tell you.">
        <div className="lg:col-span-12">
          <ul className="space-y-4 text-muted-strong leading-relaxed">
            <li>
              <span className="text-foreground">It does not predict price.</span>{" "}
              ETH could halve tomorrow; the score will not warn you.
            </li>
            <li>
              <span className="text-foreground">It does not catch fresh exploits.</span>{" "}
              Audit registries lag. If a protocol was attacked two hours ago,
              the model still ranks it on yesterday&apos;s risk.
            </li>
            <li>
              <span className="text-foreground">It assumes you hold 90 days.</span>{" "}
              Shorter horizons make gas-heavy entries punishing; the dashboard
              lets you change the assumption.
            </li>
            <li>
              <span className="text-foreground">It is Arbitrum-only.</span>{" "}
              Multi-chain comparison is not in scope — the model is calibrated
              to Arbitrum gas economics.
            </li>
          </ul>
        </div>
      </Section>
    </PageShell>
  );
}
