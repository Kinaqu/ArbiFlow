import type { Metadata } from "next";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Methodology — ArbiFlow",
  description:
    "Data sources, the pool-to-score transform, refresh cadence, and known limits behind ArbiFlow's 0–100 composite.",
};

const sources = [
  {
    name: "DeFiLlama yields",
    used: "Pool APY (base + reward), TVL, and the Stable/Up forecast",
    refresh: "5-min cache · snapshot fallback",
  },
  {
    name: "DeFiLlama prices",
    used: "USD valuation for every scanned wallet token",
    refresh: "live · 4h search window",
  },
  {
    name: "Public RPC · Arbitrum / Base / Optimism",
    used: "Wallet balances, read on-chain via multicall",
    refresh: "live · batched",
  },
];

const example: { row: string; val: string; tone?: "mint" | "muted" }[] = [
  { row: "APY · log10(1+4.31) / log10(31) × 40", val: "19.4", tone: "mint" },
  { row: "TVL · $210M, log-scaled to $100M × 20", val: "20.0", tone: "mint" },
  { row: "Trust · curated (core) tier", val: "15.0", tone: "mint" },
  { row: "Stability · stablecoin + no IL", val: "15.0", tone: "mint" },
  { row: "Forecast · Stable/Up 85% × 10", val: "8.5", tone: "mint" },
];

export default function MethodologyPage() {
  return (
    <PageShell>
      <PageHeader
        section="[C] · Methodology"
        title={
          <>
            How a pool becomes a{" "}
            <span className="gradient-text-gold">score.</span>
          </>
        }
        subtitle="Everything between a raw DeFiLlama pool and the 0–100 number you see in the dashboard. Sources, the transform, the refresh cadence, and the limits we haven't solved."
      />

      <Section number="01" label="Data sources" title="Where every input comes from.">
        <div className="lg:col-span-12">
          <div className="rounded-xl border border-border-strong overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-2 border-b border-border text-[10px] font-mono uppercase tracking-widest text-muted">
              <div className="col-span-4">source</div>
              <div className="col-span-5">used for</div>
              <div className="col-span-3">refresh</div>
            </div>
            <ul className="divide-y hairline">
              {sources.map((s) => (
                <li key={s.name} className="grid md:grid-cols-12 gap-4 px-6 py-5 bg-surface">
                  <div className="md:col-span-4 font-medium">{s.name}</div>
                  <div className="md:col-span-5 text-muted-strong">{s.used}</div>
                  <div className="md:col-span-3 font-mono text-xs text-muted">{s.refresh}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section
        number="02"
        label="The transform"
        title="Five factors, one 0–100 composite."
      >
        <div className="lg:col-span-7 space-y-5 text-muted-strong leading-relaxed">
          <p>
            Each DeFiLlama pool carries raw fields — APY, TVL, a stablecoin flag,
            an IL-risk flag, and a yield prediction. ArbiFlow maps those into
            five bounded contributions and sums them:
          </p>
          <ul className="list-disc pl-5 space-y-2.5">
            <li>
              <span className="text-foreground">APY (40)</span> and{" "}
              <span className="text-foreground">TVL (20)</span> are log-scaled, so
              they reward without runaway — APY saturates near 30%, TVL near $100M.
            </li>
            <li>
              <span className="text-foreground">Trust (15)</span> is full for
              curated blue-chips, partial for honorable mentions.
            </li>
            <li>
              <span className="text-foreground">Stability (15)</span> adds for
              stablecoin pools and for no impermanent-loss exposure.
            </li>
            <li>
              <span className="text-foreground">Forecast (10)</span> scales
              DeFiLlama&apos;s Stable/Up probability.
            </li>
          </ul>
          <p className="text-sm text-muted">
            No 30-day averaging, no incentive-decay curve, no gas subtraction —
            the score is a transparent sum of these five, capped at 100.
          </p>
        </div>
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-border bg-surface-2 p-6 font-mono text-sm">
            <div className="text-[10px] uppercase tracking-widest text-muted mb-3">
              worked example · Aave v3 USDC
            </div>
            <div className="space-y-2 text-muted-strong">
              {example.map((e) => (
                <div key={e.row} className="flex justify-between gap-4">
                  <span className="text-xs leading-snug">{e.row}</span>
                  <span className="text-foreground tabular shrink-0">{e.val}</span>
                </div>
              ))}
              <div className="border-t hairline pt-2 flex justify-between">
                <span className="text-muted">composite score</span>
                <span className="gradient-text-gold font-semibold">78 / 100</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section number="03" label="Refresh & fallback" title="Live, with a safety net.">
        <div className="lg:col-span-12 grid md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
          {[
            {
              h: "5-minute cache",
              b: "The DeFiLlama yields feed is fetched and cached for 5 minutes — fresh enough to track moves, light on the upstream API.",
            },
            {
              h: "Snapshot fallback",
              b: "If the live feed is unreachable or returns nothing usable, ArbiFlow serves a bundled snapshot and labels it as such in the UI.",
            },
            {
              h: "Degenerate guard",
              b: "If every selected pool reads zero APY and zero TVL (a sign the upstream shape changed), it's treated as a failed fetch.",
            },
          ].map((c) => (
            <div key={c.h} className="bg-background p-6">
              <div className="text-base font-medium mb-2">{c.h}</div>
              <p className="text-sm text-muted leading-relaxed">{c.b}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section number="04" label="Known limits" title="What this engine cannot tell you.">
        <div className="lg:col-span-12">
          <ul className="space-y-4 text-muted-strong leading-relaxed">
            <li>
              <span className="text-foreground">It is not net of gas or IL.</span>{" "}
              The score doesn&apos;t simulate entry/exit gas or position-level
              impermanent loss — IL is a yes/no flag, nothing finer.
            </li>
            <li>
              <span className="text-foreground">It does not grade audits.</span>{" "}
              Protocol trust is curation, not a security score. A fresh exploit
              won&apos;t show up until the data does.
            </li>
            <li>
              <span className="text-foreground">It uses point-in-time data.</span>{" "}
              The latest DeFiLlama reading, not a 30-day average — spikes are
              visible, not smoothed away.
            </li>
            <li>
              <span className="text-foreground">It is Arbitrum-only.</span>{" "}
              Pools are scored on Arbitrum; Base and Optimism are read only to
              bridge idle capital in.
            </li>
          </ul>
        </div>
      </Section>
    </PageShell>
  );
}
