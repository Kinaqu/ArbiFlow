// Per-scene durations (frames @ 30fps) + transition overlap.
// TOTAL = sum(scenes) - overlaps, used as the composition's durationInFrames.
export const TRANS = 12;

export const SCENE_DUR = {
  bumper: 170,
  connect: 250,
  scan: 300,
  score: 400,
  deploy: 300,
  allow: 340,
  rebalance: 560,
  security: 290,
  outro: 200,
} as const;

export const SCENE_ORDER = [
  "bumper",
  "connect",
  "scan",
  "score",
  "deploy",
  "allow",
  "rebalance",
  "security",
  "outro",
] as const;

const sum = SCENE_ORDER.reduce((a, k) => a + SCENE_DUR[k], 0);
export const TOTAL = sum - TRANS * (SCENE_ORDER.length - 1); // 2714
