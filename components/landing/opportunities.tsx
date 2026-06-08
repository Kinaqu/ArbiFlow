"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ConnectButton } from "@/components/wallet/connect-button";
import { POOLS_SCORED } from "@/lib/constants";

// Illustrative sample. Breakdowns mirror lib/score.ts (APY 40 · TVL 20 · Trust
// 15 · Stability 15 · Forecast 10 → 100); each card's five contributions sum to
// the score shown. Real numbers come from a live scan.
const FACTOR_COLORS = {
  apy: "#34E0A1",
  tvl: "#2F7BFF",
  trust: "#F4B53F",
  stability: "#6FA5FF",
  forecast: "#FF8A3F",
} as const;

const FACTOR_LABELS = {
  apy: "APY",
  tvl: "TVL",
  trust: "Trust",
  stability: "Stability",
  forecast: "Forecast",
} as const;

type Factor = keyof typeof FACTOR_COLORS;

const cards = [
  {
    badge: "Best score",
    badgeTone: "gold",
    proto: "Aave v3",
    icon: "/icons/protocols/aave-v3.png",
    asset: "USDC",
    apy: "4.31",
    color: "#B6509E",
    breakdown: { apy: 19, tvl: 20, trust: 15, stability: 15, forecast: 9 },
  },
  {
    badge: "Fixed yield",
    badgeTone: "blue",
    proto: "Pendle",
    icon: "/icons/protocols/pendle.png",
    asset: "USDC PT",
    apy: "8.92",
    color: "#7E62E5",
    breakdown: { apy: 24, tvl: 14, trust: 15, stability: 12, forecast: 8 },
  },
  {
    badge: "Higher risk",
    badgeTone: "rose",
    proto: "GMX v2",
    icon: "/icons/protocols/gmx-v2-perps.png",
    asset: "GLP",
    apy: "14.22",
    color: "#03d1ce",
    breakdown: { apy: 31, tvl: 16, trust: 15, stability: 0, forecast: 6 },
  },
] satisfies ReadonlyArray<{
  badge: string;
  badgeTone: string;
  proto: string;
  icon: string;
  asset: string;
  apy: string;
  color: string;
  breakdown: Record<Factor, number>;
}>;

const FACTOR_ORDER: Factor[] = ["apy", "tvl", "trust", "stability", "forecast"];

export function Opportunities() {
  return (
    <section id="opportunities" className="relative">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-6 lg:py-8">
        <div className="max-w-2xl mb-7">
          <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-4">
            [04] · Sample output
          </div>
          <h2 className="text-3xl lg:text-5xl tracking-[-0.03em] font-semibold leading-[1.05]">
            What a scan returns.
          </h2>
          <p className="mt-5 text-lg text-muted-strong leading-relaxed">
            Each pool scored 0–100, with every factor&apos;s contribution shown.
            Illustrative picks below — a live scan ranks your idle capital.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {cards.map((c, i) => {
            const score = FACTOR_ORDER.reduce((s, k) => s + c.breakdown[k], 0);
            return (
              <motion.div
                key={c.proto}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-surface border border-border rounded-xl overflow-hidden hover:border-border-strong transition-all"
                style={
                  i === 0
                    ? {
                        boxShadow:
                          "inset 0 0 0 1px rgba(244, 181, 63, 0.18), 0 30px 60px -30px rgba(244, 181, 63, 0.18)",
                      }
                    : undefined
                }
              >
                {/* Badge + rank */}
                <div className="px-5 pt-5 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${
                      c.badgeTone === "gold"
                        ? "text-gold border-gold/30 bg-gold/5"
                        : c.badgeTone === "rose"
                          ? "text-rose border-rose/30 bg-rose/5"
                          : "text-accent border-accent/30 bg-accent/5"
                    }`}
                  >
                    {c.badge}
                  </span>
                  <span className="font-mono tabular text-[10px] uppercase tracking-widest text-muted">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Header: protocol + score */}
                <div className="px-5 pt-4 pb-5 border-b hairline">
                  <div className="flex items-center gap-3.5">
                    <span
                      className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-surface-2 overflow-hidden shrink-0"
                      style={{ boxShadow: `inset 0 0 0 1px ${c.color}40` }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.icon}
                        alt={c.proto}
                        width={30}
                        height={30}
                        className="w-[30px] h-[30px] object-contain rounded-[22%]"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-lg font-medium leading-tight truncate">
                        {c.proto}
                      </div>
                      <div className="font-mono text-sm text-muted mt-0.5">
                        Asset · {c.asset}
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span
                        className={`font-mono tabular text-xl font-semibold leading-none ${
                          i === 0 ? "gradient-text-gold" : "text-foreground"
                        }`}
                      >
                        {score}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-muted mt-1">
                        score / 100
                      </span>
                    </div>
                  </div>
                </div>

                {/* APY */}
                <div className="px-5 py-4 border-b hairline flex items-baseline justify-between">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    APY
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-mono tabular font-semibold ${
                        i === 0 ? "gradient-text-gold" : "text-foreground"
                      }`}
                    >
                      {c.apy}
                    </span>
                    <span className="text-lg font-mono text-muted-strong">%</span>
                  </div>
                </div>

                {/* Composite breakdown */}
                <div className="px-5 pt-4 pb-5">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">
                    composite score
                  </div>
                  <div className="flex h-1.5 rounded-full overflow-hidden bg-border">
                    {FACTOR_ORDER.map((k) => (
                      <span
                        key={k}
                        style={{
                          width: `${c.breakdown[k]}%`,
                          background: FACTOR_COLORS[k],
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
                    {FACTOR_ORDER.map((k) => (
                      <span
                        key={k}
                        className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-muted"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: FACTOR_COLORS[k] }}
                        />
                        {FACTOR_LABELS[k]} {c.breakdown[k]}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <ConnectButton size="lg" className="font-semibold">
            Scan your wallet · full ranked list
            <ArrowRight className="w-4 h-4" />
          </ConnectButton>
          <p className="text-[11px] font-mono text-muted">
            connect to score {POOLS_SCORED}+ live Arbitrum pools
          </p>
        </div>
      </div>
    </section>
  );
}
