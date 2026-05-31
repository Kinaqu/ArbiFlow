"use client";

import { motion, useReducedMotion } from "framer-motion";

type Star = {
  slug: string;
  top: number;
  left: number;
  size: number;
  opacity: number;
  dur: number;
  delay: number;
  drift: number;
};

// Hand-tuned, deterministic scatter (no Math.random → no hydration mismatch),
// biased toward the periphery. The container's radial mask fades anything near
// the centre so the headline stays readable.
const STARS: Star[] = [
  { slug: "aave-v3", top: 9, left: 5, size: 44, opacity: 0.30, dur: 16, delay: 0.0, drift: 12 },
  { slug: "uniswap-v3", top: 15, left: 89, size: 48, opacity: 0.32, dur: 19, delay: 1.4, drift: 14 },
  { slug: "gmx-v2-perps", top: 5, left: 71, size: 36, opacity: 0.24, dur: 14, delay: 2.1, drift: 10 },
  { slug: "pendle", top: 31, left: 2, size: 40, opacity: 0.27, dur: 21, delay: 0.6, drift: 13 },
  { slug: "lido", top: 71, left: 7, size: 46, opacity: 0.30, dur: 18, delay: 1.0, drift: 14 },
  { slug: "morpho-blue", top: 82, left: 27, size: 36, opacity: 0.25, dur: 17, delay: 2.6, drift: 11 },
  { slug: "radiant-v2", top: 63, left: 93, size: 42, opacity: 0.29, dur: 20, delay: 0.3, drift: 13 },
  { slug: "balancer-v2", top: 87, left: 63, size: 38, opacity: 0.24, dur: 22, delay: 1.8, drift: 12 },
  { slug: "compound-v3", top: 41, left: 95, size: 34, opacity: 0.25, dur: 15, delay: 3.0, drift: 10 },
  { slug: "camelot-v3", top: 88, left: 88, size: 32, opacity: 0.22, dur: 18, delay: 2.3, drift: 11 },
  { slug: "ether-fi", top: 4, left: 39, size: 30, opacity: 0.20, dur: 16, delay: 3.4, drift: 9 },
  { slug: "dolomite", top: 49, left: 1, size: 32, opacity: 0.24, dur: 19, delay: 1.2, drift: 11 },
  { slug: "gains-network", top: 17, left: 24, size: 32, opacity: 0.22, dur: 17, delay: 2.8, drift: 10 },
  { slug: "beefy", top: 55, left: 79, size: 36, opacity: 0.28, dur: 21, delay: 0.9, drift: 12 },
  { slug: "curve-dex", top: 24, left: 49, size: 30, opacity: 0.18, dur: 15, delay: 3.6, drift: 9 },
  { slug: "silo-v2", top: 92, left: 45, size: 30, opacity: 0.22, dur: 20, delay: 1.6, drift: 10 },
];

const MASK =
  "radial-gradient(ellipse 62% 60% at 50% 42%, transparent 32%, #000 78%)";

export function ProtocolConstellation() {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden
      className="absolute inset-0 z-0 hidden md:block pointer-events-none overflow-hidden"
      style={{ maskImage: MASK, WebkitMaskImage: MASK }}
    >
      {STARS.map((s, i) => (
        <motion.img
          key={`${s.slug}-${i}`}
          src={`/icons/protocols/${s.slug}.png`}
          alt=""
          width={s.size}
          height={s.size}
          className="absolute object-contain select-none"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            filter: "grayscale(0.15) brightness(1.15)",
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
