import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { C, GRAD } from "../theme";
import { MONO, SANS } from "../fonts";
import { shortAddr } from "../lib/format";

export const Panel: React.FC<
  React.PropsWithChildren<{ style?: React.CSSProperties; pad?: number }>
> = ({ children, style, pad = 36 }) => (
  <div
    style={{
      background: `linear-gradient(180deg, ${C.panel2}, ${C.panel})`,
      border: `1px solid ${C.border}`,
      borderRadius: 22,
      padding: pad,
      boxShadow: "0 40px 90px rgba(0,0,0,0.5)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const SectionLabel: React.FC<
  React.PropsWithChildren<{ color?: string; style?: React.CSSProperties }>
> = ({ children, color = C.muted, style }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 20,
      letterSpacing: 4,
      textTransform: "uppercase",
      color,
      fontWeight: 500,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Tag: React.FC<
  React.PropsWithChildren<{ color?: string; border?: string }>
> = ({ children, color = C.muted, border = C.border }) => (
  <span
    style={{
      fontFamily: MONO,
      fontSize: 13,
      letterSpacing: 2,
      textTransform: "uppercase",
      color,
      border: `1px solid ${border}`,
      borderRadius: 6,
      padding: "3px 8px",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

/** Pulsing status dot (sine on frame — never use CSS animation in Remotion). */
export const Dot: React.FC<{ color?: string; size?: number }> = ({
  color = C.mint,
  size = 12,
}) => {
  const frame = useCurrentFrame();
  const pulse = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(frame / 7));
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: color,
        display: "inline-block",
        boxShadow: `0 0 ${size * 1.4}px ${color}`,
        opacity: pulse,
      }}
    />
  );
};

export const Icon: React.FC<{
  src: string;
  size?: number;
  round?: boolean;
  style?: React.CSSProperties;
}> = ({ src, size = 40, round = true, style }) => (
  <Img
    src={staticFile(src)}
    style={{
      width: size,
      height: size,
      borderRadius: round ? 999 : 9,
      objectFit: "cover",
      background: C.panel,
      ...style,
    }}
  />
);

export const Button: React.FC<
  React.PropsWithChildren<{
    variant?: "primary" | "approved" | "ghost";
    press?: number;
    style?: React.CSSProperties;
  }>
> = ({ children, variant = "primary", press = 1, style }) => {
  const v = {
    primary: {
      background: GRAD.blue,
      color: "#fff",
      border: "1px solid transparent",
      boxShadow: "0 12px 34px rgba(30,91,216,0.5)",
    },
    approved: {
      background: "rgba(52,224,161,0.12)",
      color: C.mint,
      border: `1px solid ${C.mint}66`,
      boxShadow: "none",
    },
    ghost: {
      background: "transparent",
      color: C.text,
      border: `1px solid ${C.borderStrong}`,
      boxShadow: "none",
    },
  }[variant];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: 22,
        padding: "14px 26px",
        borderRadius: 13,
        transform: `scale(${press})`,
        ...v,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Truncated wallet address chip with a blue avatar dot. */
export const AddressPill: React.FC<{ addr: string }> = ({ addr }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      background: C.panel,
      border: `1px solid ${C.border}`,
      borderRadius: 999,
      padding: "12px 20px",
      fontFamily: MONO,
      fontSize: 22,
      color: C.text,
    }}
  >
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: 999,
        background: GRAD.blue,
      }}
    />
    {shortAddr(addr)}
  </div>
);
