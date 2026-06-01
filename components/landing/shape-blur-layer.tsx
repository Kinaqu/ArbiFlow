"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// three can't be server-rendered — load the ShapeBlur canvas client-only.
const ShapeBlur = dynamic(() => import("./shape-blur"), { ssr: false });

/**
 * Gated wrapper around <ShapeBlur> — same guard as AntigravityField: off for
 * reduced-motion and below md (skip the second WebGL loop on phones), and the
 * mount is deferred to idle so the three.js init doesn't fight first paint.
 * ShapeBlur itself self-pauses its rAF whenever it scrolls out of view.
 */
export function ShapeBlurLayer({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setEnabled(mq.matches);

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
    <div className={className} aria-hidden>
      <ShapeBlur
        variation={0}
        shapeSize={1.1}
        roundness={0.5}
        borderSize={0.05}
        circleSize={0.4}
        circleEdge={0.8}
      />
    </div>
  );
}
