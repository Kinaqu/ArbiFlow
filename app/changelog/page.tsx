import type { Metadata } from "next";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Changelog — ArbiFlow",
  description:
    "Every model recalibration, weight change, integration, and shipped feature.",
};

const entries = [
  {
    date: "2026-05-26",
    tag: "Engine",
    body: "Pivoted positioning from read-only scanner to scan → deploy. Landing rebuilt around the decision engine.",
  },
  {
    date: "2026-05-25",
    tag: "Wallet",
    body: "Reown AppKit connect modal wired across Hero, Nav, and CTA. /app dashboard now reads live Top-20 Arbitrum balances.",
  },
  {
    date: "2026-05-24",
    tag: "Scoring",
    body: "Added decay-adjusted incentive token term to the formula. Recalibrated default risk weights against Q1 2026 realized PnL.",
  },
  {
    date: "2026-05-20",
    tag: "Data",
    body: "Replaced spot APY pull with 30-day TWAP. Cut spike noise on Radiant and Camelot rankings by ~40%.",
  },
  {
    date: "2026-05-15",
    tag: "Coverage",
    body: "Added Pendle PT and Silo isolated lending markets to the universe. Total tracked venues: 42.",
  },
  {
    date: "2026-05-10",
    tag: "Engine",
    body: "Gas-curve simulation introduced. Top-of-book now varies by wallet size — same protocols, different rankings.",
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
        subtitle="Engine recalibrations, weight tweaks, integrations, and shipped features. Every change to the model that could move a ranking is documented here."
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
