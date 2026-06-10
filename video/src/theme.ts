// Brand tokens — single source of truth.
// Mirrors public/brand/README.md and app/globals.css from the ArbiFlow app.

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const C = {
  bg: "#07080B", // near-black background
  panel: "#0E1015", // badge / card fill
  panel2: "#13161F", // raised surface
  border: "#1C2130", // hairline
  borderStrong: "#2A3142",
  blue: "#1E5BD8", // accent / streams (low)
  blueLight: "#4A8FFF", // accent / streams (high)
  gold: "#F4B53F", // yield / funds
  goldLight: "#FFD37A",
  mint: "#34E0A1", // live / approved
  rose: "#F4607A", // negative
  text: "#F2F2EE",
  muted: "#A8AEBC",
  mutedStrong: "#CDD2DD",
} as const;

export const GRAD = {
  blue: `linear-gradient(90deg, ${C.blue}, ${C.blueLight})`,
  gold: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`,
  mint: `linear-gradient(90deg, #1FB97F, ${C.mint})`,
} as const;
