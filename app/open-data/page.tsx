import type { Metadata } from "next";
import { Download } from "lucide-react";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Open data — ArbiFlow",
  description:
    "Daily snapshots of the ranked Arbitrum strategy universe, the risk model inputs, and historical score series.",
};

const datasets = [
  {
    name: "strategies-daily",
    size: "~120 KB",
    format: "CSV · JSON",
    desc: "Daily flat ranking: protocol, token, raw APY, net APY, risk, gas, score.",
  },
  {
    name: "risk-inputs-daily",
    size: "~80 KB",
    format: "JSON",
    desc: "Per-protocol risk dimension inputs: audits, TVL stability, depeg flags, withdrawal latency.",
  },
  {
    name: "score-history",
    size: "~5 MB / month",
    format: "Parquet · CSV",
    desc: "Time-series of every score in the universe. One row per (protocol, token, day).",
  },
  {
    name: "gas-curves",
    size: "~40 KB",
    format: "JSON",
    desc: "Simulated entry/exit gas for each strategy at $100 / $1k / $10k / $100k wallet sizes.",
  },
];

export default function OpenDataPage() {
  return (
    <PageShell>
      <PageHeader
        section="[G] · Open data"
        title={
          <>
            The whole dataset.{" "}
            <span className="gradient-text-gold">No login.</span>
          </>
        }
        subtitle="If you do not trust our ranking, build your own from the same numbers. The four files below cover the entire inference path."
      />

      <Section number="01" label="Datasets" title="Four files, refreshed daily.">
        <div className="lg:col-span-12 grid sm:grid-cols-2 gap-3">
          {datasets.map((d) => (
            <div
              key={d.name}
              className="rounded-xl border border-border bg-surface p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-sm">{d.name}</div>
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted border border-border rounded px-2 py-1 opacity-60 cursor-not-allowed"
                  title="Public feed live with Phase 2"
                >
                  <Download className="w-3 h-3" />
                  soon
                </button>
              </div>
              <p className="text-sm text-muted-strong leading-relaxed flex-1">
                {d.desc}
              </p>
              <div className="mt-5 pt-4 border-t hairline flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted">
                <span>{d.format}</span>
                <span>{d.size}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section number="02" label="License" title="Use it however you want.">
        <div className="lg:col-span-7 text-muted-strong leading-relaxed space-y-4">
          <p>
            Datasets are published under{" "}
            <span className="text-foreground">CC BY 4.0</span>. Attribution
            appreciated; redistribution allowed. No warranty.
          </p>
          <p>
            We pin the snapshot URL each day so historical reproducibility is
            cheap. If you build research on top of ArbiFlow data, drop us a
            link — we list community projects on the docs index.
          </p>
        </div>
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-border bg-surface-2 p-6 font-mono text-xs leading-relaxed">
            <div className="text-[10px] uppercase tracking-widest text-muted mb-3">
              snapshot URL pattern
            </div>
            <div className="text-muted-strong">
              https://data.arbiflow.xyz/<br />
              <span className="text-foreground">{"{dataset}/{YYYY-MM-DD}.csv"}</span>
            </div>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
