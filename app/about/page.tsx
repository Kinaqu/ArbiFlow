import type { Metadata } from "next";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "About — ArbiFlow",
  description:
    "Why ArbiFlow exists, what we are building, and where we are headed.",
};

export default function AboutPage() {
  return (
    <PageShell>
      <PageHeader
        section="[J] · About"
        title={
          <>
            Built for users with{" "}
            <span className="gradient-text-gold">idle capital and zero time.</span>
          </>
        }
        subtitle="ArbiFlow is an Arbitrum-native decision engine for retail and prosumer DeFi users. We do one thing — score every yield opportunity by net APY after risk and gas — and we publish the math."
      />

      <Section number="01" label="Why" title="Why this exists.">
        <div className="lg:col-span-7 space-y-5 text-muted-strong leading-relaxed">
          <p>
            Over 60% of the average Arbitrum wallet sits in tokens earning
            nothing. Not because users are lazy — because comparing protocols
            is a full-time job. APYs lie. Gas eats returns. Risk is impossible
            to price without a model.
          </p>
          <p>
            Every existing tool is either an aggregator (lists yields but does
            not score them) or a manager (custodial, off-chain, opaque).
            Neither is the right shape for someone who wants to keep custody
            but stop ignoring their stables.
          </p>
          <p>
            We are building the missing layer: a transparent score, exposed
            inputs, and a one-click deploy that never holds your funds.
          </p>
        </div>
        <div className="lg:col-span-5 space-y-3">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
              focus
            </div>
            <div className="font-medium">Arbitrum One</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
              custody
            </div>
            <div className="font-medium">Non-custodial. Ever.</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
              business model
            </div>
            <div className="font-medium">
              Performance fee on incremental yield (not principal)
            </div>
          </div>
        </div>
      </Section>

      <Section number="02" label="Stance" title="What we will not do.">
        <div className="lg:col-span-12">
          <ul className="grid sm:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden">
            {[
              ["Custody your funds", "You sign every action. We have no admin keys."],
              ["Hidden partner ordering", "If a worse protocol pays us more, the better one still ranks first."],
              ["Launch a token", "No airdrop. No staking gimmick. The product is the product."],
              ["Hand-tune per protocol", "One formula. One weight set. Adjust them yourself or do not use us."],
            ].map(([k, v]) => (
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
