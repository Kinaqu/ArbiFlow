"use client";

import { motion } from "framer-motion";
import { Wallet, ArrowUpRight } from "lucide-react";
import { POOLS_SCORED } from "@/lib/constants";

const tokens = [
  { sym: "USDC", bal: "1,840.22", idle: true, logo: "/icons/tokens/usdc.svg" },
  { sym: "ETH", bal: "0.412", idle: false, logo: "/icons/tokens/eth.svg" },
  { sym: "ARB", bal: "682.50", idle: true, logo: "/icons/infra/arbitrum.svg" },
];

const opps = [
  { name: "Aave v3", asset: "USDC", apy: "4.31", score: 78, color: "#B6509E", icon: "/icons/protocols/aave-v3.png" },
  { name: "Radiant", asset: "USDC", apy: "6.84", score: 71, color: "#7E62E5", icon: "/icons/protocols/radiant-v2.png" },
  { name: "GMX v2", asset: "GLP", apy: "14.22", score: 64, color: "#03d1ce", icon: "/icons/protocols/gmx-v2-perps.png" },
];

// Scoring factors + weights mirror lib/score.ts (APY 40 · TVL 20 · Trust 15 ·
// Stability 15 · Prediction 10 → 100). Contributions below are a plausible
// static breakdown for the top-ranked pool; they sum to the score shown.
const scoreFactors = [
  { k: "APY", v: 19, c: "#34E0A1" },
  { k: "TVL", v: 20, c: "#2F7BFF" },
  { k: "Trust", v: 15, c: "#F4B53F" },
  { k: "Stability", v: 15, c: "#6FA5FF" },
  { k: "Forecast", v: 9, c: "#FF8A3F" },
];

export function EngineVisual() {
  return (
    <div className="relative w-full max-w-[520px] mx-auto">
      {/* Corner crosshairs (terminal feel) */}
      <div className="absolute -inset-4 pointer-events-none">
        {[
          "top-0 left-0",
          "top-0 right-0 rotate-90",
          "bottom-0 left-0 -rotate-90",
          "bottom-0 right-0 rotate-180",
        ].map((pos) => (
          <svg
            key={pos}
            className={`absolute ${pos} w-4 h-4 text-border-strong`}
            viewBox="0 0 16 16"
            fill="none"
          >
            <path d="M0 0H6M0 0V6" stroke="currentColor" strokeWidth="1" />
          </svg>
        ))}
      </div>

      {/* Wallet block */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-surface border border-border rounded-lg p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5 text-muted" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
              wallet · 0x4a2…f8c1
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/infra/arbitrum.svg"
              alt=""
              width={11}
              height={11}
              className="w-[11px] h-[11px]"
            />
            Arbitrum
          </span>
        </div>
        <div className="space-y-1.5">
          {tokens.map((t) => (
            <div
              key={t.sym}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.logo}
                  alt={t.sym}
                  width={18}
                  height={18}
                  className="w-[18px] h-[18px] rounded-full object-contain"
                />
                <span className="font-mono text-foreground">{t.sym}</span>
                {t.idle && (
                  <span className="text-[9px] font-mono uppercase tracking-wider text-gold/90 border border-gold/30 rounded px-1 py-px">
                    idle
                  </span>
                )}
              </div>
              <span className="font-mono tabular text-muted-strong">
                {t.bal}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t hairline flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
            idle capital detected
          </span>
          <span className="font-mono tabular text-sm gradient-text-gold font-semibold">
            $2,340.18
          </span>
        </div>
      </motion.div>

      {/* Single flow connector: wallet -> ranked results */}
      <svg
        className="w-full h-12 -my-px"
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="fl1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2F7BFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#2F7BFF" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {[20, 50, 80].map((x, i) => (
          <line
            key={x}
            x1={x}
            y1="0"
            x2="50"
            y2="50"
            stroke="url(#fl1)"
            strokeWidth="0.4"
            strokeDasharray="2 2"
            className="animate-flow"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </svg>

      {/* Ranked opportunities (the engine result) */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-strong">
          ranked opportunities
        </span>
        <span className="text-[10px] font-mono text-muted">
          {POOLS_SCORED}+ pools scored
        </span>
      </div>

      <div className="space-y-1.5 mb-3">
        {opps.map((o, i) => (
          <motion.div
            key={o.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className={`bg-surface border rounded-lg p-3 transition-colors ${
              i === 0
                ? "border-gold/40"
                : "border-border hover:border-border-strong"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-surface-2 overflow-hidden shrink-0"
                  style={{ boxShadow: `inset 0 0 0 1px ${o.color}40` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={o.icon}
                    alt={o.name}
                    width={18}
                    height={18}
                    className="w-[18px] h-[18px] object-contain rounded-[22%]"
                  />
                </span>
                <div>
                  <div className="text-xs font-medium text-foreground">
                    {o.name}{" "}
                    <span className="text-muted font-mono">/ {o.asset}</span>
                  </div>
                  <div className="text-[10px] font-mono text-muted uppercase tracking-wider mt-0.5">
                    {i === 0 ? "top match" : `score ${o.score}`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono tabular text-sm font-semibold">
                  {i === 0 ? (
                    <span className="gradient-text-gold">{o.apy}%</span>
                  ) : (
                    <span className="text-foreground">{o.apy}%</span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-muted">
                  APY
                  {i === 0 && (
                    <ArrowUpRight className="inline w-2.5 h-2.5 ml-0.5 text-gold" />
                  )}
                </div>
              </div>
            </div>

            {/* Top match: composite score + 5-factor breakdown (lib/score.ts) */}
            {i === 0 && (
              <div className="mt-3 pt-3 border-t hairline">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    composite score
                  </span>
                  <span className="font-mono tabular text-xs">
                    <span className="gradient-text-gold font-semibold">
                      {o.score}
                    </span>
                    <span className="text-muted"> / 100</span>
                  </span>
                </div>
                <div className="flex h-1.5 rounded-full overflow-hidden bg-border">
                  {scoreFactors.map((f, fi) => (
                    <motion.div
                      key={f.k}
                      initial={{ width: 0 }}
                      animate={{ width: `${f.v}%` }}
                      transition={{ delay: 0.8 + fi * 0.08, duration: 0.6 }}
                      style={{ background: f.c }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {scoreFactors.map((f) => (
                    <span
                      key={f.k}
                      className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-muted"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: f.c }}
                      />
                      {f.k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Deploy block — the conclusion of the top match */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="relative bg-surface-2 border border-gold/40 rounded-lg p-4 overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 280px 120px at 90% 0%, rgba(244, 181, 63, 0.14), transparent 70%)",
          }}
        />
        <div className="relative">
          <div className="text-[10px] font-mono uppercase tracking-widest text-gold/90 mb-1.5">
            ready to deploy
          </div>
          <div className="text-sm text-foreground">
            <span className="font-mono tabular font-medium">1,840 USDC</span>
            <span className="text-muted mx-1.5">→</span>
            <span className="font-medium">Aave v3</span>
          </div>
          <div className="text-[10px] font-mono text-muted mt-1">
            APY <span className="text-foreground">4.31%</span>
            <span className="mx-1.5">·</span>
            <span className="text-mint">+$79/yr</span>
            <span className="mx-1.5">·</span>1 signature
          </div>
        </div>
      </motion.div>
    </div>
  );
}
