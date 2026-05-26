import type { Metadata } from "next";
import { Download } from "lucide-react";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Press kit — ArbiFlow",
  description:
    "Logos, brand assets, screenshots, and one-liners for journalists and partners writing about ArbiFlow.",
};

const assets = [
  { name: "Logo · light", format: "SVG · PNG" },
  { name: "Logo · dark", format: "SVG · PNG" },
  { name: "Wordmark", format: "SVG" },
  { name: "Icon · favicon", format: "PNG · ICO" },
  { name: "Dashboard screenshots", format: "PNG · WebP" },
  { name: "Brand colors", format: "JSON · CSS" },
];

export default function PressKitPage() {
  return (
    <PageShell>
      <PageHeader
        section="[L] · Press kit"
        title={
          <>
            Use the{" "}
            <span className="gradient-text-gold">assets.</span>
          </>
        }
        subtitle="Logos, screenshots, and copy you can drop straight into an article or pitch deck. No approval needed for editorial use."
      />

      <Section number="01" label="One-liners" title="If you only have one sentence.">
        <div className="lg:col-span-12 space-y-3">
          {[
            "ArbiFlow is the Arbitrum-native decision engine for idle DeFi capital — scan, score, and deploy in one signature.",
            "A non-custodial scoring layer that ranks every Arbitrum yield opportunity by risk-adjusted, gas-aware net APY.",
            "ArbiFlow turns a wallet address into an ordered list of strategies, with the math behind every score exposed and overridable.",
          ].map((line) => (
            <div
              key={line}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <p className="text-base text-foreground leading-relaxed">{line}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section number="02" label="Assets" title="Logos and screenshots.">
        <div className="lg:col-span-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {assets.map((a) => (
            <div
              key={a.name}
              className="rounded-xl border border-border bg-surface p-5 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">
                  {a.format}
                </div>
              </div>
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted border border-border rounded px-2 py-1 opacity-60 cursor-not-allowed"
                title="Hosted bundle live with Phase 2"
              >
                <Download className="w-3 h-3" />
                soon
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section number="03" label="Boilerplate" title="The about-the-company paragraph.">
        <div className="lg:col-span-12">
          <p className="text-muted-strong leading-relaxed text-base max-w-3xl">
            ArbiFlow is an Arbitrum-native capital intelligence layer founded
            in 2026. The product scans on-chain wallets, classifies idle
            capital, and ranks every Arbitrum yield opportunity by
            risk-adjusted net APY after gas. ArbiFlow is non-custodial —
            users sign every transaction and funds route directly to the
            underlying protocol.
          </p>
        </div>
      </Section>
    </PageShell>
  );
}
