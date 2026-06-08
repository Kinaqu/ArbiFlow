import type { Metadata } from "next";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Changelog — ArbiFlow",
  description:
    "Every model recalibration, weight change, integration, and shipped feature.",
};

const entries = [
  {
    date: "2026-06-08",
    tag: "Testnet",
    body: "Keeper fails fast on a backend-signer mismatch and now surfaces the real tx-failure reason in the UI. Clearer allow-list control, trimmed copy. Buffered maxFeePerGas on user txs to survive the Arbitrum base-fee race.",
  },
  {
    date: "2026-06-07",
    tag: "Vault",
    body: "Redeployed the DelegationVault stack on Arbitrum Sepolia with a working ETH gas reserve (receive()), a per-deposit skim, a keeper-float gate, and drift hardening. The demo vault auto-rebalances live via an on-page heartbeat.",
  },
  {
    date: "2026-06-07",
    tag: "Keeper",
    body: "Users now fund the keeper float — a per-deposit skim refills it, and the standalone gas-funder is off by default.",
  },
  {
    date: "2026-06-06",
    tag: "Keeper",
    body: "Per-vault ETH gas reserve, reimbursed to the keeper on each rebalance. Sharded keeper pool for parallel submission. Demo hold / boost controls.",
  },
  {
    date: "2026-05-29",
    tag: "Engine",
    body: "Live intelligence layer: wallet scan across Arbitrum, Base & Optimism; DeFiLlama pool scoring (APY · TVL · trust · stability · forecast → 0–100); one-signature deposit via Aave, Enso and Relay.",
  },
];

export default function ChangelogPage() {
  return (
    <PageShell>
      <PageHeader
        section="[H] · Changelog"
        title={
          <>
            What changed,{" "}
            <span className="text-muted">and why it changed.</span>
          </>
        }
        subtitle="Shipped features, protocol integrations, and on-chain milestones — the real build log."
      />

      <Section number="01" label="Recent" title="Most recent first.">
        <div className="lg:col-span-12">
          <ul className="space-y-6">
            {entries.map((e) => (
              <li
                key={e.date + e.tag}
                className="grid lg:grid-cols-12 gap-4 pb-6 border-b hairline last:border-0"
              >
                <div className="lg:col-span-2">
                  <div className="font-mono tabular text-sm">{e.date}</div>
                </div>
                <div className="lg:col-span-2">
                  <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-accent border border-accent/30 rounded px-1.5 py-0.5">
                    {e.tag}
                  </span>
                </div>
                <div className="lg:col-span-8 text-muted-strong leading-relaxed">
                  {e.body}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </PageShell>
  );
}
