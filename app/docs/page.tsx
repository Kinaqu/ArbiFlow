import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Cpu,
  Gauge,
  ShieldAlert,
  ShieldCheck,
  Layers,
  Code2,
} from "lucide-react";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "User docs — ArbiFlow",
  description:
    "How to use ArbiFlow: connect a wallet, scan idle capital, deploy into ranked strategies, and how the non-custodial vault keeps your funds yours.",
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
        section="[D] · User docs"
        title={
          <>
            Put your idle capital{" "}
            <span className="gradient-text-gold">to work.</span>
          </>
        }
        subtitle="Everything you need to use ArbiFlow end to end — connect, scan, deploy, and withdraw — plus exactly why your funds stay yours the whole time. Building on the data instead? See the developer API."
      />

      <Section number="01" label="Quickstart" title="Get a wallet scored in under a minute.">
        <div className="lg:col-span-7 space-y-5 text-muted-strong leading-relaxed">
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              Open the app and click{" "}
              <span className="text-foreground">Connect wallet</span> — MetaMask,
              WalletConnect, or any injected provider works.
            </li>
            <li>Confirm the connection. No signature required just to look around.</li>
            <li>
              The dashboard at <span className="font-mono">/app</span> reads your
              balances across Arbitrum, Base and Optimism, totals your idle
              capital, and surfaces ranked strategies.
            </li>
            <li>
              When you find a strategy worth running, hit{" "}
              <span className="text-foreground">Deploy</span>. ArbiFlow builds the
              transaction in-browser; you sign it with your wallet.
            </li>
          </ol>
          <p className="text-sm text-muted">
            Prefer a no-connect demo? Append{" "}
            <span className="font-mono">?address=0x…</span> to{" "}
            <span className="font-mono">/app</span> for a read-only view of any
            wallet.
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

      <Section number="02" label="The vault" title="Auto-rebalancing, on testnet.">
        <div className="lg:col-span-7 space-y-5 text-muted-strong leading-relaxed">
          <p>
            On Arbitrum Sepolia you can open a personal{" "}
            <span className="text-foreground">delegation vault</span> that
            auto-rebalances into the top-scoring pool for you:
          </p>
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <span className="text-foreground">Create your vault</span> and verify
              wallet ownership with a one-time signature.
            </li>
            <li>
              <span className="text-foreground">Approve</span> which protocols
              ArbiFlow may route into — it can never touch any you haven&apos;t
              allowed.
            </li>
            <li>
              <span className="text-foreground">Deposit</span> test USDC and top up
              a small ETH gas reserve (it pays for your rebalances; reclaim it any
              time).
            </li>
            <li>
              ArbiFlow&apos;s keeper then moves your funds to the leading approved
              pool as scores change. Hit{" "}
              <span className="text-foreground">Withdraw</span> to pull everything
              back to your wallet whenever you like.
            </li>
          </ol>
        </div>
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-border bg-surface p-6">
            <ShieldCheck className="w-5 h-5 text-mint mb-3" />
            <div className="text-base font-medium mb-2">Force exit, always</div>
            <p className="text-sm text-muted-strong leading-relaxed">
              An <span className="font-mono">emergencyWithdraw</span> sweeps every
              token straight back to you on-chain — even if ArbiFlow&apos;s keeper
              is offline. You are never locked in.
            </p>
          </div>
        </div>
      </Section>

      <Section number="03" label="Safety" title="Your funds stay yours.">
        <div className="lg:col-span-12 grid sm:grid-cols-2 gap-3">
          {[
            [
              "Non-custodial by design",
              "Funds live in a vault that only you own. Withdraw is owner-only — ArbiFlow's keeper, and anyone else, is technically unable to move funds out to any address but yours.",
            ],
            [
              "You sign everything that matters",
              "Connecting is free; deposits, withdrawals and approvals are signed by your wallet. A one-time Sign-In With Ethereum proves ownership before the vault will auto-rebalance.",
            ],
            [
              "Rebalances can't lose value",
              "The keeper may only move funds between protocols you approved, and the contract rejects any rebalance that would drop your portfolio's value beyond a small slippage bound.",
            ],
            [
              "No one can move your money",
              "Every fund-moving request is checked against your vault's on-chain owner. A stranger cannot rebalance, redeem, or drain your vault — the request is simply refused.",
            ],
          ].map(([title, body]) => (
            <div key={title} className="rounded-xl border border-border bg-surface p-6">
              <div className="text-base font-medium mb-2">{title}</div>
              <p className="text-sm text-muted-strong leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section number="04" label="Concepts" title="Read these before you deploy anything.">
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

      <Section number="05" label="Glossary" title="Terms that show up in scores.">
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

      <Section>
        <div className="lg:col-span-12">
          <Link
            href="/api-docs"
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-6 hover:border-border-strong transition-colors group"
          >
            <div className="flex items-start gap-4 min-w-0">
              <Code2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-base font-medium">Building on ArbiFlow?</div>
                <p className="text-sm text-muted leading-relaxed">
                  The open developer API — wallet scans, scored pools and APY/TVL
                  history, with keys, rate limits and CORS.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted group-hover:text-foreground transition-colors flex-shrink-0" />
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
