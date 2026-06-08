"use client";

import { Eye, Key, Wallet, Send, Cpu, ArrowRight, ShieldCheck } from "lucide-react";

const can = [
  { icon: Eye, label: "Scan your public balances (no signature)" },
  { icon: Cpu, label: "Build transactions client-side" },
  { icon: ArrowRight, label: "Route signed txs straight to the protocol" },
];

const cant = [
  { icon: Key, label: "Hold or store your private keys" },
  { icon: Send, label: "Move funds without your signature" },
  { icon: Wallet, label: "Take custody at any step" },
];

export function Security() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-4">
              [07] · Trust by design
            </div>
            <h2 className="text-3xl lg:text-5xl tracking-[-0.03em] font-semibold leading-[1.05]">
              You sign.{" "}
              <span className="text-muted">We never custody.</span>
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-full bg-surface/60 self-start">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-mint opacity-75 animate-ping" />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-mint" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-muted-strong">
              You sign every tx
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* does */}
          <div className="relative overflow-hidden rounded-xl border border-mint/20 bg-mint/[0.04] p-8">
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 420px 200px at 0% 0%, rgba(52,224,161,0.10), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-4 h-4 text-mint" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-mint">
                  what arbiflow does
                </span>
              </div>
              <ul className="space-y-4">
                {can.map((c) => {
                  const Icon = c.icon;
                  return (
                    <li key={c.label} className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-lg bg-mint/10 border border-mint/25 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-mint" />
                      </div>
                      <span className="text-base text-foreground">
                        {c.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* never */}
          <div className="relative overflow-hidden rounded-xl border border-rose/20 bg-rose/[0.04] p-8">
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 420px 200px at 100% 0%, rgba(255,90,107,0.10), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-6">
                <Key className="w-4 h-4 text-rose" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose">
                  what arbiflow never does
                </span>
              </div>
              <ul className="space-y-4">
                {cant.map((c) => {
                  const Icon = c.icon;
                  return (
                    <li key={c.label} className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-lg bg-rose/10 border border-rose/25 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-rose" />
                      </div>
                      <span className="text-base text-muted-strong">
                        {c.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted leading-relaxed max-w-3xl">
          The optional delegation vault (testnet) works differently by design:
          you authorize a keeper to rebalance for you, but the contract still
          enforces whitelisted-only moves, a portfolio-value floor on every
          move, and owner-only withdrawals — ArbiFlow can route, never drain.
        </p>
      </div>
    </section>
  );
}
