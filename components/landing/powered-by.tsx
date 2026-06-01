"use client";

import { motion, useReducedMotion } from "framer-motion";

type Brand = { name: string; src: string };

// Real, official logomarks (transparent) live in /public/icons/infra.
const brands: Brand[] = [
  { name: "Arbitrum", src: "/icons/infra/arbitrum.svg" },
  { name: "DeFiLlama", src: "/icons/infra/defillama.png" },
  { name: "Reown", src: "/icons/infra/reown.svg" },
  { name: "Relay", src: "/icons/infra/relay.png" },
  { name: "Enso", src: "/icons/infra/enso.svg" },
  { name: "Aave", src: "/icons/infra/aave.svg" },
];

// Two copies fill wide viewports; the rendered list duplicates this once more so
// the -50% scroll (app/globals.css .animate-scroll-x) loops seamlessly.
const row = [...brands, ...brands];

type Orb = {
  slug: string;
  top: number;
  left: number;
  size: number;
  opacity: number;
  dur: number;
  delay: number;
  drift: number;
};

// Real Arbitrum protocols (dexes · perps · lending · LSTs) orbiting the label.
// Hand-tuned, deterministic scatter (no Math.random → no hydration mismatch),
// pushed to the periphery — the radial mask clears the centre band so the
// "Powered by" line and the marquee stay clean. Aave is intentionally absent
// here; it already rides the infra marquee below.
const ORBIT: Orb[] = [
  // top band
  { slug: "uniswap-v3", top: 8, left: 13, size: 42, opacity: 0.26, dur: 17, delay: 0.0, drift: 12 },
  { slug: "gmx-v2-perps", top: 5, left: 31, size: 34, opacity: 0.22, dur: 15, delay: 1.3, drift: 10 },
  { slug: "pendle", top: 10, left: 50, size: 30, opacity: 0.18, dur: 19, delay: 2.4, drift: 9 },
  { slug: "camelot-v3", top: 5, left: 69, size: 36, opacity: 0.24, dur: 16, delay: 0.8, drift: 11 },
  { slug: "euler-v2", top: 9, left: 88, size: 44, opacity: 0.27, dur: 20, delay: 1.9, drift: 13 },
  // upper sides
  { slug: "curve-dex", top: 27, left: 5, size: 38, opacity: 0.24, dur: 18, delay: 0.5, drift: 12 },
  { slug: "morpho-blue", top: 25, left: 93, size: 34, opacity: 0.22, dur: 21, delay: 2.1, drift: 11 },
  // mid sides (only the horizontal extremes survive the mask)
  { slug: "balancer-v2", top: 50, left: 3, size: 32, opacity: 0.2, dur: 16, delay: 3.0, drift: 10 },
  { slug: "fluid-dex", top: 48, left: 94, size: 30, opacity: 0.19, dur: 19, delay: 1.1, drift: 9 },
  // lower sides
  { slug: "radiant-v2", top: 72, left: 6, size: 36, opacity: 0.24, dur: 20, delay: 2.7, drift: 12 },
  { slug: "dolomite", top: 73, left: 93, size: 34, opacity: 0.22, dur: 17, delay: 0.3, drift: 11 },
  // bottom band
  { slug: "lido", top: 90, left: 15, size: 42, opacity: 0.26, dur: 18, delay: 1.6, drift: 13 },
  { slug: "uniswap-v4", top: 92, left: 34, size: 32, opacity: 0.21, dur: 15, delay: 3.2, drift: 10 },
  { slug: "ether-fi", top: 89, left: 52, size: 30, opacity: 0.18, dur: 21, delay: 0.9, drift: 9 },
  { slug: "gains-network", top: 91, left: 69, size: 34, opacity: 0.22, dur: 19, delay: 2.3, drift: 11 },
  { slug: "beefy", top: 89, left: 87, size: 38, opacity: 0.25, dur: 16, delay: 1.4, drift: 12 },
];

// Wide, short ellipse: clears the centre horizontal band (label + marquee),
// reveals everything orbiting the edges.
const MASK =
  "radial-gradient(ellipse 70% 34% at 50% 50%, transparent 30%, #000 72%)";

function OrbitField() {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden
      className="absolute inset-0 z-0 hidden md:block pointer-events-none overflow-hidden"
      style={{ maskImage: MASK, WebkitMaskImage: MASK }}
    >
      {ORBIT.map((s, i) => (
        <motion.img
          key={`${s.slug}-${i}`}
          src={`/icons/protocols/${s.slug}.png`}
          alt=""
          width={s.size}
          height={s.size}
          className="absolute object-contain select-none rounded-[22%]"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            filter: "grayscale(0.2) brightness(1.12)",
          }}
          initial={{ opacity: s.opacity, y: 0 }}
          animate={
            reduce
              ? { opacity: s.opacity }
              : { opacity: [s.opacity, s.opacity * 1.5, s.opacity], y: [0, -s.drift, 0] }
          }
          transition={
            reduce
              ? undefined
              : { duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ))}
    </div>
  );
}

export function PoweredBy() {
  return (
    <section className="relative flex flex-col justify-center overflow-hidden py-14 md:py-0 md:min-h-[calc(100vh-8rem)]">
      <OrbitField />

      <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8 text-center">
        <div className="text-[11px] font-mono uppercase tracking-widest text-muted">
          Powered by · infrastructure we build on
        </div>
      </div>
      <div className="relative z-10 overflow-hidden py-10 lg:py-12">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <div className="flex animate-scroll-x whitespace-nowrap">
          {[...row, ...row].map((b, i) => (
            <div
              key={i}
              className="group flex items-center gap-3 px-7 shrink-0 opacity-80 transition-opacity duration-300 hover:opacity-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.src}
                alt={b.name}
                width={28}
                height={28}
                className="w-7 h-7 object-contain shrink-0 drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]"
              />
              <span className="text-[15px] font-medium tracking-tight text-muted-strong transition-colors duration-300 group-hover:text-foreground">
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
