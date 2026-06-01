"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  motion,
  motionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

type StackContextValue = {
  progress: MotionValue<number>;
  count: number;
  isDesktop: boolean;
};

// A stable default so StackCard can always read a real MotionValue (no null
// checks, no conditional hooks). Overridden by <Stack> in practice.
const StackContext = createContext<StackContextValue>({
  progress: motionValue(0),
  count: 1,
  isDesktop: false,
});

/**
 * Wraps the run of stacked sections. Owns one scroll-progress value for the
 * whole deck — each card derives its scale/dim from its slice of that progress.
 * A sticky card's own rect is frozen while pinned, so per-card coverage can't be
 * measured directly; the shared progress + index window is what drives the depth.
 */
export function Stack({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // The sticky-stacking is a large-screen flourish; below md the cards just flow
  // as normal glass panels (gated in CSS for layout, here in JS for the motion).
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <StackContext.Provider value={{ progress: scrollYProgress, count, isDesktop }}>
      <div ref={ref} className="relative">
        {children}
      </div>
    </StackContext.Provider>
  );
}

/**
 * One glass card. On md+ it pins (sticky) and recedes — scaling down and dimming
 * as the next card slides up to cover it. Below md, or under reduced motion, it
 * holds full size and just flows. The last card never recedes (nothing covers it).
 */
export function StackCard({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  const { progress, count, isDesktop } = useContext(StackContext);
  const reduced = useReducedMotion();

  const isLast = index === count - 1;
  // Keep every window within [0,1] — framer hands scroll-linked transforms to a
  // native ScrollTimeline whose offsets must be <= 1, so denom must be `count`.
  const denom = Math.max(1, count);
  const range: [number, number] = [index / denom, (index + 1) / denom];
  // Hold full size when motion is off (mobile / reduced) or for the final card.
  // Either way the value is 1 at progress 0, so SSR and the first client render
  // serialize the same style ("opacity:1;transform:none") — no hydration mismatch.
  const still = !isDesktop || reduced || isLast;
  const scale = useTransform(progress, range, [1, still ? 1 : 0.94]);
  const opacity = useTransform(progress, range, [1, still ? 1 : 0.5]);

  return (
    <div
      className={`relative px-4 pb-5 sm:px-6 md:pb-0${
        // The last card never gets covered, so it must not stay pinned — a sticky
        // last card with its raised z-index paints over the footer below the Stack.
        isLast ? "" : " md:sticky md:top-[var(--stack-top)]"
      }`}
      style={
        {
          "--stack-top": `calc(5.5rem + ${index * 0.25}rem)`,
          zIndex: index + 1,
        } as CSSProperties
      }
    >
      <motion.div
        style={{ scale, opacity }}
        className="origin-top mx-auto flex w-full max-w-6xl items-center overflow-hidden rounded-[2rem] border border-border bg-surface/90 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.85)] backdrop-blur-md md:min-h-[calc(100vh-8rem)]"
      >
        <div className="w-full">{children}</div>
      </motion.div>
    </div>
  );
}
