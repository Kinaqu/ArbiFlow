"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

// WebGL can't be server-rendered — load the single shared Canvas on the client only.
const Antigravity = dynamic(() => import("./antigravity"), { ssr: false });

/**
 * One fixed, full-viewport Antigravity particle field that sits behind the whole
 * page. The glass stacking cards float over it, so the particles read as "behind
 * the cards". Gated off for reduced-motion users and below md (skip the WebGL
 * cost on phones). Idle auto-animation only — the layer is pointer-events-none,
 * so it can't track the cursor anyway.
 */
export function AntigravityField() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const { scrollYProgress } = useScroll();
  // Faint behind the hero, more present once you reach the stacked deck.
  const opacity = useTransform(scrollYProgress, [0, 0.12, 1], [0.22, 0.6, 0.6]);

  useEffect(() => {
    if (reduced) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setEnabled(mq.matches);

    // Defer the first mount to idle so the three.js chunk parse + WebGL init
    // don't compete with hero hydration / first paint (kills first-load jank).
    const hasRIC = typeof window.requestIdleCallback === "function";
    const handle: number = hasRIC
      ? window.requestIdleCallback(sync, { timeout: 800 })
      : window.setTimeout(sync, 300);

    mq.addEventListener("change", sync);
    return () => {
      if (hasRIC) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      mq.removeEventListener("change", sync);
    };
  }, [reduced]);

  if (reduced || !enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity }}
    >
      <Antigravity color="#2F7BFF" autoAnimate count={120} />
    </motion.div>
  );
}
