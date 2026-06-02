"use client";

import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { ConnectButton } from "@/components/wallet/connect-button";
import { PROTOCOL_COUNT } from "@/lib/constants";

const cards = [
  {
    badge: "Best risk-adjusted",
    badgeTone: "gold",
    proto: "Aave v3",
    icon: "/icons/protocols/aave-v3.png",
    asset: "USDC",
    score: 82,
    apy: "4.31",
    base: "3.92",
    incentive: "+0.61",
    gas: "-0.22",
    risk: { protocol: 18, vol: 8, liq: 5, gas: 12 },
    riskLabel: "Low",
    color: "#B6509E",
  },
  {
    badge: "Highest yield · sustainable",
    badgeTone: "blue",
    proto: "Radiant Capital",
    icon: "/icons/protocols/radiant-v2.png",
    asset: "USDC",
    score: 74,
    apy: "6.84",
    base: "4.10",
    incentive: "+3.20",
    gas: "-0.46",
    risk: { protocol: 32, vol: 12, liq: 14, gas: 18 },
    riskLabel: "Medium",
    color: "#7E62E5",
  },
  {
    badge: "Aggressive · monitor weekly",
    badgeTone: "rose",
    proto: "GMX v2",
    icon: "/icons/protocols/gmx-v2-perps.png",
    asset: "GLP basket",
    score: 58,
    apy: "14.22",
    base: "11.40",
    incentive: "+3.50",
    gas: "-0.68",
    risk: { protocol: 22, vol: 48, liq: 18, gas: 14 },
    riskLabel: "High",
    color: "#03d1ce",
  },
];

export function Opportunities() {
  return (
    <section
      id="opportunities"
      className="relative"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-6 lg:py-8">
        <div className="max-w-2xl mb-7">
          <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-4">
            [04] · Sample output
          </div>
          <h2 className="text-3xl lg:text-5xl tracking-[-0.03em] font-semibold leading-[1.05]">
            What a real scan returns.
          </h2>
          <p className="mt-5 text-lg text-muted-strong leading-relaxed">
            Top picks for a wallet holding $2,340 in idle USDC and ARB.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {cards.map((c, i) => (
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
              {/* Badge */}
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
                  #{String(i + 1).padStart(2, "0")} / {PROTOCOL_COUNT}
                </span>
              </div>

              {/* Header */}
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
                    <span
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 0%, ${c.color}1f, transparent 70%)`,
                      }}
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
                      {c.score}
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-muted mt-1">
                      score
                    </span>
                  </div>
                </div>
              </div>

              {/* APY breakdown */}
              <div className="px-5 py-4 border-b hairline">
                <div className="flex items-baseline justify-between mb-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    Net APY
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-mono tabular font-semibold ${
                        i === 0
                          ? "gradient-text-gold"
                          : "text-foreground"
                      }`}
                    >
                      {c.apy}
                    </span>
                    <span className="text-lg font-mono text-muted-strong">
                      %
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-muted-strong">
                    <span>Base yield</span>
                    <span className="tabular">{c.base}%</span>
                  </div>
                  <div className="flex justify-between text-mint">
                    <span>Incentives</span>
                    <span className="tabular">{c.incentive}%</span>
                  </div>
                  <div className="flex justify-between text-rose">
                    <span>Gas drag</span>
                    <span className="tabular">{c.gas}%</span>
                  </div>
                </div>
              </div>

              {/* Risk bars */}
              <div className="px-5 pt-4 pb-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    Risk profile
                  </div>
                  <div
                    className={`text-[10px] font-mono uppercase tracking-widest flex items-center gap-1 ${
                      c.riskLabel === "Low"
                        ? "text-mint"
                        : c.riskLabel === "Medium"
                          ? "text-gold"
                          : "text-rose"
                    }`}
                  >
                    {c.riskLabel === "High" && (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {c.riskLabel}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(c.risk).map(([k, v]) => (
                    <div key={k}>
                      <div className="h-1 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${v}%`,
                            background:
                              v < 20
                                ? "#34E0A1"
                                : v < 40
                                  ? "#F4B53F"
                                  : "#FF5A6B",
                          }}
                        />
                      </div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-muted mt-1.5 text-center">
                        {k}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <ConnectButton size="lg" className="font-semibold">
            Scan your wallet · full ranked list
            <ArrowRight className="w-4 h-4" />
          </ConnectButton>
        </div>
      </div>
    </section>
  );
}
