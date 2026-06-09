"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  animate,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EngineVisual } from "./engine-visual";
import { ProtocolConstellation } from "./protocol-constellation";
import { RotatingProtocol } from "./rotating-protocol";
import { LogoMark } from "./logo";
import { ConnectButton } from "@/components/wallet/connect-button";
import { PROTOCOL_COUNT } from "@/lib/constants";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// Animated number that counts up from 0 the first time it scrolls into view.
function CountUp({
  value,
  decimals = 0,
  suffix = "",
}: {
  value: number;
  decimals?: number;
  suffix?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  // No horizontal margin: a uniform negative margin would push the leftmost
  // stat (sitting in the page gutter) out of the detection box on narrow widths.
  const inView = useInView(ref, { once: true });
  // Always start at 0 so server and client markup match (reduced-motion is a
  // client-only signal — branching on it in initial state desyncs hydration).
  // Reduced motion just snaps to the final value via a zero-duration tween.
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: reduce ? 0 : 1.1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className="tabular">
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

const stats: { node: React.ReactNode; l: string }[] = [
  { node: <CountUp value={PROTOCOL_COUNT} />, l: "protocols indexed" },
  { node: <CountUp value={1.8} decimals={1} suffix="s" />, l: "wallet scan time" },
  { node: "1 sig", l: "to deploy" },
  { node: "$0", l: "scan · no token" },
];

export function Hero() {
  const reduce = useReducedMotion();
  const [attract, setAttract] = useState(false);
  const squareRef = useRef<HTMLSpanElement>(null);
  return (
    <section className="relative overflow-hidden">
      <ProtocolConstellation active={attract} targetRef={squareRef} />

      {/* Ambient aurora behind the headline */}
      <motion.div
        aria-hidden
        className="absolute z-0 -top-24 -left-24 w-[680px] h-[680px] pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side, rgba(47,123,255,0.16), transparent 70%), radial-gradient(closest-side, rgba(244,181,63,0.10), transparent 75%)",
          filter: "blur(40px)",
        }}
        animate={reduce ? undefined : { scale: [1, 1.12, 1], opacity: [0.55, 0.8, 0.55] }}
        transition={
          reduce ? undefined : { duration: 12, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8 pt-16 lg:pt-24 pb-20 lg:pb-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: editorial */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-7"
          >
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 px-2.5 py-1 border border-border rounded-full bg-surface/60 mb-7"
            >
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-accent" />
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/infra/arbitrum.svg"
                alt=""
                width={14}
                height={14}
                className="w-3.5 h-3.5"
              />
              <span className="text-[11px] font-mono uppercase tracking-widest text-muted-strong">
                Arbitrum One
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-[44px] sm:text-[56px] lg:text-[72px] leading-[1.02] tracking-[-0.04em] font-semibold"
            >
              Deploy idle capital into the best DeFi yield on
              <span className="block mt-2 sm:mt-3">
                <RotatingProtocol />
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-7 text-base sm:text-lg text-muted-strong max-w-xl leading-relaxed"
            >
              ArbiFlow scans your Arbitrum wallet, ranks every yield opportunity
              by a{" "}
              <span className="text-foreground">risk‑adjusted composite score</span>
              , and lets you deploy into the top match in a single signature.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <span
                className="relative inline-flex"
                onMouseEnter={() => setAttract(true)}
                onMouseLeave={() => setAttract(false)}
              >
                {/* ArbiFlow square — the scattered background protocol logos
                    gather into this mark on hover (see ProtocolConstellation). */}
                <motion.span
                  ref={squareRef}
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 -top-14 -translate-x-1/2 flex items-center justify-center w-11 h-11 rounded-xl border border-border bg-surface/90 backdrop-blur-sm shadow-glow-gold"
                  initial={false}
                  animate={
                    attract && !reduce
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.6 }
                  }
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                >
                  <LogoMark size={26} />
                </motion.span>
                <ConnectButton size="md">
                  Connect wallet · scan &amp; deploy
                  <ArrowRight className="w-4 h-4" />
                </ConnectButton>
              </span>
              <a
                href="#how"
                className="btn-ghost inline-flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium text-foreground"
              >
                See how it works
              </a>
            </motion.div>

            {/* Stat strip — anchored under the copy as a spec line */}
            <motion.div
              variants={item}
              className="mt-12 pt-6 border-t hairline grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl"
            >
              {stats.map((s, i) => (
                <div
                  key={s.l}
                  className={i > 0 ? "sm:pl-6 sm:border-l sm:border-border/70" : ""}
                >
                  <div className="text-2xl font-mono tabular font-semibold text-foreground">
                    {s.node}
                  </div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-muted mt-1">
                    {s.l}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: engine */}
          <div className="lg:col-span-5">
            <EngineVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
