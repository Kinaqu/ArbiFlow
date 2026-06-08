"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

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

// Typewriter cadence (ms).
const TYPE_SPEED = 85;
const DELETE_SPEED = 40;
const HOLD = 1500; // pause on the fully-typed name before deleting

export function RotatingProtocol() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const p = PROTOCOLS[i];
  const full = p.name;

  // Typewriter loop: type → hold → delete → advance to the next protocol.
  // Reduced motion skips the loop; the first name is shown statically below.
  useEffect(() => {
    if (reduce) return;

    // Fully typed → hold, then start deleting.
    if (!deleting && text === full) {
      const t = setTimeout(() => setDeleting(true), HOLD);
      return () => clearTimeout(t);
    }

    // Fully deleted → swap to the next protocol (icon swaps here too).
    if (deleting && text === "") {
      const t = setTimeout(() => {
        setDeleting(false);
        setI((v) => (v + 1) % PROTOCOLS.length);
      }, DELETE_SPEED);
      return () => clearTimeout(t);
    }

    // Add or remove one character.
    const t = setTimeout(
      () =>
        setText((cur) =>
          deleting ? cur.slice(0, -1) : full.slice(0, cur.length + 1),
        ),
      deleting ? DELETE_SPEED : TYPE_SPEED,
    );
    return () => clearTimeout(t);
  }, [text, deleting, full, reduce]);

  return (
    <span className="relative inline-flex items-center align-bottom">
      <span className="inline-flex items-center gap-[0.35em] whitespace-nowrap">
        <span
          className="relative inline-flex items-center justify-center rounded-[0.28em] bg-surface-2 overflow-hidden shrink-0"
          style={{ width: "0.92em", height: "0.92em" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/icons/protocols/${p.slug}.png`}
            alt={p.name}
            className="object-contain rounded-[22%]"
            style={{ width: "0.66em", height: "0.66em" }}
          />
        </span>
        <span>
          <span className="gradient-text-gold">{reduce ? full : text}</span>
          {!reduce && (
            <span aria-hidden className="text-gold animate-pulse">
              |
            </span>
          )}
        </span>
      </span>
    </span>
  );
}
