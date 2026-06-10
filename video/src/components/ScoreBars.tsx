import React from "react";
import { C } from "../theme";
import { MONO } from "../fonts";
import { clamp, useCountUp, useEnter } from "../lib/anim";

export type Factor = { key?: string; label: string; val: number; max: number };

/** Stacked composite-score factor bars that fill in sequence. */
export const ScoreBars: React.FC<{
  at: number;
  factors: readonly Factor[];
  stagger?: number;
  barColor?: string;
  width?: number;
}> = ({ at, factors, stagger = 7, barColor = C.mint, width = 600 }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width }}>
      {factors.map((f, i) => (
        <BarRow key={f.label} f={f} at={at + i * stagger} color={barColor} />
      ))}
    </div>
  );
};

const BarRow: React.FC<{ f: Factor; at: number; color: string }> = ({
  f,
  at,
  color,
}) => {
  const fill = useEnter(at, 18);
  const val = useCountUp(at, 18, 0, f.val);
  const ratio = clamp(f.val / f.max);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: MONO,
          fontSize: 19,
          color: C.muted,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        <span>{f.label}</span>
        <span style={{ color: C.mutedStrong }}>
          {val.toFixed(0)} <span style={{ color: C.muted }}>/ {f.max}</span>
        </span>
      </div>
      <div
        style={{
          height: 11,
          borderRadius: 999,
          background: C.border,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 999,
            background: color,
            width: `${fill * ratio * 100}%`,
          }}
        />
      </div>
    </div>
  );
};
