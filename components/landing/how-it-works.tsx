"use client";

import { motion } from "framer-motion";
import { Plug, ScanLine, Sparkles, Rocket } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: Plug,
    title: "Connect wallet",
    body: "WalletConnect or browser wallet. The free scan kicks off automatically — no commitment, no signature required to look.",
    detail: "0x4a2f…f8c1",
    detailLabel: "connected",
  },
  {
    n: "02",
    icon: ScanLine,
    title: "Scan in stages",
    body: "Balances, idle capital, ~40 yield venues, scoring — each stage streams in milliseconds. You see the math as it computes.",
    detail: "42 / 42",
    detailLabel: "protocols scored",
  },
  {
    n: "03",
    icon: Sparkles,
    title: "Strategies, ranked",
    body: "An ordered list with the full breakdown behind every score. Gas-adjusted for your wallet size and risk tolerance.",
    detail: "+$184/yr",
    detailLabel: "uplift on top pick",
  },
  {
    n: "04",
    icon: Rocket,
    title: "Deploy in one click",
    body: "Pick a strategy, hit deploy. ArbiFlow builds the tx — your wallet signs. Funds go straight to the protocol, never to us.",
    detail: "1 sig",
    detailLabel: "to execute",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative border-t border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-4">
              [03] · The flow
            </div>
            <h2 className="text-3xl lg:text-5xl tracking-[-0.03em] font-semibold leading-[1.05]">
              Four steps.{" "}
              <span className="text-muted">Wallet to yield in under 30 seconds.</span>
            </h2>
          </div>
          <p className="text-base text-muted-strong max-w-md">
            Scan is free. Deploy when you&apos;re ready. Non‑custodial throughout —
            funds never leave your wallet until you sign.
          </p>
        </div>

        <div className="relative">
          {/* Connecting beam (desktop) */}
          <svg
            className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-px -z-0"
            viewBox="0 0 100 1"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="0.5"
              x2="100"
              y2="0.5"
              stroke="#2A2F3C"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
            <line
              x1="0"
              y1="0.5"
              x2="100"
              y2="0.5"
              stroke="#2F7BFF"
              strokeWidth="0.5"
              strokeDasharray="20 80"
              className="animate-flow"
            />
          </svg>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: i * 0.12 }}
                  className="relative"
                >
                  {/* Step node on beam */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-12 h-12 rounded-full bg-surface border border-border-strong flex items-center justify-center">
                      <Icon className="w-5 h-5 text-accent" />
                      <span className="absolute -inset-2 rounded-full border border-accent/20" />
                    </div>
                    <div className="text-5xl font-mono font-light text-border-strong">
                      {s.n}
                    </div>
                  </div>

                  <h3 className="text-xl lg:text-2xl font-medium tracking-tight mb-3">
                    {s.title}
                  </h3>
                  <p className="text-base text-muted leading-relaxed mb-6">
                    {s.body}
                  </p>

                  <div className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                      {s.detailLabel}
                    </span>
                    <span className="font-mono tabular text-sm text-foreground">
                      {s.detail}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
