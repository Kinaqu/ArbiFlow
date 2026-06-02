"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plug, ScanLine, Sparkles, Rocket } from "lucide-react";
import clsx from "clsx";
import { PROTOCOL_COUNT } from "@/lib/constants";
import { CardSwap, Card } from "./card-swap";

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
    detail: `${PROTOCOL_COUNT} / ${PROTOCOL_COUNT}`,
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

const SWAP_INTERVAL = 3200;

function StepFace({ s }: { s: (typeof steps)[number] }) {
  const Icon = s.icon;
  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-5 flex items-center gap-4">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-border-strong bg-surface">
          <Icon className="h-5 w-5 text-accent" />
          <span className="absolute -inset-2 rounded-full border border-accent/20" />
        </div>
        <div className="font-mono text-5xl font-light text-border-strong">{s.n}</div>
      </div>

      <h3 className="mb-3 text-xl font-medium tracking-tight lg:text-2xl">{s.title}</h3>
      <p className="text-base leading-relaxed text-muted">{s.body}</p>

      <div className="mt-auto flex items-center justify-between rounded-lg border border-border bg-surface p-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {s.detailLabel}
        </span>
        <span className="tabular font-mono text-sm text-foreground">{s.detail}</span>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const reduce = useReducedMotion();
  const [order, setOrder] = useState([0, 1, 2, 3]);
  const [resetKey, setResetKey] = useState(0);
  const pausedRef = useRef(false);
  const active = order[0];

  // Auto-advance the stack. `pausedRef` is read live so hover doesn't re-subscribe;
  // `resetKey` restarts the clock after a manual jump so the next swap is a full beat.
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setOrder(([front, ...rest]) => [...rest, front]);
    }, SWAP_INTERVAL);
    return () => clearInterval(id);
  }, [reduce, resetKey]);

  const bringToFront = (i: number) => {
    setOrder((o) => [i, ...o.filter((x) => x !== i)]);
    setResetKey((k) => k + 1);
  };

  const header = (
    <div>
      <div className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted">
        [03] · The flow
      </div>
      <h2 className="text-3xl font-semibold leading-[1.05] tracking-[-0.03em] lg:text-4xl">
        Four steps.{" "}
        <span className="text-muted">Wallet to yield in under 30 seconds.</span>
      </h2>
      <p className="mt-5 max-w-md text-base text-muted-strong">
        Scan is free. Deploy when you&apos;re ready. Non‑custodial throughout — funds
        never leave your wallet until you sign.
      </p>
    </div>
  );

  const staticGrid = (
    <div className="grid gap-5 sm:grid-cols-2">
      {steps.map((s) => (
        <Card key={s.n} className="min-h-[260px]">
          <StepFace s={s} />
        </Card>
      ))}
    </div>
  );

  // Reduced motion: no rotation — show all four steps at once, every size.
  if (reduce) {
    return (
      <section id="how" className="relative">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <div className="mb-12">{header}</div>
          {staticGrid}
        </div>
      </section>
    );
  }

  return (
    <section id="how" className="relative">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        {/* lg+ : copy + synced step rail (left) · CardSwap stack (right) */}
        <div className="hidden items-center gap-12 lg:grid lg:grid-cols-12">
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
            >
              {header}
            </motion.div>

            <div className="mt-10 flex flex-col gap-1">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === active;
                return (
                  <motion.button
                    key={s.n}
                    type="button"
                    onClick={() => bringToFront(i)}
                    aria-current={isActive ? "step" : undefined}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                    className={clsx(
                      "flex items-center gap-4 rounded-lg px-3 py-3 text-left transition-colors",
                      isActive ? "bg-surface-2" : "hover:bg-surface"
                    )}
                  >
                    <span
                      className={clsx(
                        "h-7 w-1 rounded-full transition-colors",
                        isActive ? "bg-accent" : "bg-border-strong"
                      )}
                    />
                    <span
                      className={clsx(
                        "tabular font-mono text-sm transition-colors",
                        isActive ? "text-accent" : "text-muted"
                      )}
                    >
                      {s.n}
                    </span>
                    <Icon
                      className={clsx(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-accent" : "text-muted"
                      )}
                    />
                    <span
                      className={clsx(
                        "text-base font-medium transition-colors",
                        isActive ? "text-foreground" : "text-muted-strong"
                      )}
                    >
                      {s.title}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div
              className="relative mx-auto h-[500px] w-full max-w-[560px]"
              onMouseEnter={() => {
                pausedRef.current = true;
              }}
              onMouseLeave={() => {
                pausedRef.current = false;
              }}
            >
              <CardSwap order={order}>
                {steps.map((s) => (
                  <Card key={s.n}>
                    <StepFace s={s} />
                  </Card>
                ))}
              </CardSwap>
            </div>
          </motion.div>
        </div>

        {/* below lg : static grid, all four steps visible */}
        <div className="lg:hidden">
          <div className="mb-10">{header}</div>
          {staticGrid}
        </div>
      </div>
    </section>
  );
}
