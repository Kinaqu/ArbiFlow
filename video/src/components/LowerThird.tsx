import React from "react";
import { C } from "../theme";
import { MONO, SANS } from "../fonts";
import { useInOut } from "../lib/anim";

/** Burned-in caption strip (PITCH.md lower-thirds) — readable with sound off. */
export const LowerThird: React.FC<
  React.PropsWithChildren<{ at: number; out?: number; mono?: boolean }>
> = ({ children, at, out, mono = false }) => {
  const o = useInOut(at, 12, out ?? 1e9, 12);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 56,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: o,
        transform: `translateY(${(1 - o) * 14}px)`,
        zIndex: 80,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          background: "rgba(7,8,11,0.82)",
          border: `1px solid ${C.border}`,
          borderRadius: 999,
          padding: "13px 30px",
          fontFamily: mono ? MONO : SANS,
          fontSize: mono ? 20 : 23,
          letterSpacing: mono ? 1 : 0,
          color: mono ? C.blueLight : C.mutedStrong,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 2,
            background: C.gold,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        {children}
      </div>
    </div>
  );
};
