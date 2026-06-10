import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "../theme";
import { MONO } from "../fonts";
import { TICKER } from "../data";
import { Icon } from "./primitives";

const ITEM_W = 360;
const TOTAL = TICKER.length * ITEM_W;

/** Seamless horizontal marquee of Arbitrum pools (like the hero top bar). */
export const Ticker: React.FC<{ speed?: number; opacity?: number }> = ({
  speed = 1.4,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const x = -((frame * speed) % TOTAL);
  const row = [...TICKER, ...TICKER];
  return (
    <div style={{ width: "100%", overflow: "hidden", opacity }}>
      <div style={{ display: "flex", transform: `translateX(${x}px)`, width: TOTAL * 2 }}>
        {row.map((t, i) => {
          const pos = t.up;
          return (
            <div
              key={i}
              style={{
                width: ITEM_W,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 28px",
                borderRight: `1px solid ${C.border}`,
                boxSizing: "border-box",
              }}
            >
              <Icon src={`protocols/${t.icon}`} size={34} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 19, fontWeight: 600 }}>{t.label}</span>
                <span style={{ fontFamily: MONO, fontSize: 13, color: C.muted }}>
                  {t.sym}
                </span>
              </div>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: MONO,
                  fontSize: 20,
                  fontWeight: 600,
                  color: pos ? C.mint : C.gold,
                }}
              >
                {t.apy.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
