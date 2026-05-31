"use client";

import { motion } from "framer-motion";
import { PROTOCOL_COUNT } from "@/lib/constants";

const groups = [
  {
    cat: "Lending",
    items: ["Aave v3", "Radiant", "Compound v3", "Silo", "Dolomite"],
  },
  {
    cat: "Liquidity",
    items: ["Uniswap v3", "Camelot v3", "Trader Joe", "Balancer", "Curve"],
  },
  {
    cat: "Perps · real yield",
    items: ["GMX v2", "Vertex", "Gains", "MUX", "Hyperliquid"],
  },
  {
    cat: "Yield · LSTs",
    items: ["Pendle", "Stargate", "Yearn", "wstETH", "rETH"],
  },
];

export function Protocols() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4">
            <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-4">
              [06] · Coverage
            </div>
            <h2 className="text-3xl lg:text-5xl tracking-[-0.03em] font-semibold leading-[1.05]">
              {PROTOCOL_COUNT} protocols.{" "}
              <span className="text-muted">One ranking.</span>
            </h2>
            <p className="mt-5 text-base text-muted-strong leading-relaxed">
              ArbiFlow indexes every major yield venue on Arbitrum and
              compares them on equal terms. No protocol pays for placement.
            </p>
            <div className="mt-7 flex items-center gap-3 text-xs font-mono">
              <span className="px-2 py-1 rounded border border-border bg-surface text-muted-strong">
                refreshed every 5 min
              </span>
              <span className="px-2 py-1 rounded border border-border bg-surface text-muted-strong">
                via DefiLlama + RPC
              </span>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-px bg-border border border-border rounded-xl overflow-hidden">
            {groups.map((g, gi) => (
              <motion.div
                key={g.cat}
                initial={{ opacity: 0, x: 8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: gi * 0.08 }}
                className="bg-surface px-6 py-5 flex items-center gap-6 flex-wrap"
              >
                <div className="w-40 flex-shrink-0">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    {g.cat}
                  </div>
                  <div className="text-sm text-muted-strong mt-1">
                    {g.items.length} venues
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 flex-1">
                  {g.items.map((p) => (
                    <span
                      key={p}
                      className="px-3 py-1.5 text-sm bg-surface-2 border border-border rounded-md hover:border-border-strong hover:text-foreground transition-colors text-muted-strong"
                    >
                      {p}
                    </span>
                  ))}
                  <span className="px-3 py-1.5 text-sm border border-dashed border-border rounded-md text-muted">
                    + more
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
