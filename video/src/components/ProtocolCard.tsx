import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, GRAD } from "../theme";
import { MONO } from "../fonts";
import { clamp, riseIn, useEnter } from "../lib/anim";
import { Button } from "./primitives";

type Mini = { label: string; val: number; max: number };
type Proto = { label: string; mono: string; color: string };

/** Allow-list card mirroring components/app/testnet/allocation-board.tsx. */
export const ProtocolCard: React.FC<{
  p: Proto;
  score: number;
  factors: Mini[];
  at: number;
  approveAt?: number;
  leaderAt?: number;
  holding?: boolean;
  width?: number;
}> = ({ p, score, factors, at, approveAt, leaderAt, holding = false, width = 384 }) => {
  const frame = useCurrentFrame();
  const e = useEnter(at, 16);
  const leader = useEnter(leaderAt ?? 1e9, 8);
  const approved = approveAt != null && frame >= approveAt;
  const pop =
    approveAt != null
      ? interpolate(frame, [approveAt, approveAt + 6, approveAt + 14], [0.9, 1.08, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  return (
    <div
      style={{
        ...riseIn(e, 18),
        position: "relative",
        width,
        borderRadius: 18,
        padding: 24,
        background: holding ? "rgba(244,181,63,0.06)" : C.panel,
        border: `1px solid ${holding ? C.gold + "99" : C.border}`,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -14,
          left: 20,
          opacity: leader,
          transform: `translateY(${(1 - leader) * 6}px)`,
          fontFamily: MONO,
          fontSize: 13,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: C.gold,
          background: C.panel,
          border: `1px solid ${C.gold}66`,
          borderRadius: 999,
          padding: "3px 12px",
        }}
      >
        leader
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          style={{
            width: 48,
            height: 48,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            fontFamily: MONO,
            fontWeight: 600,
            fontSize: 22,
            color: p.color,
            border: `1px solid ${p.color}66`,
            background: `${p.color}1a`,
          }}
        >
          {p.mono}
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.1 }}>{p.label}</div>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.muted,
              border: `1px solid ${C.border}`,
              borderRadius: 5,
              padding: "2px 7px",
            }}
          >
            demo · unofficial
          </span>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 30, lineHeight: 1 }}>
            {score.toFixed(1)}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.muted,
            }}
          >
            score
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "11px 18px" }}>
        {factors.map((f) => {
          const ratio = clamp(f.val / f.max);
          return (
            <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: MONO,
                  fontSize: 13,
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                <span>{f.label}</span>
                <span style={{ color: C.mutedStrong }}>{f.val}</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: C.border, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 999, background: p.color, width: `${ratio * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingTop: 4,
          minHeight: 44,
        }}
      >
        <div style={{ transform: `scale(${pop})` }}>
          {approved ? (
            <Button variant="approved">✓ Approved</Button>
          ) : (
            <Button variant="primary">Approve</Button>
          )}
        </div>
      </div>
    </div>
  );
};

/** Gold funds token that springs between protocol cards (the money shot). */
export const FundsChip: React.FC<{
  amount: string;
  style?: React.CSSProperties;
  scale?: number;
}> = ({ amount, style, scale = 1 }) => (
  <div
    style={{
      position: "absolute",
      display: "inline-flex",
      alignItems: "center",
      gap: 11,
      padding: "11px 20px",
      borderRadius: 999,
      background: "rgba(244,181,63,0.16)",
      border: `1px solid ${C.gold}`,
      color: C.gold,
      fontFamily: MONO,
      fontWeight: 600,
      fontSize: 27,
      whiteSpace: "nowrap",
      boxShadow: "0 14px 36px rgba(244,181,63,0.4)",
      transform: `scale(${scale})`,
      zIndex: 40,
      ...style,
    }}
  >
    <span style={{ width: 19, height: 19, borderRadius: 999, background: GRAD.gold, display: "inline-block" }} />
    ${amount}
  </div>
);
