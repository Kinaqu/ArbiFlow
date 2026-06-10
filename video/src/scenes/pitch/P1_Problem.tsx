import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage } from "../../components/Stage";
import { Caption } from "../../components/Caption";
import { LowerThird } from "../../components/LowerThird";
import { Panel, SectionLabel } from "../../components/primitives";
import { C, GRAD } from "../../theme";
import { MONO } from "../../fonts";
import { riseIn, useCountUp, useEnter } from "../../lib/anim";
import { PROBLEM_STATS, WALLET } from "../../data";
import { num, shortAddr } from "../../lib/format";
import { cardLeft } from "../../layout";

/** Beat 1 · VO 0:00–23.9 — idle wallet earning 0% + the three problem stats. */
export const P1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const panel = useEnter(100, 16);
  const row = useEnter(118, 14);
  const note = useEnter(150, 14);
  // Slow gold pulse on the 0% badge — frame-driven (never CSS animations).
  const pulse = 0.5 + 0.5 * Math.sin(frame / 14);
  return (
    <Stage>
      <AbsoluteFill>
        <div style={{ position: "absolute", top: 150, left: 150, width: 940 }}>
          <Caption
            at={8}
            kicker="[01] · the problem"
            title={
              <>
                Most of your DeFi capital is{" "}
                <span style={{ color: C.muted }}>just sitting there.</span>
              </>
            }
            sub="Not because users are careless — comparing every protocol by hand is a full-time job."
            width={940}
            titleSize={72}
          />
        </div>

        {/* the idle wallet row */}
        <div
          style={{
            position: "absolute",
            top: 196,
            left: 1150,
            width: 620,
            ...riseIn(panel, 18),
          }}
        >
          <Panel pad={30}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <SectionLabel>wallet</SectionLabel>
              <span style={{ fontFamily: MONO, fontSize: 18, color: C.muted }}>
                {shortAddr(WALLET)}
              </span>
            </div>
            <div style={{ ...riseIn(row, 12), display: "flex", alignItems: "center", gap: 16 }}>
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
                  color: C.blueLight,
                  border: `1px solid ${C.blueLight}55`,
                  background: `${C.blueLight}14`,
                }}
              >
                USD
              </span>
              <span style={{ fontSize: 24, fontWeight: 600 }}>USDC</span>
              <span style={{ fontFamily: MONO, fontSize: 24, color: C.mutedStrong }}>
                {num(1840.1)}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: MONO,
                  fontWeight: 600,
                  fontSize: 24,
                  color: C.gold,
                  border: `1px solid ${C.gold}66`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  boxShadow: `0 0 ${14 + pulse * 18}px rgba(244,181,63,${0.12 + pulse * 0.22})`,
                }}
              >
                0% APY
              </span>
            </div>
            <div style={{ ...riseIn(note, 10), marginTop: 16, fontSize: 19, color: C.muted }}>
              Parked in your wallet — earning nothing.
            </div>
          </Panel>
        </div>

        {PROBLEM_STATS.map((s, i) => (
          <StatCard key={s.v} stat={s} i={i} />
        ))}

        <LowerThird at={450} out={690}>
          Comparing 500+ pools by hand is a full-time job.
        </LowerThird>
      </AbsoluteFill>
    </Stage>
  );
};

const StatCard: React.FC<{ stat: (typeof PROBLEM_STATS)[number]; i: number }> = ({
  stat,
  i,
}) => {
  const p = useEnter(280 + i * 32, 16);
  const n = useCountUp(280, 26, 0, 500);
  const value = i === 0 ? `${n.toFixed(0)}+` : stat.v;
  return (
    <div
      style={{
        position: "absolute",
        top: 620,
        left: cardLeft(i),
        width: 384,
        ...riseIn(p, 18),
      }}
    >
      <Panel pad={30}>
        <div
          style={{
            fontFamily: MONO,
            fontWeight: 600,
            fontSize: 58,
            letterSpacing: -1,
            background: GRAD.gold,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {value}
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 19,
            lineHeight: 1.4,
            color: C.mutedStrong,
            minHeight: 80,
          }}
        >
          {stat.l}
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: MONO,
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: C.muted,
            minHeight: 15,
          }}
        >
          {stat.src}
        </div>
      </Panel>
    </div>
  );
};
