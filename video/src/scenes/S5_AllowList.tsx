import React from "react";
import { AbsoluteFill } from "remotion";
import { Stage } from "../components/Stage";
import { Caption } from "../components/Caption";
import { Cursor } from "../components/Cursor";
import { SectionLabel } from "../components/primitives";
import { ProtocolCard } from "../components/ProtocolCard";
import { C } from "../theme";
import { riseIn, useEnter } from "../lib/anim";
import { DEMO_PROTOCOLS } from "../data";
import { cardLeft } from "../layout";

const TOP = 446;

// Illustrative per-protocol demo scores + mini factor bars (mirrors the board).
const CARDS = [
  {
    p: DEMO_PROTOCOLS[0],
    score: 74.2,
    factors: [
      { label: "APY", val: 18, max: 40 },
      { label: "TVL", val: 20, max: 20 },
      { label: "Trust", val: 15, max: 15 },
      { label: "Risk", val: 11, max: 15 },
    ],
    approveAt: 60,
  },
  {
    p: DEMO_PROTOCOLS[1],
    score: 68.9,
    factors: [
      { label: "APY", val: 24, max: 40 },
      { label: "TVL", val: 16, max: 20 },
      { label: "Trust", val: 12, max: 15 },
      { label: "Risk", val: 9, max: 15 },
    ],
    approveAt: 90,
  },
  {
    p: DEMO_PROTOCOLS[2],
    score: 77.1,
    factors: [
      { label: "APY", val: 27, max: 40 },
      { label: "TVL", val: 17, max: 20 },
      { label: "Trust", val: 13, max: 15 },
      { label: "Risk", val: 12, max: 15 },
    ],
    approveAt: 118,
    leaderAt: 132,
  },
];

export const AllowList: React.FC = () => {
  const label = useEnter(28, 14);
  return (
    <Stage>
      <AbsoluteFill>
        <div style={{ position: "absolute", top: 96, left: 260, width: 1400 }}>
          <Caption
            at={6}
            align="center"
            kicker="testnet · arbitrum sepolia"
            title="The non-custodial delegation vault"
            sub="Approve the protocols you trust — ArbiFlow only ever routes into your allow-list."
            titleSize={64}
            width={1400}
          />
        </div>

        <div style={{ position: "absolute", top: 396, left: cardLeft(0), ...riseIn(label, 10) }}>
          <SectionLabel>03 · allow-list</SectionLabel>
        </div>

        {CARDS.map((c, i) => (
          <div key={c.p.key} style={{ position: "absolute", top: TOP, left: cardLeft(i) }}>
            <ProtocolCard
              p={c.p}
              score={c.score}
              factors={c.factors}
              at={16 + i * 8}
              approveAt={c.approveAt}
              leaderAt={c.leaderAt}
            />
          </div>
        ))}

        <Cursor from={[180, 880]} to={[cardLeft(0) + 290, 622]} startF={44} travel={16} hideAfter={70} />
        <Cursor from={[cardLeft(0) + 290, 622]} to={[cardLeft(1) + 290, 622]} startF={74} travel={14} hideAfter={100} />
        <Cursor from={[cardLeft(1) + 290, 622]} to={[cardLeft(2) + 290, 622]} startF={104} travel={14} hideAfter={134} />
      </AbsoluteFill>
    </Stage>
  );
};
