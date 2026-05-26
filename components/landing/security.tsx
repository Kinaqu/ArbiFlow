"use client";

import { Eye, Key, Wallet, Send, Cpu, ArrowRight } from "lucide-react";

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
    <section className="relative border-t border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-24 lg:py-32">
        <div className="max-w-3xl mb-14">
          <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-4">
            [07] · Trust by design
          </div>
          <h2 className="text-3xl lg:text-5xl tracking-[-0.03em] font-semibold leading-[1.05]">
            You sign.{" "}
            <span className="text-muted">We never custody.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-strong leading-relaxed">
            Scanning is free and signature-less. When you deploy, transactions
            are built in the browser and signed by your wallet. Funds route
            directly to the protocol — ArbiFlow never holds custody and cannot
            move a cent without your signature.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-px bg-border border border-border rounded-xl overflow-hidden">
          <div className="bg-surface p-8">
            <div className="text-[10px] font-mono uppercase tracking-widest text-mint mb-5">
              what arbiflow does
            </div>
            <ul className="space-y-4">
              {can.map((c) => {
                const Icon = c.icon;
                return (
                  <li key={c.label} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-mint/10 border border-mint/20 flex items-center justify-center flex-shrink-0">
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
          <div className="bg-surface p-8">
            <div className="text-[10px] font-mono uppercase tracking-widest text-rose mb-5">
              what arbiflow never does
            </div>
            <ul className="space-y-4">
              {cant.map((c) => {
                const Icon = c.icon;
                return (
                  <li key={c.label} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-rose/10 border border-rose/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-rose" />
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
      </div>
    </section>
  );
}
