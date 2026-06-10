import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Stage } from "../../components/Stage";
import { Caption } from "../../components/Caption";
import { Cursor } from "../../components/Cursor";
import { LowerThird } from "../../components/LowerThird";
import { Panel, SectionLabel, Tag } from "../../components/primitives";
import { ProtocolCard, FundsChip } from "../../components/ProtocolCard";
import { TxRow } from "../../components/TxRow";
import { GUARANTEES, GuaranteeCard } from "../S7_Security";
import { CARDS as ALLOW_CARDS } from "../S5_AllowList";
import { C } from "../../theme";
import { MONO } from "../../fonts";
import { clamp, riseIn, useEnter, useSpringAt } from "../../lib/anim";
import { TX } from "../../data";
import { cardLeft, CARDS_X0, CARDS_W } from "../../layout";

// VO: "Curate and sign — never drain." starts ≈ local 538 → cut to phase C at 530.
const PHASE_AB = 530;

const CT = 214; // cards top (same geometry as the demo's rebalance scene)
const smooth = (t: number) => t * t * (3 - 2 * t);
const APPROVE = [100, 136, 170];
// Funds journey: Compound(1) → Morpho(2) @320 → Aave(0) @470.
const MOVES = [
  { atF: 320, to: 2 },
  { atF: 470, to: 0 },
];
const INITIAL = 1;
const anchorX = (i: number) => cardLeft(i) + 28;
const ANCHOR_Y = CT + 198;

/** Beat 4 · VO 53.0–78.4 — allow-list → guarded keeper → "never drain". */
export const P4Moat: React.FC = () => (
  <Stage>
    <Sequence durationInFrames={PHASE_AB}>
      <Keeper />
    </Sequence>
    <Sequence from={PHASE_AB}>
      <NeverDrain />
    </Sequence>
  </Stage>
);

