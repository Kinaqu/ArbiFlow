"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Curated, recognizable subset (clean display names — manifest slugs are
// versioned). Every PNG exists in /public/icons/protocols.
const PROTOCOLS = [
  { slug: "aave-v3", name: "Aave" },
  { slug: "uniswap-v3", name: "Uniswap" },
  { slug: "gmx-v2-perps", name: "GMX" },
  { slug: "pendle", name: "Pendle" },
  { slug: "curve-dex", name: "Curve" },
  { slug: "morpho-blue", name: "Morpho" },
  { slug: "lido", name: "Lido" },
  { slug: "camelot-v3", name: "Camelot" },
];

export function RotatingProtocol() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return; // honour reduced-motion: no autoplay
    const id = setInterval(() => {
      setI((v) => (v + 1) % PROTOCOLS.length);
    }, 2000);
    return () => clearInterval(id);
  }, [reduce]);

  const p = PROTOCOLS[i];

  return (
    <span className="relative inline-flex items-center align-bottom">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={p.slug}
          className="inline-flex items-center gap-[0.35em] whitespace-nowrap"
          initial={reduce ? false : { y: "40%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: "-40%", opacity: 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 70, damping: 16 }
          }
        >
          <span
            className="relative inline-flex items-center justify-center rounded-[0.28em] bg-surface-2 overflow-hidden shrink-0"
            style={{
              width: "0.92em",
              height: "0.92em",
              boxShadow: "inset 0 0 0 1px rgba(244,181,63,0.28)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/icons/protocols/${p.slug}.png`}
              alt={p.name}
              className="object-contain rounded-[22%]"
              style={{ width: "0.66em", height: "0.66em" }}
            />
          </span>
          <span className="gradient-text-gold">{p.name}</span>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
