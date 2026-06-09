import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";
import { POOLS_SCORED } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Strategies — ArbiFlow",
  description:
    "The Arbitrum pool universe ArbiFlow ranks — curated protocols plus honorable mentions across lending, LP, fixed yield and perps, scored 0–100.",
};

const families = [
  {
    name: "Lending",
    venues: ["Aave v3", "Radiant", "Compound v3"],
    apy: "4–7%",
    risk: "Low",
    tone: "mint",
  },
  {
    name: "Concentrated LP",
    venues: ["Uniswap v3", "Camelot v3"],
    apy: "8–20%",
    risk: "Med",
    tone: "gold",
  },
  {
    name: "Stable LP",
    venues: ["Curve"],
    apy: "5–12%",
    risk: "Low–Med",
    tone: "mint",
  },
  {
    name: "Fixed yield",
    venues: ["Pendle"],
    apy: "6–11%",
    risk: "Low–Med",
    tone: "mint",
  },
  {
    name: "Perps · real yield",
    venues: ["GMX v2"],
    apy: "10–25%",
    risk: "High",
    tone: "rose",
  },
];

// Indicative sample — not live. A real scan ranks current pools by score.
const sample = [
  { protocol: "Aave v3", asset: "USDC", apy: 4.31, score: 82 },
  { protocol: "Compound v3", asset: "USDC", apy: 4.18, score: 80 },
  { protocol: "Curve", asset: "crvUSD", apy: 7.45, score: 76 },
  { protocol: "Pendle", asset: "USDC PT", apy: 8.92, score: 73 },
  { protocol: "Radiant", asset: "USDC", apy: 6.84, score: 71 },
  { protocol: "Camelot v3", asset: "USDC / ARB", apy: 12.41, score: 66 },
  { protocol: "GMX v2", asset: "GLP", apy: 14.22, score: 64 },
];

export default function StrategiesPage() {
  return (
    <PageShell>
      <PageHeader
        section="[E] · Strategies"
        title={
          <>
            Every Arbitrum pool, ranked by{" "}
            <span className="gradient-text-gold">a single score.</span>
          </>
        }
        subtitle={`The universe ArbiFlow scores: 8 curated protocols plus honorable mentions from the wider DeFiLlama feed — ${POOLS_SCORED}+ pools, refreshed every 5 minutes and ranked 0–100.`}
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
                {f.apy}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted mb-4">
                indicative apy · risk {f.risk}
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

      <Section number="02" label="Sample ranking" title="A read of the top of the book.">
        <div className="lg:col-span-12">
          <div className="rounded-xl border border-border-strong bg-surface overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-2 border-b border-border text-[10px] font-mono uppercase tracking-widest text-muted">
              <div className="col-span-1">#</div>
              <div className="col-span-4">protocol</div>
              <div className="col-span-4">asset</div>
              <div className="col-span-2 text-right">APY</div>
              <div className="col-span-1 text-right">score</div>
            </div>
            <ul className="divide-y hairline">
              {[...sample]
                .sort((a, b) => b.score - a.score)
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
                    <div className="col-span-2 text-right font-mono tabular text-muted-strong">
                      {s.apy.toFixed(2)}%
                    </div>
                    <div className="col-span-1 text-right">
                      <span
                        className={`font-mono tabular font-medium ${
                          i === 0 ? "gradient-text-gold" : ""
                        }`}
                      >
                        {s.score}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
          <p className="mt-4 text-xs text-muted">
            Indicative sample, not live. Connect a wallet to score and rank
            current pools against your idle capital.
          </p>
        </div>
      </Section>
    </PageShell>
  );
}