const Keeper: React.FC = () => {
  const frame = useCurrentFrame();
  const head = useEnter(6, 12);
  const log = useEnter(200, 16);
  const g = clamp((frame - 195) / 30); // live jitter only once funds are in
  const jitter = (off: number) => g * 0.3 * Math.sin(frame / 9 + off);

  // Live scores; Aave overtakes Morpho ≈ frame 433, keeper follows at 470.
  const sAave =
    74.2 + (frame < 410 ? 0 : smooth(clamp((frame - 410) / 40)) * 5.2) + jitter(0);
  const sCompound = 68.9 + jitter(2);
  const sMorpho =
    77.1 - (frame < 450 ? 0 : smooth(clamp((frame - 450) / 50)) * 1.1) + jitter(4);
  const scores = [sAave, sCompound, sMorpho];

  // Funds chip: pops in on "your money stays in your own vault", then arcs.
  const funded = frame >= 195;
  const pop = useSpringAt(195, { stiffness: 160, damping: 16 });
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

  // Leader pill: appears over Morpho after approvals, slides to Aave on the flip.
  const leaderIn = useEnter(205, 10);
  const lt = smooth(clamp((frame - 448) / 12));
  const leaderLeft = cardLeft(2) + (cardLeft(0) - cardLeft(2)) * lt;

  const showCountdown = frame >= 240;
  const N = Math.max(1, 35 - Math.floor((((frame - 240) % 150) / 150) * 35));

  const status =
    frame < 240
      ? "Approve the protocols you trust — your allow-list."
      : frame < 500
        ? "A keeper rebalances every ~35s — only inside your allow-list."
        : "Funds follow the score — value floor enforced.";
  const why =
    frame < 240
      ? "ArbiFlow can only ever route into protocols you approved."
      : frame < 500
        ? "Morpho holds the best risk-adjusted score right now."
        : "Aave overtook on a value-preserving move.";

  return (
    <AbsoluteFill>
      {/* header: status + sepolia tag + countdown */}
      <div
        style={{
          position: "absolute",
          top: 66,
          left: CARDS_X0,
          width: CARDS_W,
          ...riseIn(head, 10),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <SectionLabel>[04] · the moat · delegation vault</SectionLabel>
              <Tag color={C.gold} border={`${C.gold}55`}>
                testnet · arbitrum sepolia
              </Tag>
            </div>
            <div style={{ fontSize: 30, fontWeight: 600, marginTop: 10 }}>{status}</div>
            <div style={{ fontSize: 19, color: C.muted, marginTop: 6 }}>Why: {why}</div>
          </div>
          <div style={{ textAlign: "right", minWidth: 200 }}>
            {showCountdown ? (
              <>
                <div
                  style={{
                    fontFamily: MONO,
                    fontWeight: 600,
                    fontSize: 52,
                    color: C.gold,
                    lineHeight: 1,
                  }}
                >
                  {N}s
                </div>
                <SectionLabel style={{ marginTop: 6 }}>next decision</SectionLabel>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* leader badge (slides between cards) */}
      <div
        style={{
          position: "absolute",
          top: CT - 14,
          left: leaderLeft + 20,
          opacity: leaderIn,
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

      {ALLOW_CARDS.map((c, i) => (
        <div key={c.p.key} style={{ position: "absolute", top: CT, left: cardLeft(i) }}>
          <ProtocolCard
            p={c.p}
            score={scores[i]}
            factors={c.factors}
            at={14 + i * 8}
            approveAt={APPROVE[i]}
            holding={funded && i === holdingIdx}
          />
        </div>
      ))}

      {/* flying funds */}
      {funded ? (
        <FundsChip
          amount="1,840"
          style={{ left: x, top: y, opacity: pop }}
          scale={0.8 + pop * 0.2}
        />
      ) : null}

      {/* approval cursor chain */}
      <Cursor from={[180, 880]} to={[cardLeft(0) + 290, CT + 176]} startF={84} travel={14} hideAfter={112} />
      <Cursor from={[cardLeft(0) + 290, CT + 176]} to={[cardLeft(1) + 290, CT + 176]} startF={120} travel={14} hideAfter={148} />
      <Cursor from={[cardLeft(1) + 290, CT + 176]} to={[cardLeft(2) + 290, CT + 176]} startF={154} travel={14} hideAfter={196} />

      {/* on-chain activity log */}
      <div
        style={{
          position: "absolute",
          top: 506,
          left: CARDS_X0,
          width: CARDS_W,
          ...riseIn(log, 16),
        }}
      >
        <Panel pad={28}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <SectionLabel>on-chain activity</SectionLabel>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 14,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.muted,
              }}
            >
              backend-signed (EIP-712) · whitelisted-only · value floor ~1%
            </span>
          </div>
          <TxRow at={215} label="Deposit · 1,840 afUSDC" hash={TX.deposit} />
          <TxRow at={330} label="Rebalance → Morpho" hash={TX.rebalance} />
          <TxRow at={480} label="Rebalance → Aave" hash={TX.r2} last />
        </Panel>
      </div>

      <LowerThird mono at={400} out={512}>
        Whitelisted targets only · Value floor ~1% · Owner-only withdrawals
      </LowerThird>
    </AbsoluteFill>
  );
};

const NeverDrain: React.FC = () => {
  const punch = useEnter(92, 18);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 110, left: 360, width: 1200 }}>
        <Caption
          at={4}
          align="center"
          kicker="the moat"
          title={
            <>
              Curate + sign, <span style={{ color: C.gold }}>never drain.</span>
            </>
          }
          width={1200}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 110,
          right: 150,
        }}
      >
        <Tag color={C.gold} border={`${C.gold}55`}>
          testnet · arbitrum sepolia
        </Tag>
      </div>

      {GUARANTEES.map((g, i) => (
        <GuaranteeCard key={g.t} g={g} i={i} />
      ))}

      <div
        style={{
          position: "absolute",
          top: 640,
          left: 360,
          width: 1200,
          textAlign: "center",
          ...riseIn(punch, 18),
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>
          A stolen keeper key still{" "}
          <span style={{ color: C.gold }}>can't move your funds.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
