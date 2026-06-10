import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Caption } from "../components/Caption";
import { Panel, SectionLabel } from "../components/primitives";
import { C } from "../theme";
import { MONO } from "../fonts";
import { EASE, riseIn, useCountUp, useEnter } from "../lib/anim";
import { BALANCES, IDLE_TOTAL, WALLET } from "../data";
import { num, shortAddr, usd2 } from "../lib/format";

const TONE: Record<string, string> = {
  USDC: C.blueLight,
  ETH: C.mutedStrong,
  ARB: "#7AA0FF",
};

export const Scan: React.FC = () => {
  const frame = useCurrentFrame();
  const panel = useEnter(14, 16);
  const scan = interpolate(frame, [16, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const idle = useCountUp(60, 26, 0, IDLE_TOTAL);
  const idleReveal = useEnter(60, 16);
  return (
    <Stage>
      <AbsoluteFill>
        <div style={{ position: "absolute", top: 300, left: 150, width: 760 }}>
          <Caption
            at={6}
            kicker="[02] · scanning wallet"
            title={
              <>
                Scanning your <span style={{ color: C.gold }}>assets</span>
              </>
            }
            sub="ArbiFlow reads your balances on-chain and flags the capital sitting idle — earning nothing."
            width={760}
          />
        </div>

        <div style={{ position: "absolute", top: 170, left: 1010, width: 760 }}>
          <div style={riseIn(panel, 18)}>
            <Panel pad={34}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 22,
                }}
              >
                <SectionLabel>wallet</SectionLabel>
                <span style={{ fontFamily: MONO, fontSize: 18, color: C.muted }}>
                  {shortAddr(WALLET)}
                </span>
              </div>

              <div style={{ position: "relative", overflow: "hidden" }}>
                {BALANCES.map((b, i) => (
                  <TokenRow key={b.sym} sym={b.sym} amount={b.amount} idle={b.idle} at={24 + i * 9} />
                ))}
                <div
                  style={{
                    position: "absolute",
                    left: -10,
                    right: -10,
                    top: `${scan * 100}%`,
                    height: 3,
                    background: `linear-gradient(90deg, transparent, ${C.blueLight}, transparent)`,
                    opacity: scan > 0 && scan < 1 ? 0.9 : 0,
                    boxShadow: `0 0 18px ${C.blueLight}`,
                  }}
                />
              </div>

              <div style={{ height: 1, background: C.border, margin: "24px 0" }} />

              <div style={riseIn(idleReveal, 14)}>
                <SectionLabel color={C.gold}>idle capital detected</SectionLabel>
                <div
                  style={{
                    fontFamily: MONO,
                    fontWeight: 600,
                    fontSize: 66,
                    color: C.gold,
                    letterSpacing: -1,
                    marginTop: 8,
                  }}
                >
                  ${usd2(idle)}
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

const TokenRow: React.FC<{ sym: string; amount: number; idle: boolean; at: number }> = ({
  sym,
  amount,
  idle,
  at,
}) => {
  const p = useEnter(at, 14);
  const tone = TONE[sym] ?? C.text;
  return (
    <div style={{ ...riseIn(p, 12), display: "flex", alignItems: "center", gap: 16, padding: "13px 0" }}>
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          fontFamily: MONO,
          fontWeight: 600,
          fontSize: 15,
          color: tone,
          border: `1px solid ${tone}55`,
          background: `${tone}14`,
        }}
      >
        {sym.slice(0, 3)}
      </span>
      <span style={{ fontSize: 24, fontWeight: 600 }}>{sym}</span>
      {idle ? (
        <span
          style={{
            fontFamily: MONO,
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: C.gold,
            border: `1px solid ${C.gold}55`,
            borderRadius: 5,
            padding: "2px 8px",
          }}
        >
          idle
        </span>
      ) : null}
      <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 26, color: C.mutedStrong }}>
        {num(amount, sym === "ETH" ? 3 : 2)}
      </span>
    </div>
  );
};
