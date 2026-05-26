"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Is ArbiFlow a custodian?",
    a: "No. Scanning is signature-free. When you deploy, your wallet signs the transaction and funds route directly to the protocol. ArbiFlow never holds custody and has no admin keys over your positions.",
  },
  {
    q: "What chains do you support?",
    a: "Arbitrum One only, on purpose. The scoring model is tuned to Arbitrum gas and protocol mix. Other chains come once the model is hardened.",
  },
  {
    q: "How are APYs computed?",
    a: "We start from raw protocol APYs, normalize them over a 30-day window, decay-adjust token incentives, then subtract simulated gas at your wallet size to land on a net APY.",
  },
  {
    q: "Why should I trust the risk weights?",
    a: "You do not have to. Every score is broken down into its inputs and weights — you can argue with each one. The same formula runs across every protocol with no hand-tuning per partner.",
  },
  {
    q: "Do you take a fee?",
    a: "Scanning is free. There is no ArbiFlow token. On deploys, we charge a small, disclosed performance fee on incremental yield only — never on your principal, never on the amount you deploy.",
  },
  {
    q: "What data sources do you use?",
    a: "DefiLlama for protocol yields, Arbitrum public RPC for balances and positions, and several audit registries for protocol risk. All sources are listed in the docs.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative border-t border-border bg-surface/20">
      <div className="mx-auto max-w-5xl px-5 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-4">
              [08] · Questions
            </div>
            <h2 className="text-3xl lg:text-4xl tracking-[-0.03em] font-semibold leading-[1.05]">
              You probably want to ask.
            </h2>
            <p className="mt-5 text-base text-muted">
              If something is not here, write us — the docs are open.
            </p>
          </div>
          <div className="lg:col-span-8">
            <div className="divide-y hairline border-y hairline">
              {faqs.map((f, i) => {
                const isOpen = open === i;
                return (
                  <div key={f.q}>
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="w-full text-left py-5 flex items-start justify-between gap-6 group"
                    >
                      <span
                        className={`text-base lg:text-lg transition-colors ${
                          isOpen
                            ? "text-foreground"
                            : "text-muted-strong group-hover:text-foreground"
                        }`}
                      >
                        {f.q}
                      </span>
                      <span className="flex-shrink-0 mt-1">
                        {isOpen ? (
                          <Minus className="w-4 h-4 text-accent" />
                        ) : (
                          <Plus className="w-4 h-4 text-muted" />
                        )}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="pb-6 pr-10 text-muted-strong leading-relaxed">
                        {f.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
