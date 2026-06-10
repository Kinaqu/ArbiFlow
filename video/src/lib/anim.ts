import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Shared easings. EASE = soft easeOut for entrances; EASE_IO for symmetric moves.
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);

export const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

/** 0→1 eased progress across [startF, startF+durF]. */
export function useEnter(startF: number, durF = 16): number {
  const frame = useCurrentFrame();
  return interpolate(frame, [startF, startF + durF], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
}

/** Enter → hold → exit envelope, returns opacity 0→1→1→0. */
export function useInOut(
  inAt: number,
  inDur: number,
  outAt: number,
  outDur = 12,
): number {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [inAt, inAt + inDur, outAt, outAt + outDur],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE },
  );
}

type Cfg = Partial<{ stiffness: number; damping: number; mass: number }>;

/** Spring 0→1 starting at startF (matches the app board feel). */
export function useSpringAt(startF: number, config: Cfg = {}): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - startF,
    fps,
    config: { stiffness: 200, damping: 24, mass: 1, ...config },
  });
}

/** Number tween from→to across [startF, startF+durF]. */
export function useCountUp(
  startF: number,
  durF: number,
  from: number,
  to: number,
): number {
  const frame = useCurrentFrame();
  return interpolate(frame, [startF, startF + durF], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
}

/** Fade + slight rise; spread into a style object. */
export function riseIn(progress: number, dy = 18): React.CSSProperties {
  return {
    opacity: clamp(progress),
    transform: `translateY(${(1 - clamp(progress)) * dy}px)`,
  };
}
