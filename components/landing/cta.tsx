"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

export function CTA() {
  return (
    <section id="cta" className="relative border-t border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-24 lg:py-36">
        <div className="relative overflow-hidden rounded-2xl border border-border-strong bg-surface">
          {/* gradient backdrop */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-90"
            style={{
              background:
                "radial-gradient(ellipse 600px 400px at 80% 0%, rgba(47, 123, 255, 0.18), transparent 60%), radial-gradient(ellipse 600px 400px at 0% 100%, rgba(244, 181, 63, 0.10), transparent 60%)",
            }}
          />
          {/* corner ticks */}
          <div className="absolute inset-0 pointer-events-none">
            {["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"].map(
              (pos) => (
                <span
                  key={pos}
                  className={`absolute ${pos} w-2 h-2 border-l border-t border-border-strong`}
                />
              ),
            )}
          </div>

          <div className="relative grid lg:grid-cols-12 gap-10 p-10 lg:p-16">
            <div className="lg:col-span-7">
              <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-5">
                [→] · Scan &amp; deploy
              </div>
              <h2 className="text-4xl lg:text-6xl tracking-[-0.03em] font-semibold leading-[1.02]">
                From idle to deployed in{" "}
                <span className="gradient-text-gold">one signature.</span>
              </h2>
              <p className="mt-6 text-lg text-muted-strong max-w-xl leading-relaxed">
                Connect your wallet. Free scan in under two seconds. Deploy the
                top‑scoring strategy with a single tap — your wallet, your
                signature, your funds.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <button className="btn-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-md text-base font-medium text-white">
                  <Zap className="w-4 h-4" />
                  Connect &amp; scan free
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="btn-ghost inline-flex items-center gap-2 px-6 py-3.5 rounded-md text-base font-medium text-foreground">
                  Try with sample wallet
                </button>
              </div>

              <div className="mt-7 flex flex-wrap gap-6 text-xs text-muted">
                <span>✓ Free scan · no signature</span>
                <span>✓ You sign every deploy</span>
                <span>✓ No token · no custody</span>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative bg-background border border-border rounded-xl p-5 font-mono text-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose/60" />
                    <span className="w-2 h-2 rounded-full bg-gold/60" />
                    <span className="w-2 h-2 rounded-full bg-mint/60" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-muted">
                    arbiflow.console
                  </span>
                </div>
                <div className="space-y-1.5 text-[13px]">
                  <div className="text-muted">
                    <span className="text-accent">$</span> arbiflow scan
                    --wallet=0x4a2f…
                  </div>
                  <div className="text-muted-strong">
                    → fetching balances
                    <span className="text-mint"> ✓</span>
                  </div>
                  <div className="text-muted-strong">
                    → detecting idle capital
                    <span className="text-mint"> ✓</span>
                  </div>
                  <div className="text-muted-strong">
                    → indexing 42 protocols
                    <span className="text-mint"> ✓</span>
                  </div>
                  <div className="text-muted-strong">
                    → running scorer
                    <span className="text-mint"> ✓</span>
                  </div>
                  <div className="text-muted-strong">
                    → ranking strategies
                    <span className="text-mint"> ✓</span>
                  </div>
                  <div className="pt-2 border-t hairline mt-3">
                    <div className="text-muted text-xs mb-1">
                      idle: <span className="gradient-text-gold">$2,340</span>
                      {"  ·  "}
                      potential uplift:{" "}
                      <span className="text-mint">+$184/yr</span>
                    </div>
                    <div className="text-foreground">
                      best score → <span className="text-accent">Aave v3 USDC</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-muted text-xs">
                        ready to deploy <span className="text-muted-strong">· 1 sig</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-gold border border-gold/40 bg-gold/10">
                        Deploy
                        <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
