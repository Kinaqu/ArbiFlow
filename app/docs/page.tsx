import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Cpu, Gauge, ShieldAlert, Code2, Layers } from "lucide-react";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Docs — ArbiFlow",
  description:
    "Quickstart, concepts, and reference for ArbiFlow — the Arbitrum-native decision engine for idle DeFi capital.",
};

const concepts = [
  {
    icon: Cpu,
    title: "Engine pipeline",
    href: "/engine",
    body: "How a wallet address turns into a ranked deploy list.",
  },
  {
    icon: ShieldAlert,
    title: "Risk model",
    href: "/risk-model",
    body: "How trust, stability and forecast price resilience into the score.",
  },
  {
    icon: Gauge,
    title: "Methodology",
    href: "/methodology",
    body: "Data sources, the pool-to-score transform, refresh cadence, known limits.",
  },
  {
    icon: Code2,
    title: "API reference",
    href: "/api-docs",
    body: "Read-only HTTP endpoints for wallet scans and ranked pools.",
  },
  {
    icon: Layers,
    title: "Architecture",
    href: "/architecture",
    body: "Live mainnet intelligence plus the testnet delegation vault.",
  },
  {
    icon: BookOpen,
    title: "Changelog",
    href: "/changelog",
    body: "Shipped features, integrations, and on-chain milestones.",
  },
];

export default function DocsPage() {
  return (
    <PageShell>
      <PageHeader
        section="[D] · Docs"
        title={
          <>
            Read what the engine is{" "}
            <span className="gradient-text-gold">actually doing.</span>
          </>
        }
        subtitle="Five minutes to understand the scoring loop end-to-end. No marketing copy — just the inputs, the math, and the trade-offs you should know about before deploying."
      />

      <Section number="01" label="Quickstart" title="Get a wallet scored in under a minute.">
        <div className="lg:col-span-7 space-y-5 text-muted-strong leading-relaxed">
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              Open <span className="text-foreground">arbiflow.xyz</span> and
              click <span className="text-foreground">Connect wallet</span> —
              MetaMask, WalletConnect, or any injected provider works.
            </li>
            <li>
              Confirm the connection. No signature required for scanning.
            </li>
            <li>
              The dashboard at <span className="font-mono">/app</span> reads
              your balances across Arbitrum, Base and Optimism, totals your idle
              capital, and surfaces ranked strategies.
            </li>
            <li>
              When you find a strategy worth running, hit{" "}
              <span className="text-foreground">Deploy</span>. ArbiFlow builds
              the tx in-browser; you sign with your wallet.
            </li>
          </ol>
          <p className="text-sm text-muted">
            Prefer no-connect demo? Append{" "}
            <span className="font-mono">?address=0x…</span> to{" "}
            <span className="font-mono">/app</span> for a read-only view of
            any wallet.
          </p>
        </div>
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-border bg-surface p-6 font-mono text-sm">
            <div className="text-[10px] uppercase tracking-widest text-muted mb-3">
              terminal
            </div>
            <div className="space-y-1.5">
              <div className="text-muted">
                <span className="text-accent">$</span> arbiflow scan
              </div>
              <div className="text-muted-strong">
                → connect wallet <span className="text-mint">✓</span>
              </div>
              <div className="text-muted-strong">
                → fetch balances <span className="text-mint">✓</span>
              </div>
              <div className="text-muted-strong">
                → detect idle <span className="text-mint">✓</span>
              </div>
              <div className="text-muted-strong">
                → rank strategies <span className="text-mint">✓</span>
              </div>
              <div className="border-t hairline mt-3 pt-2 text-foreground">
                ready · <span className="gradient-text-gold">$2,340 idle</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section number="02" label="Concepts" title="Read these before you deploy anything.">
        <div className="lg:col-span-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {concepts.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.title}
                href={c.href}
                className="rounded-xl border border-border bg-surface p-6 hover:border-border-strong transition-colors flex flex-col group"
              >
                <Icon className="w-5 h-5 text-accent mb-4" />
                <div className="text-base font-medium mb-2">{c.title}</div>
                <p className="text-sm text-muted leading-relaxed flex-1">{c.body}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted group-hover:text-foreground transition-colors">
                  Read
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section number="03" label="Glossary" title="Terms that show up in scores.">
        <div className="lg:col-span-12">
          <dl className="divide-y hairline border-y hairline">
            {[
              [
                "Idle capital",
                "Any stable asset (USDC, USDT, DAI…) sitting in an EOA above $5. Volatile assets are tracked but never flagged idle.",
              ],
              [
                "Composite score",
                "A 0–100 sum of five factors — APY, TVL, trust, stability, forecast. Higher is better; comparable across every pool. The number the engine ranks on.",
              ],
              [
                "Tier",
                "core (curated blue-chip) or honorable (passed the TVL / APY / no-IL filter from the wider universe). Sets the trust contribution.",
              ],
              [
                "Stability",
                "Score bonus for stablecoin pools and for pools with no impermanent-loss risk.",
              ],
              [
                "Forecast",
                "DeFiLlama's Stable/Up probability that the yield holds, scaled into the score.",
              ],
              [
                "Idle threshold",
                "$5 — stablecoin balances below it aren't flagged as idle capital.",
              ],
            ].map(([term, defn]) => (
              <div key={term} className="grid lg:grid-cols-12 gap-3 py-5">
                <dt className="lg:col-span-3 text-sm font-medium font-mono">{term}</dt>
                <dd className="lg:col-span-9 text-muted-strong leading-relaxed">{defn}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>
    </PageShell>
  );
}
