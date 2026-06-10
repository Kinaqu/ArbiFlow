import React from "react";
import { AbsoluteFill } from "remotion";
import { Stage } from "../components/Stage";
import { Icon, Panel, SectionLabel, Tag } from "../components/primitives";
import { ScoreBars } from "../components/ScoreBars";
import { C } from "../theme";
import { MONO } from "../fonts";
import { riseIn, useCountUp, useEnter } from "../lib/anim";
import { COMPOSITE, FACTORS, RANKED } from "../data";

export const Score: React.FC = () => {
  const head = useEnter(6, 16);
  const left = useEnter(16, 16);
  const right = useEnter(40, 16);
  const comp = useCountUp(64, 30, 0, COMPOSITE);
  const rationale = useEnter(122, 16);
  return (
    <Stage>
      <AbsoluteFill>
        <div style={{ position: "absolute", top: 96, left: 150, ...riseIn(head, 14) }}>
          <SectionLabel color={C.gold}>[03] · ranked opportunities</SectionLabel>
          <div style={{ fontSize: 60, fontWeight: 600, letterSpacing: -2, marginTop: 12 }}>
            Every pool, scored <span style={{ color: C.gold }}>0–100</span>
          </div>
        </div>

        <div style={{ position: "absolute", top: 250, left: 150, width: 700, ...riseIn(left, 18) }}>
          <Panel pad={28}>
            <SectionLabel style={{ marginBottom: 18 }}>ranked opportunities</SectionLabel>
            {RANKED.map((r, i) => (
              <RankRow key={r.label} r={r} at={28 + i * 10} />
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
                <Tag color={C.gold} border={`${C.gold}55`}>top match</Tag>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14, margin: "12px 0 24px" }}>
              <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 90, lineHeight: 0.85 }}>
                {comp.toFixed(0)}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 30, color: C.muted, marginBottom: 10 }}>/ 100</span>
              <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 22, color: C.mint, marginBottom: 14 }}>
                4.31% APY
              </span>
            </div>
            <SectionLabel style={{ marginBottom: 16 }}>composite score</SectionLabel>
            <ScoreBars at={70} factors={FACTORS} width={692} barColor={C.blueLight} stagger={7} />
            <div
              style={{
                ...riseIn(rationale, 14),
                marginTop: 22,
                fontSize: 21,
                color: C.mutedStrong,
                borderTop: `1px solid ${C.border}`,
                paddingTop: 18,
              }}
            >
              <span style={{ color: C.muted, fontFamily: MONO, fontSize: 14, textTransform: "uppercase", letterSpacing: 2 }}>
                why{" "}
              </span>
              Blue-chip Aave pool — deep liquidity, stablecoin, zero IL.
            </div>
          </Panel>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

const RankRow: React.FC<{ r: (typeof RANKED)[number]; at: number }> = ({ r, at }) => {
  const p = useEnter(at, 14);
  return (
    <div
      style={{
        ...riseIn(p, 12),
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 14px",
        marginBottom: 10,
        borderRadius: 14,
        background: r.top ? "rgba(244,181,63,0.06)" : C.bg,
        border: `1px solid ${r.top ? `${C.gold}66` : C.border}`,
      }}
    >
      <Icon src={`protocols/${r.icon}`} size={42} />
      <div>
        <div style={{ fontSize: 23, fontWeight: 600 }}>
          {r.label} <span style={{ color: C.muted, fontWeight: 400, fontSize: 18 }}>/ {r.sym}</span>
        </div>
        {r.top ? (
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: C.gold }}>
            top match
          </span>
        ) : null}
      </div>
      <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 22, color: C.mint }}>{r.apy.toFixed(2)}%</span>
      <div style={{ width: 64, textAlign: "right" }}>
        <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 28, color: r.top ? C.gold : C.text }}>{r.score}</div>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.muted }}>
          score
        </div>
      </div>
    </div>
  );
};
