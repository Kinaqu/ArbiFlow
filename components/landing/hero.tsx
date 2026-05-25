"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { EngineVisual } from "./engine-visual";

export function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-16 lg:pt-24 pb-20 lg:pb-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: editorial */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-2.5 py-1 border border-border rounded-full bg-surface/60 mb-7"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted-strong">
                Capital intelligence · Arbitrum One
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-[44px] sm:text-[56px] lg:text-[72px] leading-[1.02] tracking-[-0.04em] font-semibold"
            >
              Turn idle crypto into{" "}
              <span className="gradient-text-gold">optimized yield.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-7 text-base sm:text-lg text-muted-strong max-w-xl leading-relaxed"
            >
              ArbiFlow scans your Arbitrum wallet, ranks every DeFi
              opportunity by{" "}
              <span className="text-foreground">risk‑adjusted, gas‑aware net APY</span>
              , and tells you what your capital is actually missing.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <a
                href="#cta"
                className="btn-primary inline-flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium text-white"
              >
                Connect wallet · scan free
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#engine"
                className="btn-ghost inline-flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium text-foreground"
              >
                See the engine
              </a>
              <div className="flex items-center gap-1.5 text-xs text-muted ml-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Read‑only. No signatures required.
              </div>
            </motion.div>

            {/* Stat strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-14 grid grid-cols-3 gap-6 max-w-lg"
            >
              {[
                { v: "42", l: "protocols indexed" },
                { v: "1.8s", l: "wallet scan time" },
                { v: "$0", l: "to use · no token" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-mono tabular font-semibold text-foreground">
                    {s.v}
                  </div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-muted mt-1">
                    {s.l}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: engine */}
          <div className="lg:col-span-5">
            <EngineVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
