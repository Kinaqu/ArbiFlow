import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Stage } from "../../components/Stage";
import { Caption } from "../../components/Caption";
import { LogoLockup } from "../../components/LogoLockup";
import { Panel, SectionLabel } from "../../components/primitives";
import { C } from "../../theme";
import { MONO } from "../../fonts";
import { riseIn, useEnter, useInOut, useSpringAt } from "../../lib/anim";
import { ROADMAP, SITE } from "../../data";
import { cardLeft, CARD_W, CARDS_X0, CARDS_W } from "../../layout";

// VO: "ArbiFlow." lands ≈ local 260 — cut from roadmap to the CTA there.
const OUTRO_FROM = 260;

/** Beat 6 · VO 107.6–128.8 — today → testnet → future, then logo + CTA. */
export const P6Vision: React.FC = () => (
  <Stage>
    <Sequence durationInFrames={OUTRO_FROM}>
      <Roadmap />
    </Sequence>
    <Sequence from={OUTRO_FROM}>
      <Cta />
    </Sequence>
  </Stage>
);

const Roadmap: React.FC = () => {
  const o = useInOut(0, 1, OUTRO_FROM - 16, 14);
  const line = useEnter(36, 70);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", top: 130, left: 360, width: 1200 }}>
        <Caption
          at={6}
          align="center"
          kicker="[06] · vision"
          title={
            <>
              Today, smarter yield.{" "}
              <span style={{ color: C.muted }}>Tomorrow, DeFi autopilot.</span>
            </>
          }
          width={1200}
          titleSize={56}
        />
      </div>

      {/* connector line draws left → right */}
      <div style={{ position: "absolute", top: 470, left: CARDS_X0, width: CARDS_W, height: 3 }}>
        <div
          style={{
            height: "100%",
            width: `${line * 100}%`,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${C.mint}, ${C.gold}, ${C.blueLight})`,
            opacity: 0.7,
          }}
        />
      </div>

      {ROADMAP.map((n, i) => (
        <RoadNode key={n.title} n={n} i={i} />
      ))}
    </AbsoluteFill>
  );
};

const RoadNode: React.FC<{ n: (typeof ROADMAP)[number]; i: number }> = ({ n, i }) => {
  const s = useSpringAt(28 + i * 52, { stiffness: 150, damping: 18 });
  return (
    <div
      style={{
        position: "absolute",
        top: 462,
        left: cardLeft(i),
        width: CARD_W,
        opacity: s,
        transform: `translateY(${(1 - s) * 22}px)`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span
          style={{
            width: 17,
            height: 17,
            borderRadius: 999,
            background: n.color,
            boxShadow: `0 0 18px ${n.color}`,
            marginBottom: 22,
          }}
        />
        <Panel pad={26} style={{ width: "100%", boxSizing: "border-box" }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: n.color,
            }}
          >
            {n.when}
          </div>
          <div style={{ fontSize: 25, fontWeight: 600, marginTop: 10 }}>{n.title}</div>
          <div style={{ fontSize: 18, color: C.muted, marginTop: 8, lineHeight: 1.45 }}>
            {n.sub}
          </div>
        </Panel>
      </div>
    </div>
  );
};

const Cta: React.FC = () => {
  const kick = useEnter(14, 12);
  const tag = useEnter(36, 16);
  const url = useEnter(220, 16); // VO: "Try it now at arbiflow-one…"
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 330,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
        }}
      >
        <div style={riseIn(kick, 10)}>
          <SectionLabel color={C.mint}>● live on mainnet · proven on testnet</SectionLabel>
        </div>
        <LogoLockup at={2} iconSize={88} wordSize={92} />
        <div style={{ ...riseIn(tag, 14), fontSize: 32, color: C.mutedStrong }}>
          Deploy idle capital into the best DeFi yield.
        </div>
        <div
          style={{
            ...riseIn(url, 14),
            fontFamily: MONO,
            fontSize: 30,
            fontWeight: 600,
            color: "#fff",
            background: `linear-gradient(90deg, ${C.blue}, ${C.blueLight})`,
            padding: "14px 30px",
            borderRadius: 14,
            boxShadow: "0 16px 40px rgba(30,91,216,0.5)",
          }}
        >
          {SITE}
        </div>
      </div>
    </AbsoluteFill>
  );
};
