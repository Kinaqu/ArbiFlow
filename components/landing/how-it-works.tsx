"use client";

import { motion } from "framer-motion";
import { Plug, ScanLine, Sparkles } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: Plug,
    title: "Connect read-only",
    body: "Paste an address or use WalletConnect. We never request signatures, transfers, or approvals to scan.",
    detail: "0x4a2f…f8c1",
    detailLabel: "address attached",
  },
  {
    n: "02",
    icon: ScanLine,
    title: "Engine scans the chain",
    body: "Balances, current positions, and ~40 yield venues are pulled in parallel. The scoring model runs in milliseconds.",
    detail: "42 / 42",
    detailLabel: "protocols evaluated",
  },
  {
    n: "03",
    icon: Sparkles,
    title: "Strategies, ranked honestly",
    body: "You get an ordered list with the math behind every score, gas-adjusted for your wallet size and tolerance.",
    detail: "+$184/yr",
    detailLabel: "estimated uplift",
  },
];

export function HowItWorks() {
  return (
    <section className="relative border-t border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-4">
              [03] · The flow
            </div>
            <h2 className="text-3xl lg:text-5xl tracking-[-0.03em] font-semibold leading-[1.05]">
              Three steps. <span className="text-muted">Under two seconds.</span>
            </h2>
          </div>
          <p className="text-base text-muted-strong max-w-md">
            No onboarding. No KYC. No token. The entire scan loop is free and
            runs on public Arbitrum data.
          </p>
        </div>

        <div className="relative">
          {/* Connecting beam (desktop) */}
          <svg
            className="hidden lg:block absolute top-12 left-[16%] right-[16%] h-px -z-0"
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

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-10 relative">
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
