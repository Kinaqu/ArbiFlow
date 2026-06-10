import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage } from "../../components/Stage";
import { Cursor } from "../../components/Cursor";
import { LowerThird } from "../../components/LowerThird";
import { Button, Icon, Panel, SectionLabel, Tag } from "../../components/primitives";
import { ScoreBars } from "../../components/ScoreBars";
import { C } from "../../theme";
import { MONO } from "../../fonts";
import { riseIn, useCountUp, useEnter } from "../../lib/anim";
import { COMPOSITE, FACTORS, TOP } from "../../data";
import { num } from "../../lib/format";

/** Beat 3 · VO 37.5–52.0 — the same 5-factor math, then one-signature deploy. */
export const P3Score: React.FC = () => {
  const frame = useCurrentFrame();
  const head = useEnter(6, 16);
  const left = useEnter(20, 16);
  const comp = useCountUp(28, 26, 0, COMPOSITE);
  const rationale = useEnter(310, 14); // VO: "No black box, no guessing."
  const right = useEnter(330, 16);
  const signing = frame >= 390 && frame < 424;
  const deployed = frame >= 424; // VO: "…then sign once."
  const note = useEnter(430, 14);
  const spin = (frame * 12) % 360;
  return (
    <Stage>
      <AbsoluteFill>
        <div style={{ position: "absolute", top: 96, left: 150, ...riseIn(head, 14) }}>
          <SectionLabel color={C.gold}>[03] · transparent scoring</SectionLabel>
          <div style={{ fontSize: 60, fontWeight: 600, letterSpacing: -2, marginTop: 12 }}>
            The same math for <span style={{ color: C.gold }}>every pool</span>
          </div>
        </div>

        {/* composite score + factor bars */}
        <div style={{ position: "absolute", top: 250, left: 150, width: 760, ...riseIn(left, 18) }}>
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
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14, margin: "10px 0 22px" }}>
              <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 84, lineHeight: 0.85 }}>
                {comp.toFixed(0)}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 30, color: C.muted, marginBottom: 9 }}>
                / 100
              </span>
            </div>
            <SectionLabel style={{ marginBottom: 16 }}>composite score</SectionLabel>
            <ScoreBars at={90} factors={FACTORS} stagger={22} width={692} barColor={C.blueLight} />
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
              No black box, no guessing — you see exactly why the top match won.
            </div>
          </Panel>
        </div>

        {/* one-signature deploy */}
        <div style={{ position: "absolute", top: 300, left: 1010, width: 760, ...riseIn(right, 18) }}>
          <Panel pad={36}>
            <SectionLabel style={{ marginBottom: 22 }}>then sign once</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 44 }}>
                {num(TOP.deploy, 0)} <span style={{ color: C.muted, fontSize: 26 }}>USDC</span>
              </span>
              <span style={{ fontSize: 36, color: C.blueLight }}>→</span>
              <Icon src="protocols/aave-v3.png" size={44} />
              <span style={{ fontSize: 30, fontWeight: 600 }}>Aave v3</span>
            </div>
            <div style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
              {!deployed ? (
                <Button variant="primary">
                  {signing ? (
                    <>
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 999,
                          border: "2px solid rgba(255,255,255,0.35)",
                          borderTopColor: "#fff",
                          display: "inline-block",
                          transform: `rotate(${spin}deg)`,
                        }}
                      />
                      Signing…
                    </>
                  ) : (
                    "Deploy · 1 signature"
                  )}
                </Button>
              ) : (
                <Button variant="approved">✓ Deployed — non-custodial</Button>
              )}
            </div>
          </Panel>
          <div
            style={{
              ...riseIn(note, 14),
              marginTop: 20,
              display: "flex",
              gap: 14,
              background: "rgba(52,224,161,0.06)",
              border: `1px solid ${C.mint}44`,
              borderRadius: 16,
              padding: "16px 22px",
              fontSize: 21,
              color: C.mutedStrong,
              lineHeight: 1.4,
            }}
          >
            Funds go straight to the protocol — never to ArbiFlow.
          </div>
        </div>

        <Cursor from={[1720, 950]} to={[1390, 505]} startF={372} travel={14} hideAfter={400} />

        <LowerThird mono at={100} out={432}>
          APY 40 · TVL 20 · Trust 15 · Stability 15 · Forecast 10 → 78 / 100
        </LowerThird>
      </AbsoluteFill>
    </Stage>
  );
};
