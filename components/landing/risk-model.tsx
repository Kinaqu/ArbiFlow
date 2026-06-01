"use client";

import { motion } from "framer-motion";

const lanes = [
  {
    weight: 30,
    label: "Protocol risk",
    sub: "Audit depth · TVL · age · history",
    detail:
      "We blend signals from DefiSafety, OpenZeppelin, and on-chain exploit data. Brand new contracts start at zero credit.",
    color: "#2F7BFF",
  },
  {
    weight: 25,
    label: "Market volatility",
    sub: "Asset σ · yield variance",
    detail:
      "30-day realized volatility, weighted by the share of your position in volatile assets. Stablecoins barely move the needle.",
    color: "#F4B53F",
  },
  {
    weight: 25,
    label: "Liquidity",
    sub: "Pool depth · exit cost",
    detail:
      "Slippage on a hypothetical 100% exit. Thin pools that look great on paper get marked down hard.",
    color: "#34E0A1",
  },
  {
    weight: 20,
    label: "Execution cost",
    sub: "Gas · MEV · rebalancing",
    detail:
      "Simulated entry, weekly rebalance, and exit at current Arbitrum gas. Net APY is APY minus this.",
    color: "#FF5A6B",
  },
];

export function RiskModel() {
  return (
    <section id="risk" className="relative">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5">
            <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-4">
              [05] · The risk model
            </div>
            <h2 className="text-3xl lg:text-5xl tracking-[-0.03em] font-semibold leading-[1.05]">
              Four lanes. <span className="text-muted">Fixed weights.</span>
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pl-12 lg:border-l hairline">
            <p className="text-lg text-muted-strong leading-relaxed">
              Every score subtracts a weighted blend of four risk dimensions
              from raw return — the same formula across every protocol.
              Disagree with a weight? The breakdown is right there to argue
              against.
            </p>
          </div>
        </div>

        {/* Weighted lanes - horizontal stacked */}
        <div className="space-y-3">
          {/* Weight bar */}
          <div className="flex h-2 rounded-full overflow-hidden border border-border">
            {lanes.map((l, i) => (
              <motion.div
                key={l.label}
                initial={{ width: 0 }}
                whileInView={{ width: `${l.weight}%` }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                style={{ background: l.color }}
              />
            ))}
          </div>

          {/* Lane labels above bars in grid */}
          <div className="grid grid-cols-12 gap-px mt-6">
            {lanes.map((l, i) => (
              <motion.div
                key={l.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08 }}
                className={`bg-surface border border-border p-5 ${
                  i === 0
                    ? "col-span-12 lg:col-span-4 rounded-l-xl"
                    : i === lanes.length - 1
                      ? "col-span-12 lg:col-span-2 rounded-r-xl"
                      : "col-span-12 lg:col-span-3"
                }`}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <div
                    className="text-[10px] font-mono uppercase tracking-widest"
                    style={{ color: l.color }}
                  >
                    {l.label}
                  </div>
                  <div className="text-2xl font-mono tabular font-semibold">
                    {l.weight}
                    <span className="text-xs text-muted">%</span>
                  </div>
                </div>
                <div className="text-xs font-mono text-muted-strong mb-3">
                  {l.sub}
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  {l.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
