"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Droplets,
  Building2,
  ShieldCheck,
  Activity,
} from "lucide-react";

// Mirrors lib/score.ts: a single 0–100 composite, all additive.
const terms = [
  {
    sign: "+",
    label: "APY",
    desc: "Live pool yield from DeFiLlama (base + rewards), on a log curve that saturates near 30%.",
    icon: TrendingUp,
    color: "#34E0A1",
    weight: "40",
  },
  {
    sign: "+",
    label: "TVL",
    desc: "Pool depth, log-scaled to $100M. Deeper, harder-to-move liquidity scores higher.",
    icon: Droplets,
    color: "#2F7BFF",
    weight: "20",
  },
  {
    sign: "+",
    label: "Trust",
    desc: "Full marks for curated blue-chip protocols; partial credit for honorable mentions.",
    icon: Building2,
    color: "#F4B53F",
    weight: "15",
  },
  {
    sign: "+",
    label: "Stability",
    desc: "Stablecoin pools with no impermanent-loss risk score highest.",
    icon: ShieldCheck,
    color: "#6FA5FF",
    weight: "15",
  },
  {
    sign: "+",
    label: "Forecast",
    desc: "DeFiLlama's Stable/Up probability that the yield holds.",
    icon: Activity,
    color: "#FF8A3F",
    weight: "10",
  },
];

export function Formula() {
  return (
    <section id="engine" className="relative">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-10 lg:py-12">
        <div className="max-w-3xl">
          <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-4">
            [02] · The engine
          </div>
          <h2 className="text-3xl lg:text-5xl tracking-[-0.03em] font-semibold leading-[1.05]">
            We don&apos;t hide{" "}
            <span className="gradient-text-blue">the math.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-strong leading-relaxed">
            Every pool gets a single 0–100 score. The same five factors apply
            across lending, LPs, perps, and fixed yield — you see exactly what
            each one contributes.
          </p>
        </div>

        {/* The formula */}
        <div className="mt-8 lg:mt-10">
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

        {/* Variable details */}
        <div className="mt-8 lg:mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden">
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
                    {t.weight} pts
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
