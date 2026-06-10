import React from "react";
import { C } from "../theme";
import { riseIn, useEnter } from "../lib/anim";
import { SectionLabel } from "./primitives";

/** Kinetic narrative block: mono kicker → big title → muted subline. */
export const Caption: React.FC<{
  at: number;
  kicker?: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "left" | "center";
  width?: number;
  titleSize?: number;
  style?: React.CSSProperties;
}> = ({
  at,
  kicker,
  title,
  sub,
  align = "left",
  width = 1180,
  titleSize = 78,
  style,
}) => {
  const k = useEnter(at, 12);
  const t = useEnter(at + 4, 20);
  const s = useEnter(at + 12, 18);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 22,
        width,
        textAlign: align,
        alignItems: align === "center" ? "center" : "flex-start",
        ...style,
      }}
    >
      {kicker ? (
        <div style={riseIn(k, 10)}>
          <SectionLabel color={C.gold}>{kicker}</SectionLabel>
        </div>
      ) : null}
      <div
        style={{
          ...riseIn(t, 24),
          fontSize: titleSize,
          fontWeight: 600,
          letterSpacing: -2,
          lineHeight: 1.04,
        }}
      >
        {title}
      </div>
      {sub ? (
        <div
          style={{
            ...riseIn(s, 16),
            fontSize: 30,
            lineHeight: 1.45,
            color: C.mutedStrong,
            maxWidth: 1000,
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};
