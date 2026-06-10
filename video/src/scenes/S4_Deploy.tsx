import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Caption } from "../components/Caption";
import { Cursor } from "../components/Cursor";
import { Button, Icon, Panel, SectionLabel } from "../components/primitives";
import { C } from "../theme";
import { MONO } from "../fonts";
import { riseIn, useEnter } from "../lib/anim";
import { TOP } from "../data";
import { num } from "../lib/format";

const Lock: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke={C.mint} strokeWidth="1.8" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke={C.mint} strokeWidth="1.8" />
  </svg>
);

export const Deploy: React.FC = () => {
  const frame = useCurrentFrame();
  const panel = useEnter(16, 16);
  const signing = frame >= 66 && frame < 92;
  const deployed = frame >= 92;
  const guar = useEnter(108, 16);
  const spin = (frame * 12) % 360;
  return (
    <Stage>
      <AbsoluteFill>
        <div style={{ position: "absolute", top: 120, left: 360, width: 1200 }}>
          <Caption
            at={6}
            align="center"
            kicker="[04] · deploy"
            title={
              <>
                One signature. <span style={{ color: C.gold }}>Non-custodial.</span>
              </>
            }
            width={1200}
          />
        </div>

        <div style={{ position: "absolute", top: 350, left: 560, width: 800, ...riseIn(panel, 18) }}>
          <Panel pad={40}>
            <SectionLabel style={{ marginBottom: 22 }}>ready to deploy</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 46 }}>
                {num(TOP.deploy, 0)} <span style={{ color: C.muted, fontSize: 28 }}>USDC</span>
              </span>
              <span style={{ fontSize: 40, color: C.blueLight }}>→</span>
              <Icon src="protocols/aave-v3.png" size={48} />
              <span style={{ fontSize: 34, fontWeight: 600 }}>Aave v3</span>
            </div>

            <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
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
                <Button variant="approved">✓ Deployed into your vault</Button>
              )}
            </div>
          </Panel>

          <div
            style={{
              ...riseIn(guar, 14),
              marginTop: 24,
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
              background: "rgba(52,224,161,0.06)",
              border: `1px solid ${C.mint}44`,
              borderRadius: 16,
              padding: "18px 22px",
            }}
          >
            <Lock />
            <div style={{ fontSize: 22, color: C.mutedStrong, lineHeight: 1.4 }}>
              Funds sit in <b style={{ color: C.text }}>your own</b> vault clone — only you can withdraw.
              ArbiFlow can route, never custody.
            </div>
          </div>
        </div>

        <Cursor from={[1320, 900]} to={[945, 585]} startF={48} travel={18} hideAfter={80} />
      </AbsoluteFill>
    </Stage>
  );
};
