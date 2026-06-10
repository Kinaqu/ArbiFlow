import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Caption } from "../components/Caption";
import { Cursor } from "../components/Cursor";
import { AddressPill, Button, Dot } from "../components/primitives";
import { C } from "../theme";
import { MONO } from "../fonts";
import { riseIn, useEnter } from "../lib/anim";
import { WALLET } from "../data";

export const Connect: React.FC = () => {
  const frame = useCurrentFrame();
  const btn = useEnter(30, 16);
  const connected = frame >= 64;
  const conn = useEnter(66, 14);
  return (
    <Stage>
      <AbsoluteFill>
        <div style={{ position: "absolute", top: 150, left: 360, width: 1200 }}>
          <Caption
            at={6}
            align="center"
            kicker="[01] · connect to scan"
            title={
              <>
                Plug in your <span style={{ color: C.gold }}>Arbitrum</span> wallet
              </>
            }
            sub="We'll pull your balances, identify idle capital, and surface ranked yield opportunities. Non-custodial — you sign every action."
            width={1200}
          />
        </div>

        {/* interactive zone, absolutely placed so the cursor lands true */}
        <div
          style={{
            position: "absolute",
            top: 620,
            left: 660,
            width: 600,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {!connected ? (
            <div style={{ ...riseIn(btn, 12) }}>
              <Button variant="primary">Connect wallet →</Button>
            </div>
          ) : (
            <div
              style={{
                ...riseIn(conn, 12),
                display: "flex",
                alignItems: "center",
                gap: 18,
              }}
            >
              <AddressPill addr={WALLET} />
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  fontFamily: MONO,
                  fontSize: 18,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: C.mint,
                  border: `1px solid ${C.mint}55`,
                  borderRadius: 999,
                  padding: "10px 16px",
                }}
              >
                <Dot color={C.mint} size={9} /> mainnet · live
              </div>
            </div>
          )}
        </div>

        <Cursor from={[1380, 900]} to={[930, 660]} startF={42} travel={20} hideAfter={70} />
      </AbsoluteFill>
    </Stage>
  );
};
