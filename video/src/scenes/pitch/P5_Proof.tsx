import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Stage } from "../../components/Stage";
import { Caption } from "../../components/Caption";
import { LowerThird } from "../../components/LowerThird";
import { Dot, Panel, SectionLabel, Tag } from "../../components/primitives";
import { C } from "../../theme";
import { MONO } from "../../fonts";
import { riseIn, useEnter } from "../../lib/anim";
import {
  AAVE_V3_POOL,
  ARBISCAN_ROWS,
  FORGE_CMD,
  FORGE_LINES,
  TX,
  VAULT,
  WHATS_REAL,
} from "../../data";
import { shortAddr, shortHash } from "../../lib/format";
import { cardLeft, CARDS_X0, CARDS_W } from "../../layout";

const PH_A = 175; // what's-real cards
const PH_B = 405; // stylized Arbiscan (VO dwells here)
const PH_C_FROM = PH_A + PH_B; // 580 — forge terminal

/** Beat 5 · VO 79.5–106.1 — what's real → live vault on Arbiscan → fork test. */
export const P5Proof: React.FC = () => (
  <Stage>
    <Sequence durationInFrames={PH_A}>
      <RealCards />
    </Sequence>
    <Sequence from={PH_A} durationInFrames={PH_B}>
      <Arbiscan />
    </Sequence>
    <Sequence from={PH_C_FROM}>
      <Forge />
    </Sequence>
  </Stage>
);

const RealCards: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", top: 110, left: 360, width: 1200 }}>
      <Caption
        at={6}
        align="center"
        kicker="[05] · proof — what's real"
        title={
          <>
            Not a mockup. <span style={{ color: C.muted }}>It's already on-chain.</span>
          </>
        }
        width={1200}
        titleSize={64}
      />
    </div>
    {WHATS_REAL.map((c, i) => (
      <RealCard key={c.title} c={c} i={i} />
    ))}
  </AbsoluteFill>
);

const RealCard: React.FC<{ c: (typeof WHATS_REAL)[number]; i: number }> = ({ c, i }) => {
  const p = useEnter(44 + i * 14, 16);
  return (
    <div
      style={{
        position: "absolute",
        top: 400,
        left: cardLeft(i),
        width: 384,
        ...riseIn(p, 18),
      }}
    >
      <Panel pad={28} style={{ minHeight: 330, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Dot color={c.color} size={9} />
          <Tag color={c.color} border={`${c.color}55`}>
            {c.badge}
          </Tag>
        </div>
        <div style={{ fontSize: 25, fontWeight: 600, lineHeight: 1.2 }}>{c.title}</div>
        <div style={{ fontSize: 18, lineHeight: 1.5, color: C.muted, flex: 1 }}>{c.body}</div>
        <div style={{ fontFamily: MONO, fontSize: 14, color: C.mutedStrong }}>{c.foot}</div>
      </Panel>
    </div>
  );
};

// The "watch it live, right now" row that lands mid-phrase.
const LIVE_ROW = {
  method: "Rebalance",
  hash: TX.withdraw,
  block: "145208969",
  age: "just now",
} as const;

const GRID = "330px 200px 1fr 190px";

const Arbiscan: React.FC = () => {
  const panel = useEnter(6, 16);
  const note = useEnter(130, 14);
  const grow = useEnter(350, 14); // live row slides the table down
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 170,
          left: CARDS_X0,
          width: CARDS_W,
          ...riseIn(panel, 18),
        }}
      >
        <Panel pad={0} style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "22px 30px",
              borderBottom: `1px solid ${C.border}`,
              background: C.panel,
            }}
          >
            <Dot color={C.mint} size={10} />
            <span style={{ fontFamily: MONO, fontSize: 20, color: C.mutedStrong }}>
              sepolia.arbiscan.io <span style={{ color: C.muted }}>/ address /</span>{" "}
              {shortAddr(VAULT)}
            </span>
            <span style={{ marginLeft: "auto" }}>
              <Tag color={C.gold} border={`${C.gold}55`}>
                stylized view · real tx hashes
              </Tag>
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              gap: 18,
              padding: "16px 30px",
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.muted,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <span>txn hash</span>
            <span>method</span>
            <span>block</span>
            <span style={{ textAlign: "right" }}>age</span>
          </div>

          {/* live row grows in on "…right now" */}
          <div style={{ height: grow * 62, opacity: grow, overflow: "hidden" }}>
            <ExplorerRow r={LIVE_ROW} live />
          </div>

          {ARBISCAN_ROWS.map((r, i) => (
            <FadedRow key={r.hash} r={r} i={i} />
          ))}
        </Panel>
      </div>

      <div
        style={{
          position: "absolute",
          top: 640,
          left: 360,
          width: 1200,
          textAlign: "center",
          ...riseIn(note, 14),
          fontSize: 25,
          color: C.mutedStrong,
        }}
      >
        A public demo vault — one guarded rebalance every ~35 seconds.
      </div>

      <LowerThird mono at={60} out={385}>
        vault {shortAddr(VAULT)} · sepolia.arbiscan.io
      </LowerThird>
    </AbsoluteFill>
  );
};

