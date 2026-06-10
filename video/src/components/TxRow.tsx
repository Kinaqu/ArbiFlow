import React from "react";
import { C } from "../theme";
import { MONO } from "../fonts";
import { riseIn, useEnter } from "../lib/anim";
import { shortHash } from "../lib/format";

/** One on-chain activity line: status dot + label + mono tx hash + ↗. */
export const TxRow: React.FC<{
  at: number;
  label: React.ReactNode;
  hash: string;
  last?: boolean;
}> = ({ at, label, hash, last = false }) => {
  const p = useEnter(at, 12);
  return (
    <div
      style={{
        ...riseIn(p, 14),
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "16px 0",
        borderBottom: last ? "none" : `1px solid ${C.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 999,
            background: C.mint,
            boxShadow: `0 0 10px ${C.mint}`,
          }}
        />
        <span style={{ fontSize: 23, color: C.text }}>{label}</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: MONO,
          fontSize: 19,
          color: C.blueLight,
        }}
      >
        {shortHash(hash)}
        <span style={{ color: C.muted }}>↗</span>
      </div>
    </div>
  );
};
