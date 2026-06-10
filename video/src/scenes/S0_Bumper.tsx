import React from "react";
import { AbsoluteFill } from "remotion";
import { Stage } from "../components/Stage";
import { Ticker } from "../components/Ticker";
import { Icon } from "../components/primitives";
import { C } from "../theme";
import { MONO } from "../fonts";
import { riseIn, useEnter, useSpringAt } from "../lib/anim";

export const Bumper: React.FC = () => {
  const logo = useSpringAt(6, { stiffness: 120, damping: 14 });
  const word = useEnter(18, 18);
  const tag = useEnter(34, 20);
  const sub = useEnter(48, 18);
  const sweep = useEnter(42, 28);
  return (
    <Stage>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            position: "absolute",
            top: 90,
            left: 0,
            right: 0,
            opacity: 0.45,
            maskImage:
              "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <Ticker speed={1.3} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              transform: `scale(${0.8 + logo * 0.2})`,
              opacity: logo,
              filter: `blur(${(1 - logo) * 10}px)`,
            }}
          >
            <Icon
              src="brand/logomark-512.png"
              size={104}
              round={false}
              style={{ background: "transparent", borderRadius: 26 }}
            />
            <div style={{ position: "relative" }}>
              <div style={{ ...riseIn(word, 16), fontSize: 110, fontWeight: 600, letterSpacing: -3 }}>
                ArbiFlow
              </div>
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
            </div>
          </div>

          <div style={{ ...riseIn(tag, 18), fontSize: 48, fontWeight: 500 }}>
            Deploy idle capital into the best DeFi yield.
          </div>
          <div
            style={{
              ...riseIn(sub, 14),
              fontFamily: MONO,
              fontSize: 23,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: C.muted,
            }}
          >
            Arbitrum-native · 0–100 score · non-custodial
          </div>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