const FadedRow: React.FC<{ r: (typeof ARBISCAN_ROWS)[number]; i: number }> = ({ r, i }) => {
  const p = useEnter(30 + i * 22, 12);
  return (
    <div style={riseIn(p, 8)}>
      <ExplorerRow r={r} last={i === ARBISCAN_ROWS.length - 1} />
    </div>
  );
};

const ExplorerRow: React.FC<{
  r: { method: string; hash: string; block: string; age: string };
  live?: boolean;
  last?: boolean;
}> = ({ r, live = false, last = false }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: GRID,
      gap: 18,
      alignItems: "center",
      height: 62,
      padding: "0 30px",
      borderBottom: last ? "none" : `1px solid ${C.border}`,
      background: live ? "rgba(244,181,63,0.06)" : "transparent",
      boxSizing: "border-box",
    }}
  >
    <span style={{ fontFamily: MONO, fontSize: 19, color: C.blueLight }}>
      {shortHash(r.hash)}
    </span>
    <span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 13,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: r.method === "Rebalance" ? C.mint : C.blueLight,
          border: `1px solid ${(r.method === "Rebalance" ? C.mint : C.blueLight) + "55"}`,
          borderRadius: 6,
          padding: "3px 10px",
        }}
      >
        {r.method}
      </span>
    </span>
    <span style={{ fontFamily: MONO, fontSize: 18, color: C.muted }}>{r.block}</span>
    <span
      style={{
        fontFamily: MONO,
        fontSize: 18,
        color: live ? C.gold : C.mutedStrong,
        textAlign: "right",
      }}
    >
      {r.age}
    </span>
  </div>
);

const Forge: React.FC = () => {
  const frame = useCurrentFrame();
  const panel = useEnter(4, 14);
  const punch = useEnter(175, 16);
  const typed = Math.max(0, Math.min(FORGE_CMD.length, Math.floor((frame - 10) * 0.9)));
  const typing = frame >= 10 && typed < FORGE_CMD.length;
  const caret = Math.floor(frame / 10) % 2 === 0;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 230,
          left: CARDS_X0,
          width: CARDS_W,
          ...riseIn(panel, 16),
        }}
      >
        <Panel pad={0} style={{ background: "#0A0C11", overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 24px",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <span style={{ width: 12, height: 12, borderRadius: 999, background: C.rose }} />
            <span style={{ width: 12, height: 12, borderRadius: 999, background: C.gold }} />
            <span style={{ width: 12, height: 12, borderRadius: 999, background: C.mint }} />
            <span
              style={{
                marginLeft: 14,
                fontFamily: MONO,
                fontSize: 15,
                color: C.muted,
                letterSpacing: 1,
              }}
            >
              contracts — foundry
            </span>
          </div>
          <div
            style={{
              padding: "26px 30px 30px",
              fontFamily: MONO,
              fontSize: 21,
              lineHeight: 1.75,
              whiteSpace: "pre-wrap",
              fontVariantLigatures: "none",
            }}
          >
            <div>
              <span style={{ color: C.mint }}>➜</span>{" "}
              <span style={{ color: C.blueLight }}>contracts</span>{" "}
              <span style={{ color: C.text }}>{FORGE_CMD.slice(0, typed)}</span>
              {typing && caret ? (
                <span
                  style={{
                    display: "inline-block",
                    width: 11,
                    height: 22,
                    background: C.mutedStrong,
                    verticalAlign: -3,
                  }}
                />
              ) : null}
            </div>
            {FORGE_LINES.map((l, i) => (
              <ForgeLine key={l.text} text={l.text} mint={l.tone === "mint"} at={88 + i * 16} />
            ))}
          </div>
        </Panel>
      </div>

      <div
        style={{
          position: "absolute",
          top: 740,
          left: 360,
          width: 1200,
          textAlign: "center",
          ...riseIn(punch, 18),
        }}
      >
        <div style={{ fontSize: 38, fontWeight: 600, letterSpacing: -1 }}>
          The hard part is <span style={{ color: C.gold }}>already on-chain.</span>
        </div>
      </div>

      <LowerThird mono at={30} out={240}>
        Aave V3 {shortAddr(AAVE_V3_POOL)} · test/RebalanceForkAave.t.sol ✓
      </LowerThird>
    </AbsoluteFill>
  );
};

const ForgeLine: React.FC<{ text: string; mint: boolean; at: number }> = ({
  text,
  mint,
  at,
}) => {
  const p = useEnter(at, 10);
  return <div style={{ ...riseIn(p, 8), color: mint ? C.mint : C.muted }}>{text}</div>;
};
