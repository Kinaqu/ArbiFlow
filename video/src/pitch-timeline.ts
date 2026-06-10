// Pitch beat durations (frames @ 30fps). Hard cuts between beats — boundaries
// are measured against the actual voiceover (video/public/voiceover.mp3, 129.4s,
// silence-mapped): every beat cut lands inside the pause between VO paragraphs.
export const BEAT_DUR = {
  problem: 715, // VO 0:00–23.9 — idle capital, 500+ pools
  solution: 405, // VO 24.1–37.0 — ArbiFlow does that job in seconds
  score: 462, // VO 37.5–52.0 — transparent 5-factor math, sign once
  moat: 797, // VO 53.0–78.4 — allow-list → keeper → never drain
  proof: 840, // VO 79.5–106.1 — what's real → Arbiscan → forge
  vision: 741, // VO 107.6–128.8 — roadmap → ArbiFlow → CTA (+ hold)
} as const;

export const BEAT_ORDER = [
  "problem",
  "solution",
  "score",
  "moat",
  "proof",
  "vision",
] as const;

export const PITCH_TOTAL = 3960; // 2:12 — VO end (129.4s) + CTA hold

const sum = BEAT_ORDER.reduce((a, k) => a + BEAT_DUR[k], 0);
if (sum !== PITCH_TOTAL) {
  throw new Error(`Pitch beats sum to ${sum} frames, expected ${PITCH_TOTAL}`);
}
