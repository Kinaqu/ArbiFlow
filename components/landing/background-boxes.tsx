"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Shrunk + recolored adaptation of the Aceternity "Background Boxes" (the
// original renders 150x100 = 15k motion divs — far too heavy for a footer that
// ships on every page). ~200 cells, desktop-only, reduced-motion-gated.
const ROWS = 30;
const COLS = 14;

// Brand-blue hover tints, chosen deterministically by cell index (no
// Math.random → no hydration mismatch). Both are accent shades, so the flash
// stays monochrome and on-brand.
const HOVER = ["rgba(47, 123, 255, 0.30)", "rgba(74, 143, 255, 0.20)"];

// Fade the grid to a subtle texture, concentrated toward the lower band so the
// link columns stay readable.
const MASK =
  "radial-gradient(ellipse 100% 125% at 50% 50%, #000 0%, #000 30%, transparent 78%)";

function BoxesCore({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div
      aria-hidden
      className={cn("overflow-hidden", className)}
      style={{ maskImage: MASK, WebkitMaskImage: MASK }}
    >
      <div
        style={{
          transform:
            "translate(-50%,-50%) skewX(-48deg) skewY(14deg) scale(0.85) translateZ(0)",
        }}
        className="absolute left-1/2 top-1/2 flex opacity-50"
      >
        {Array.from({ length: ROWS }).map((_, i) => (
          <div
            key={`row-${i}`}
            className="relative h-8 w-16 border-l border-[#1E222C]"
          >
            {Array.from({ length: COLS }).map((_, j) => (
              <motion.div
                key={`col-${j}`}
                whileHover={{
                  backgroundColor: HOVER[(i + j) % 2],
                  transition: { duration: 0 },
                }}
                animate={{ transition: { duration: 2 } }}
                className="relative h-8 w-16 border-r border-t border-[#1E222C]"
              >
                {j % 2 === 0 && i % 2 === 0 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="pointer-events-none absolute -left-[22px] -top-[14px] h-6 w-10 stroke-[1px] text-[#2A2F3C]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m6-6H6"
                    />
                  </svg>
                ) : null}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export const BackgroundBoxes = React.memo(BoxesCore);
