import React from "react";
import { AbsoluteFill } from "remotion";
import { Stage } from "../components/Stage";
import { Icon, SectionLabel } from "../components/primitives";
import { C } from "../theme";
import { MONO } from "../fonts";
import { riseIn, useEnter, useSpringAt } from "../lib/anim";
import { AAVE_V3_POOL, SITE, VAULT } from "../data";
import { shortAddr } from "../lib/format";

const ProofChip: React.FC<{ at: number; label: React.ReactNode; value: React.ReactNode }> = ({
  at,
  label,
  value,
}) => {
  const p = useEnter(at, 14);
  return (
    <div
      style={{
        ...riseIn(p, 14),
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: "16px 22px",
      }}
    >
      <span style={{ fontSize: 20, color: C.mutedStrong }}>{label}</span>
      <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 19, color: C.blueLight }}>{value}</span>
    </div>
  );
};

export const Outro: React.FC = () => {
  const kick = useEnter(6, 14);
  const logo = useSpringAt(40, { stiffness: 120, damping: 15 });
  const url = useEnter(58, 16);
  const tag = useEnter(50, 16);
  return (
    <Stage>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start" }}>
        <div style={{ position: "absolute", top: 120, width: 980, display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <div style={riseIn(kick, 10)}>
            <SectionLabel color={C.mint}>● proven on-chain · arbitrum sepolia</SectionLabel>
          </div>
          <div style={{ width: 980, display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
            <ProofChip at={18} label="Live demo vault, rebalancing on-chain" value={`${shortAddr(VAULT)} ↗`} />
            <ProofChip at={28} label="Foundry fork test vs. real Aave V3  ✓" value={`${shortAddr(AAVE_V3_POOL)} ↗`} />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 520,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 26,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              transform: `scale(${0.85 + logo * 0.15})`,
              opacity: logo,
            }}
          >
            <Icon src="brand/logomark-512.png" size={88} round={false} style={{ background: "transparent", borderRadius: 22 }} />
            <div style={{ fontSize: 92, fontWeight: 600, letterSpacing: -3 }}>ArbiFlow</div>
          </div>
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
    </Stage>
  );
};
