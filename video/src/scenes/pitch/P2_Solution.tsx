import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Stage } from "../../components/Stage";
import { Ticker } from "../../components/Ticker";
import { LogoLockup } from "../../components/LogoLockup";
import { LowerThird } from "../../components/LowerThird";
import { Dot, Icon, Panel, SectionLabel, Tag } from "../../components/primitives";
import { RankRow } from "../S3_Score";
import { C } from "../../theme";
import { MONO } from "../../fonts";
import { riseIn, useCountUp, useEnter, useInOut } from "../../lib/anim";
import { RANKED } from "../../data";

// VO: "ArbiFlow does that job in seconds." ends ≈ local 139 → cut sting at 144.
const STING_END = 144;

/** Beat 2 · VO 24.1–37.0 — logo sting → ranked board with the 78/100 top match. */
export const P2Solution: React.FC = () => (
  <Stage>
    <Sting />
    <Sequence from={STING_END}>
      <Board />
    </Sequence>
  </Stage>
);

const Sting: React.FC = () => {
  const o = useInOut(0, 1, STING_END - 16, 14);
  const tag = useEnter(36, 20);
  const sub = useEnter(50, 18);
  return (
    <AbsoluteFill style={{ opacity: o, justifyContent: "center", alignItems: "center" }}>
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
        <LogoLockup at={0} />
        <div style={{ ...riseIn(tag, 18), fontSize: 48, fontWeight: 500 }}>
          Does that job — in seconds.
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
          scan · score · deploy — one signature
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Board: React.FC = () => {
  const head = useEnter(4, 14);
  const live = useEnter(30, 12);
  const left = useEnter(16, 16);
  const right = useEnter(50, 16);
  const comp = useCountUp(95, 30, 0, 78);
  const why = useEnter(150, 14);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 96, left: 150, ...riseIn(head, 14) }}>
        <SectionLabel color={C.gold}>[02] · scan → score → deploy</SectionLabel>
        <div style={{ fontSize: 60, fontWeight: 600, letterSpacing: -2, marginTop: 12 }}>
          Every yield, ranked <span style={{ color: C.gold }}>in seconds</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 110,
          right: 150,
          display: "flex",
          alignItems: "center",
          gap: 12,
          ...riseIn(live, 10),
        }}
      >
        <Dot color={C.mint} />
        <Tag color={C.mint} border={`${C.mint}55`}>
          live · arbitrum mainnet
        </Tag>
      </div>

      <div style={{ position: "absolute", top: 250, left: 150, width: 700, ...riseIn(left, 18) }}>
        <Panel pad={28}>
          <SectionLabel style={{ marginBottom: 18 }}>ranked opportunities</SectionLabel>
          {RANKED.map((r, i) => (
            <RankRow key={r.label} r={r} at={22 + i * 10} />
          ))}
        </Panel>
      </div>

      <div style={{ position: "absolute", top: 250, left: 1010, width: 760, ...riseIn(right, 18) }}>
        <Panel pad={34}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
            <Icon src="protocols/aave-v3.png" size={44} />
            <div style={{ fontSize: 26, fontWeight: 600 }}>
              Aave v3 <span style={{ color: C.muted, fontWeight: 400 }}>/ USDC</span>
            </div>
            <span style={{ marginLeft: "auto" }}>
              <Tag color={C.gold} border={`${C.gold}55`}>
                top match
              </Tag>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, margin: "12px 0 8px" }}>
            <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 90, lineHeight: 0.85 }}>
              {comp.toFixed(0)}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 30, color: C.muted, marginBottom: 10 }}>
              / 100
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontFamily: MONO,
                fontSize: 22,
                color: C.mint,
                marginBottom: 14,
              }}
            >
              4.31% APY
            </span>
          </div>
          <div
            style={{
              ...riseIn(why, 14),
              fontSize: 21,
              color: C.mutedStrong,
              borderTop: `1px solid ${C.border}`,
              paddingTop: 18,
            }}
          >
            <span
              style={{
                color: C.muted,
                fontFamily: MONO,
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              why{" "}
            </span>
            Transparent 0–100 score — best risk-adjusted match for your idle USDC.
          </div>
        </Panel>
      </div>

      <LowerThird at={130} out={243}>
        Scans your wallet · ranks every yield 0–100 · deploys in one signature
      </LowerThird>
    </AbsoluteFill>
  );
};
