"use client";

import { Check, X, Eye, Key, Wallet, Send } from "lucide-react";

const can = [
  { icon: Eye, label: "Read your public balances" },
  { icon: Wallet, label: "Identify open DeFi positions" },
  { icon: Check, label: "Compute scores entirely client-side" },
];

const cant = [
  { icon: Key, label: "Request token approvals" },
  { icon: Send, label: "Move, swap, or stake your funds" },
  { icon: X, label: "Store your seed, keys, or signatures" },
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
            We can read.{" "}
            <span className="text-muted">We cannot move.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-strong leading-relaxed">
            Scanning is read-only. When you decide to execute a strategy,
            transactions are constructed in the browser and you sign them
            directly with your wallet. ArbiFlow never holds custody.
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
