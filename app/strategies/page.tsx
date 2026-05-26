import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Strategies — ArbiFlow",
  description:
    "Live snapshot of the ranked Arbitrum strategy universe — lending, LP, vaults, fixed-yield — with risk and net APY at a glance.",
};

const families = [
  {
    name: "Lending",
    venues: ["Aave v3", "Radiant", "Silo", "Compound v3"],
    avgApy: "4.2–6.8%",
    risk: "Low",
    tone: "mint",
  },
  {
    name: "Concentrated LP",
    venues: ["Uniswap v3", "Pancakeswap v3", "Ramses"],
    avgApy: "9–22%",
    risk: "Med",
    tone: "gold",
  },
  {
    name: "Fixed yield",
    venues: ["Pendle PT", "Notional"],
    avgApy: "5–11%",
    risk: "Low–Med",
    tone: "mint",
  },
  {
    name: "Vaults",
    venues: ["Beefy", "Yearn", "Range"],
    avgApy: "6–15%",
    risk: "Med",
    tone: "gold",
  },
  {
    name: "Perps LP",
    venues: ["GMX v2", "Gains Network"],
    avgApy: "12–28%",
    risk: "High",
    tone: "rose",
  },
];

const sample = [
  { protocol: "Aave v3", asset: "USDC", apy: 4.31, risk: "Low" },
  { protocol: "Compound v3", asset: "USDC", apy: 4.18, risk: "Low" },
  { protocol: "Silo", asset: "USDC.e / wstETH", apy: 5.64, risk: "Low" },
  { protocol: "Radiant", asset: "USDC", apy: 6.84, risk: "Med" },
  { protocol: "Pendle PT", asset: "ezETH", apy: 8.92, risk: "Low" },
  { protocol: "Camelot v3", asset: "USDC / ARB", apy: 12.41, risk: "Med" },
  { protocol: "GMX v2", asset: "GLP", apy: 14.22, risk: "High" },
];

export default function StrategiesPage() {
  return (
    <PageShell>
      <PageHeader
        section="[E] · Strategies"
        title={
          <>
            Every Arbitrum yield venue, ranked by{" "}
            <span className="gradient-text-gold">net APY.</span>
          </>
        }
        subtitle="The strategy universe ArbiFlow scores against. Forty venues across five families. Each one re-scored every 60 seconds against gas, volatility, and your wallet size."
      />

      <Section number="01" label="Families" title="Five families. One score.">
        <div className="lg:col-span-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-border rounded-xl overflow-hidden">
          {families.map((f) => (
            <div key={f.name} className="bg-background p-6">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">
                {f.name}
              </div>
              <div
                className={`font-mono tabular text-2xl font-semibold mb-1 ${
                  f.tone === "gold"
                    ? "gradient-text-gold"
                    : f.tone === "rose"
                      ? "text-rose"
                      : "text-foreground"
                }`}
              >
                {f.avgApy}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted mb-4">
                avg net apy · risk {f.risk}
              </div>
              <ul className="space-y-1 text-xs text-muted">
                {f.venues.map((v) => (
                  <li key={v}>· {v}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section number="02" label="Live ranking" title="A read of the top of the book right now.">
        <div className="lg:col-span-12">
          <div className="rounded-xl border border-border-strong bg-surface overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-2 border-b border-border text-[10px] font-mono uppercase tracking-widest text-muted">
              <div className="col-span-1">#</div>
              <div className="col-span-4">protocol</div>
              <div className="col-span-4">asset</div>
              <div className="col-span-2 text-right">net APY</div>
              <div className="col-span-1 text-right">risk</div>
            </div>
            <ul className="divide-y hairline">
              {[...sample]
                .sort((a, b) => b.apy - a.apy)
                .map((s, i) => (
                  <li
                    key={s.protocol + s.asset}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center"
                  >
                    <div className="col-span-1 font-mono text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="col-span-4 flex items-center gap-2">
                      <span className="font-medium">{s.protocol}</span>
                      <ArrowUpRight className="w-3 h-3 text-muted" />
                    </div>
                    <div className="col-span-4 font-mono text-sm text-muted-strong">
                      {s.asset}
                    </div>
                    <div className="col-span-2 text-right">
                      <span
                        className={`font-mono tabular font-medium ${
                          i === 0 ? "gradient-text-gold" : ""
                        }`}
                      >
                        {s.apy.toFixed(2)}%
                      </span>
                    </div>
                    <div className="col-span-1 text-right text-[10px] font-mono uppercase tracking-widest text-muted">
                      {s.risk}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
          <p className="mt-4 text-xs text-muted">
            Snapshot rendered from the open-data feed. Connect a wallet to see
            the same list re-ranked against your size and risk tolerance.
          </p>
        </div>
      </Section>
    </PageShell>
  );
}
