"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Gift,
  Building2,
  Activity,
  Droplets,
  Fuel,
} from "lucide-react";

const terms = [
  {
    sign: "+",
    label: "APY",
    desc: "Base lending or LP yield, normalized over 30-day rolling window. No vanity numbers.",
    icon: TrendingUp,
    color: "#34E0A1",
    weight: "0.35",
  },
  {
    sign: "+",
    label: "Incentives",
    desc: "Token emissions decay-adjusted. We discount unsustainable rewards toward zero.",
    icon: Gift,
    color: "#F4B53F",
    weight: "0.15",
  },
  {
    sign: "−",
    label: "Protocol risk",
    desc: "Audit count, age, TVL, exploit history. Weighted from third-party security signals.",
    icon: Building2,
    color: "#FF5A6B",
    weight: "0.20",
  },
  {
    sign: "−",
    label: "Volatility",
    desc: "Asset volatility and yield variance. Stable strategies score higher per unit of return.",
    icon: Activity,
    color: "#FF5A6B",
    weight: "0.10",
  },
  {
    sign: "−",
    label: "IL exposure",
    desc: "Impermanent loss for LP positions, simulated against current price ranges.",
    icon: Droplets,
    color: "#FF5A6B",
    weight: "0.10",
  },
  {
    sign: "−",
    label: "Gas impact",
    desc: "Real entry, rebalancing, and exit costs at your size. Small bags get honest math.",
    icon: Fuel,
    color: "#FF5A6B",
    weight: "0.10",
  },
];

export function Formula() {
  return (
    <section id="engine" className="relative">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-24 lg:py-36">
        <div className="max-w-3xl">
          <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-4">
            [02] · The engine
          </div>
          <h2 className="text-3xl lg:text-5xl tracking-[-0.03em] font-semibold leading-[1.05]">
            We don&apos;t hide{" "}
            <span className="gradient-text-blue">the math.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-strong leading-relaxed">
            Every strategy gets a single transparent score. Same formula for
            stablecoins, LPs, perps, and incentive farms. You see the inputs.
            You can argue with them.
          </p>
        </div>

        {/* The formula */}
        <div className="mt-14 lg:mt-20 relative">
          <div className="absolute -inset-x-8 -inset-y-12 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.04] via-transparent to-transparent rounded-3xl" />
          </div>
          <div className="relative">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 lg:gap-x-4 text-2xl sm:text-3xl lg:text-[40px] tracking-tight font-mono font-light leading-[1.2]">
              <span className="text-muted">Score</span>
              <span className="text-border-strong">=</span>
              {terms.map((t, i) => (
                <div
                  key={t.label}
                  className="flex items-baseline gap-3 lg:gap-4"
                >
                  {i > 0 && (
                    <span
                      className={
                        t.sign === "+" ? "text-mint" : "text-rose"
                      }
                    >
                      {t.sign}
                    </span>
                  )}
                  <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: i * 0.06 }}
                    className="text-foreground whitespace-nowrap"
                  >
                    {t.label}
                  </motion.span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Variable details */}
        <div className="mt-16 lg:mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden">
          {terms.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface p-6 group hover:bg-surface-2 transition-colors relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center border"
                    style={{
                      background: `${t.color}10`,
                      borderColor: `${t.color}30`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: t.color }} />
                  </div>
                  <span
                    className={`text-2xl font-mono font-light ${
                      t.sign === "+" ? "text-mint" : "text-rose"
                    }`}
                  >
                    {t.sign}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-base font-medium text-foreground">
                    {t.label}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    w {t.weight}
                  </div>
                </div>
                <p className="text-sm text-muted leading-relaxed">{t.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
