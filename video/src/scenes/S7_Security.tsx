import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Caption } from "../components/Caption";
import { Cursor } from "../components/Cursor";
import { Button } from "../components/primitives";
import { TxRow } from "../components/TxRow";
import { C } from "../theme";
import { riseIn, useEnter } from "../lib/anim";
import { TX } from "../data";

const Check: React.FC = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={C.mint} strokeWidth="1.6" />
    <path d="M7.5 12.3l3 3 6-6.5" stroke={C.mint} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GUARANTEES = [
  { t: "Whitelisted targets only", s: "Every rebalance must hit a target you approved — nothing else." },
  { t: "Value floor on every move", s: "Portfolio value can't drop more than ~1% across a batch." },
  { t: "Owner-only withdrawals", s: "Only you can withdraw. emergencyWithdraw works even if the keeper goes dark." },
];

const X0 = 268;
const CW = 440;
const GAP = 32;

const GuaranteeCard: React.FC<{ g: { t: string; s: string }; i: number }> = ({ g, i }) => {
  const p = useEnter(20 + i * 8, 16);
  return (
    <div
      style={{
        position: "absolute",
        top: 290,
        left: X0 + i * (CW + GAP),
        width: CW,
        ...riseIn(p, 16),
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: 28,
        minHeight: 188,
      }}
    >
      <Check />
      <div style={{ fontSize: 25, fontWeight: 600, marginTop: 16 }}>{g.t}</div>
      <div style={{ fontSize: 19, color: C.muted, marginTop: 10, lineHeight: 1.45 }}>{g.s}</div>
    </div>
  );
};

export const Security: React.FC = () => {
  const frame = useCurrentFrame();
  const withdrawn = frame >= 94;
  const panel = useEnter(50, 16);
  const punch = useEnter(70, 18);
  return (
    <Stage>
      <AbsoluteFill>
        <div style={{ position: "absolute", top: 92, left: 360, width: 1200 }}>
          <Caption
            at={6}
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

        {GUARANTEES.map((g, i) => (
          <GuaranteeCard key={g.t} g={g} i={i} />
        ))}

        {/* owner-only withdraw proof */}
        <div
          style={{
            position: "absolute",
            top: 540,
            left: X0,
            width: CW * 3 + GAP * 2,
            ...riseIn(panel, 14),
            display: "flex",
            alignItems: "center",
            gap: 22,
            background: "rgba(52,224,161,0.05)",
            border: `1px solid ${C.mint}33`,
            borderRadius: 18,
            padding: "22px 28px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {!withdrawn ? (
              <span style={{ fontSize: 22, color: C.mutedStrong }}>The owner can pull out at any time.</span>
            ) : (
              <TxRow at={96} label="Withdraw → owner · only you can" hash={TX.withdraw} last />
            )}
          </div>
          <div style={{ position: "relative", width: 230, display: "flex", justifyContent: "flex-end" }}>
            {!withdrawn ? <Button variant="primary">Withdraw</Button> : <Button variant="approved">✓ Withdrawn</Button>}
          </div>
        </div>

        <div style={{ position: "absolute", top: 760, left: 360, width: 1200, textAlign: "center", ...riseIn(punch, 18) }}>
          <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>
            A stolen keeper key still <span style={{ color: C.gold }}>can't move your funds.</span>
          </div>
        </div>

        <Cursor from={[1500, 880]} to={[1590, 580]} startF={78} travel={16} hideAfter={104} />
      </AbsoluteFill>
    </Stage>
  );
};
