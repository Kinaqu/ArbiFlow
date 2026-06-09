"use client";

import { motion } from "framer-motion";

// The score's resilience factors (lib/score.ts). ArbiFlow doesn't bolt on a
// separate risk grade — safety is baked into the 100-point composite: 60 of the
// points reward depth, trust, stable assets and a holding forecast; the other
// 40 reward raw APY.
const factors = [
  {
    pts: 20,
    label: "TVL",
    sub: "Pool depth",
    detail:
      "Total value locked, log-scaled to $100M. Deeper, harder-to-move liquidity means lower exit risk and scores higher.",
    color: "#2F7BFF",
  },
  {
    pts: 15,
    label: "Trust",
    sub: "Protocol tier",
    detail:
      "Curated blue-chip protocols (Aave, Uniswap, GMX, Pendle…) get full marks; honorable-mention pools earn partial credit.",
    color: "#F4B53F",
  },
  {
    pts: 15,
    label: "Stability",
    sub: "Asset + IL",
    detail:
      "Stablecoin pools with no impermanent-loss exposure score highest — no price risk, no LP divergence.",
    color: "#6FA5FF",
  },
  {
    pts: 10,
    label: "Forecast",
    sub: "Yield outlook",
    detail:
      "DeFiLlama's Stable/Up probability that the pool's yield holds rather than decaying.",
    color: "#FF8A3F",
  },
];

const notModeled = [
  "Audit scoring — we curate by protocol, we don't grade audits",
  "Per-asset volatility (σ) and price prediction",
  "Gas or impermanent-loss simulation per position",
  "Withdrawal queues / cooldown latency",
];

export function RiskModel() {
  return (
    <section id="risk" className="relative">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-12 mb-12">
          <div className="lg:col-span-5">
            <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-4">
              [05] · The risk model
            </div>
            <h2 className="text-3xl lg:text-5xl tracking-[-0.03em] font-semibold leading-[1.05]">
              Risk is <span className="text-muted">in the score.</span>
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pl-12 lg:border-l hairline">
            <p className="text-lg text-muted-strong leading-relaxed">
              No separate risk grade bolted on after the fact. Resilience is
              built into the 100-point score: <span className="text-foreground">60
              points</span> reward depth, blue-chip trust, stable assets and a
              holding forecast — the other 40 reward raw yield.
            </p>
          </div>
        </div>

        {/* Resilience factors */}
        <div className="grid grid-cols-12 gap-px bg-border border border-border rounded-xl overflow-hidden">
          {factors.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08 }}
              className="bg-surface p-5 lg:p-6 col-span-12 sm:col-span-6 lg:col-span-3"
            >
              <div className="flex items-baseline justify-between mb-3">
                <div
                  className="text-[10px] font-mono uppercase tracking-widest"
                  style={{ color: f.color }}
                >
                  {f.label}
                </div>
                <div className="font-mono tabular text-2xl font-semibold">
                  {f.pts}
                  <span className="text-xs text-muted"> pts</span>
                </div>
              </div>
              <div className="text-xs font-mono text-muted-strong mb-3">
                {f.sub}
              </div>
              <p className="text-sm text-muted leading-relaxed">{f.detail}</p>
            </motion.div>
          ))}
        </div>

        {/* Honest limits */}
        <div className="mt-6 rounded-xl border border-border bg-surface/40 p-6">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-4">
            what the score does not model
          </div>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
            {notModeled.map((x) => (
              <li
                key={x}
                className="flex items-start gap-2.5 text-sm text-muted-strong leading-relaxed"
              >
                <span className="mt-2 w-1 h-1 rounded-full bg-border-strong flex-shrink-0" />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
