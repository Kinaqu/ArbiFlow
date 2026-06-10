import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Panel, SectionLabel } from "../components/primitives";
import { ProtocolCard, FundsChip } from "../components/ProtocolCard";
import { TxRow } from "../components/TxRow";
import { C } from "../theme";
import { MONO } from "../fonts";
import { clamp, riseIn, useEnter } from "../lib/anim";
import { DEMO_PROTOCOLS, TX } from "../data";
import { cardLeft, CARDS_X0, CARDS_W } from "../layout";

const CT = 214; // cards top
const smooth = (t: number) => t * t * (3 - 2 * t);

// Funds journey: Compound(1) → Morpho(2) @150 → Aave(0) @300.
const MOVES = [
  { atF: 150, to: 2 },
  { atF: 300, to: 0 },
];
const INITIAL = 1;
const anchorX = (i: number) => cardLeft(i) + 28;
const ANCHOR_Y = CT + 198;

const jitter = (frame: number, off: number) => 0.3 * Math.sin(frame / 9 + off);

export const Rebalance: React.FC = () => {
  const frame = useCurrentFrame();

  // Live (jittery) scores; Aave overtakes Morpho near frame 280.
  const sAave =
    74.0 + (frame < 260 ? 0 : smooth(clamp((frame - 260) / 40)) * 5.2) + jitter(frame, 0);
  const sCompound = 68.9 + jitter(frame, 2);
  const sMorpho = 77.1 - (frame < 300 ? 0 : smooth(clamp((frame - 300) / 50)) * 1.1) + jitter(frame, 4);
  const scores = [sAave, sCompound, sMorpho];

  // Funds position (lerp chain + arc).
  let x = anchorX(INITIAL);
  let arc = 0;
  MOVES.forEach((m) => {
    const t = smooth(clamp((frame - m.atF) / 26));
    x = x + (anchorX(m.to) - x) * t;
    if (t > 0 && t < 1) arc = -Math.sin(t * Math.PI) * 92;
  });
  const y = ANCHOR_Y + arc;

  let holdingIdx = INITIAL;
  MOVES.forEach((m) => {
    if (frame >= m.atF + 13) holdingIdx = m.to;
  });

  // Leader badge slides from Morpho to Aave at the crossover.
  const lt = smooth(clamp((frame - 288) / 12));
  const leaderLeft = cardLeft(2) + (cardLeft(0) - cardLeft(2)) * lt;

  const showCountdown = frame < 322;
  const N = Math.max(0, 35 - Math.floor(((frame % 150) / 150) * 35));

  const status =
    frame < 150
      ? "Evaluating your approved protocols every ~35s…"
      : frame < 300
        ? "ArbiFlow moved your funds into Morpho."
        : "ArbiFlow moved your funds into Aave — your best approved score.";
  const why =
    frame < 300
      ? "Highest risk-adjusted score across your allow-list."
      : "Aave overtook on a value-preserving move — funds follow the score.";

  const head = useEnter(4, 12);
  const log = useEnter(70, 16);

  return (
    <Stage>
      <AbsoluteFill>
        {/* header: status + countdown */}
        <div style={{ position: "absolute", top: 66, left: CARDS_X0, width: CARDS_W, ...riseIn(head, 10) }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
            <div>
              <SectionLabel>03 · allow-list · auto-rebalance</SectionLabel>
              <div style={{ fontSize: 30, fontWeight: 600, marginTop: 10 }}>{status}</div>
              <div style={{ fontSize: 19, color: C.muted, marginTop: 6 }}>Why: {why}</div>
            </div>
            <div style={{ textAlign: "right", minWidth: 200 }}>
              {showCountdown ? (
                <>
                  <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 52, color: C.gold, lineHeight: 1 }}>
                    {N}s
                  </div>
                  <SectionLabel style={{ marginTop: 6 }}>next decision</SectionLabel>
                </>
              ) : (
                <SectionLabel color={C.mint}>● holding</SectionLabel>
              )}
            </div>
          </div>
        </div>

        {/* leader badge (slides between cards) */}
        <div
          style={{
            position: "absolute",
            top: CT - 14,
            left: leaderLeft + 20,
            fontFamily: MONO,
            fontSize: 13,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: C.gold,
            background: C.panel,
            border: `1px solid ${C.gold}66`,
            borderRadius: 999,
            padding: "3px 12px",
            zIndex: 45,
          }}
        >
          leader
        </div>

        {DEMO_PROTOCOLS.map((p, i) => (
          <div key={p.key} style={{ position: "absolute", top: CT, left: cardLeft(i) }}>
            <ProtocolCard
              p={p}
              score={scores[i]}
              factors={[
                { label: "APY", val: Math.round(scores[i] * 0.32), max: 40 },
                { label: "TVL", val: 18, max: 20 },
                { label: "Trust", val: 14, max: 15 },
                { label: "Risk", val: 12, max: 15 },
              ]}
              at={4 + i * 6}
              approveAt={-40}
              holding={i === holdingIdx}
            />
          </div>
        ))}

        {/* flying funds */}
        <FundsChip amount="1,840" style={{ left: x, top: y }} />

        {/* on-chain activity log */}
        <div style={{ position: "absolute", top: 506, left: CARDS_X0, width: CARDS_W, ...riseIn(log, 16) }}>
          <Panel pad={28}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <SectionLabel>on-chain activity</SectionLabel>
              <span style={{ fontFamily: MONO, fontSize: 14, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>
                backend-signed (EIP-712) · whitelisted-only · value floor ~1%
              </span>
            </div>
            <TxRow at={10} label="Deposit · 1,840 afUSDC" hash={TX.deposit} />
            <TxRow at={156} label="Rebalance → Morpho" hash={TX.rebalance} />
            <TxRow at={306} label="Rebalance → Aave" hash={TX.r2} last />
          </Panel>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
