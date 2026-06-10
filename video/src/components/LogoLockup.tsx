import React from "react";
import { C } from "../theme";
import { riseIn, useEnter, useSpringAt } from "../lib/anim";
import { Icon } from "./primitives";

/** ArbiFlow logo lockup — same spring/sweep treatment as the demo bumper/outro. */
export const LogoLockup: React.FC<{
  at?: number;
  iconSize?: number;
  wordSize?: number;
  underline?: boolean;
}> = ({ at = 0, iconSize = 104, wordSize = 110, underline = true }) => {
  const logo = useSpringAt(at + 6, { stiffness: 120, damping: 14 });
  const word = useEnter(at + 18, 18);
  const sweep = useEnter(at + 42, 28);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: Math.round(iconSize * 0.24),
        transform: `scale(${0.8 + logo * 0.2})`,
        opacity: logo,
        filter: `blur(${(1 - logo) * 10}px)`,
      }}
    >
      <Icon
        src="brand/logomark-512.png"
        size={iconSize}
        round={false}
        style={{ background: "transparent", borderRadius: Math.round(iconSize * 0.25) }}
      />
      <div style={{ position: "relative" }}>
        <div
          style={{
            ...riseIn(word, 16),
            fontSize: wordSize,
            fontWeight: 600,
            letterSpacing: -3,
          }}
        >
          ArbiFlow
        </div>
        {underline ? (
          <div
            style={{
              position: "absolute",
              left: 4,
              bottom: -4,
              height: 6,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`,
              width: `${sweep * 100}%`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
