import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../theme";
import { SANS } from "../fonts";

/** Shared backdrop: near-black + blue/gold glow + faint masked grid. */
export const Stage: React.FC<React.PropsWithChildren<{ vignette?: boolean }>> = ({
  children,
  vignette = true,
}) => {
  return (
    <AbsoluteFill
      style={{ backgroundColor: C.bg, fontFamily: SANS, color: C.text }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(1300px 760px at 72% -12%, rgba(30,91,216,0.18), transparent 60%)," +
            "radial-gradient(1000px 620px at 8% 112%, rgba(244,181,63,0.08), transparent 55%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            `linear-gradient(${C.border} 1px, transparent 1px),` +
            `linear-gradient(90deg, ${C.border} 1px, transparent 1px)`,
          backgroundSize: "68px 68px",
          opacity: 0.1,
          maskImage: "radial-gradient(circle at 50% 42%, black, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 42%, black, transparent 78%)",
        }}
      />
      {vignette ? (
        <AbsoluteFill
          style={{
            boxShadow: "inset 0 0 320px 80px rgba(0,0,0,0.7)",
            pointerEvents: "none",
          }}
        />
      ) : null}
      {children}
    </AbsoluteFill>
  );
};
