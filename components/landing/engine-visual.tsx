"use client";

import { motion } from "framer-motion";
import { Wallet, Cpu, ArrowUpRight, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { PROTOCOL_COUNT } from "@/lib/constants";

const stages = [
  { label: "balances loaded", delay: 0.6 },
  { label: "idle capital detected", delay: 0.85 },
  { label: `${PROTOCOL_COUNT} protocols evaluated`, delay: 1.1 },
  { label: "scoring complete", delay: 1.35 },
];

const tokens = [
  { sym: "USDC", bal: "1,840.22", idle: true, color: "#2775CA" },
  { sym: "ETH", bal: "0.412", idle: false, color: "#627EEA" },
  { sym: "ARB", bal: "682.50", idle: true, color: "#28A0F0" },
];

const opps = [
  { name: "Aave v3", asset: "USDC", apy: "4.31", risk: "Low", color: "#B6509E", icon: "/icons/protocols/aave-v3.png" },
  { name: "Radiant", asset: "USDC", apy: "6.84", risk: "Med", color: "#7E62E5", icon: "/icons/protocols/radiant-v2.png" },
  { name: "GMX v2", asset: "GLP", apy: "14.22", risk: "High", color: "#03d1ce", icon: "/icons/protocols/gmx-v2-perps.png" },
];

export function EngineVisual() {
  const router = useRouter();
  const { open } = useAppKit();
  const { isConnected } = useAccount();
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
            <path
              d="M0 0H6M0 0V6"
              stroke="currentColor"
              strokeWidth="1"
            />
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
          <span className="text-[10px] font-mono text-mint flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-mint animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="space-y-1.5">
          {tokens.map((t) => (
            <div
              key={t.sym}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: t.color }}
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

      {/* Flow lines wallet -> engine */}
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

      {/* Engine core */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative bg-surface-2 border border-border-strong rounded-lg p-4 overflow-hidden"
      >
        <div className="absolute -inset-px rounded-lg pointer-events-none">
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
        </div>
        <div className="flex items-center justify-between mb-3 relative">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Cpu className="w-3.5 h-3.5 text-accent" />
              <span className="absolute inset-0 rounded-full bg-accent/30 animate-pulse-ring" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-strong">
              scoring engine
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted">
            {PROTOCOL_COUNT} strategies analyzed
          </span>
        </div>

        {/* Stage log */}
        <div className="mb-3 space-y-1">
          {stages.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: s.delay, duration: 0.35 }}
              className="flex items-center justify-between text-[10px] font-mono"
            >
              <span className="text-muted">→ {s.label}</span>
              <Check className="w-3 h-3 text-mint" />
            </motion.div>
          ))}
        </div>

        {/* Mini formula bars */}
        <div className="grid grid-cols-4 gap-1.5 mb-1">
          {[
            { label: "APY", v: 92, c: "#34E0A1" },
            { label: "Risk", v: 38, c: "#F4B53F" },
            { label: "Liq", v: 78, c: "#2F7BFF" },
            { label: "Gas", v: 22, c: "#FF5A6B" },
          ].map((m, i) => (
            <div key={m.label} className="space-y-1">
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.v}%` }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: m.c }}
                />
              </div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted text-center">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Flow lines engine -> opps */}
      <svg
        className="w-full h-10 -my-px"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
      >
        {[20, 50, 80].map((x, i) => (
          <line
            key={x}
            x1="50"
            y1="0"
            x2={x}
            y2="40"
            stroke="#2F7BFF"
            strokeWidth="0.4"
            strokeOpacity="0.5"
            strokeDasharray="2 2"
            className="animate-flow"
            style={{ animationDelay: `${0.5 + i * 0.3}s` }}
          />
        ))}
      </svg>

      {/* Opportunities */}
      <div className="space-y-1.5 mb-3">
        {opps.map((o, i) => (
          <motion.div
            key={o.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between group hover:border-border-strong transition-colors"
          >
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
                  className="w-[18px] h-[18px] object-contain"
                />
              </span>
              <div>
                <div className="text-xs font-medium text-foreground">
                  {o.name}{" "}
                  <span className="text-muted font-mono">/ {o.asset}</span>
                </div>
                <div className="text-[10px] font-mono text-muted uppercase tracking-wider mt-0.5">
                  risk {o.risk}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono tabular text-sm font-semibold">
                {i === 0 && (
                  <span className="gradient-text-gold">{o.apy}%</span>
                )}
                {i !== 0 && <span className="text-foreground">{o.apy}%</span>}
              </div>
              <div className="text-[10px] font-mono text-muted">
                net APY
                {i === 0 && (
                  <ArrowUpRight className="inline w-2.5 h-2.5 ml-0.5 text-gold" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Deploy block */}
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
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-widest text-gold/90 mb-1.5">
              ready to deploy
            </div>
            <div className="text-xs text-foreground truncate">
              <span className="font-mono tabular">1,840 USDC</span>
              <span className="text-muted mx-1.5">→</span>
              <span className="font-medium">Aave v3</span>
            </div>
            <div className="text-[10px] font-mono text-muted mt-1">
              <span className="text-mint">+$184/yr</span>
              <span className="mx-1.5">·</span>1 signature
            </div>
          </div>
          <button
            type="button"
            onClick={() => (isConnected ? router.push("/app") : open())}
            className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-white whitespace-nowrap flex-shrink-0"
          >
            Deploy
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
