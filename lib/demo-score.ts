// Demo scoring engine for the testnet vault.
//
// These scores are intentionally FAKE — there is no live market behind the three
// stand-in protocols — but they are deterministic, distinct per protocol, and
// drift over time, so the same `tick` produces the same scores on the server
// (which decides the rebalance) and in the browser (which shows the user why).
// Each protocol has its own profile across the factors a real engine would weigh
// (APY, incentives, protocol risk, 30-day volatility, impermanent loss, gas), so
// the leader changes every so often — and the keeper sometimes moves, sometimes
// deliberately stays put.

import { TESTNET_DEPLOYMENT as DEPLOYMENT, type ProtocolKey } from "./testnet";
import type { FundLocation } from "./vault-calls";

/** Decision cadence — one tick every ~25s, inside the 20–30s window. */
export const TICK_MS = 25_000;
/** A leader must beat the current spot by this many points to be worth a move. */
export const HYSTERESIS = 4;

export type ScoreBreakdown = {
  apy: number; // base APY, %
  incentives: number; // reward APR, %
  risk: number; // protocol risk, 0 (safe) .. 100 (risky)
  volatility: number; // 30-day volatility, 0..100
  il: number; // impermanent-loss exposure, 0..100
  gas: number; // relative gas cost to enter, 0..100
};

export type ProtocolScore = {
  key: ProtocolKey;
  breakdown: ScoreBreakdown;
  score: number; // composite, higher = better (0..100)
  rationale: string;
};

/** Result of one keeper decision tick — the /api/keeper/tick response shape.
 *  Lives here (a secret-free module) so client code never imports the route. */
export type KeeperTickResult = {
  moved: boolean;
  location: FundLocation;
  from?: FundLocation;
  to?: ProtocolKey;
  hash?: `0x${string}`;
  tick: number;
  scores: ProtocolScore[];
  reason: "moved" | "stay" | "no_funds" | "no_approvals" | "not_delegated";
};

/** Distinct baseline profile per protocol. Morpho: best yield, worst risk. */
const BASE: Record<ProtocolKey, ScoreBreakdown> = {
  aave: { apy: 6.4, incentives: 1.1, risk: 16, volatility: 24, il: 4, gas: 30 },
  compound: { apy: 5.8, incentives: 1.9, risk: 24, volatility: 30, il: 6, gas: 36 },
  morpho: { apy: 7.3, incentives: 2.6, risk: 38, volatility: 44, il: 9, gas: 48 },
};

/** Composite weights (sum to 100). Good factors add; risk-like factors subtract. */
const W = { apy: 34, incentives: 12, risk: 20, volatility: 14, il: 8, gas: 12 };

/** Display metadata for the score panel. */
export const FACTORS: {
  key: keyof ScoreBreakdown;
  label: string;
  betterHigh: boolean;
  max: number;
  unit?: string;
}[] = [
  { key: "apy", label: "Base APY", betterHigh: true, max: 14, unit: "%" },
  { key: "incentives", label: "Incentives", betterHigh: true, max: 5, unit: "%" },
  { key: "risk", label: "Protocol risk", betterHigh: false, max: 100 },
  { key: "volatility", label: "30d volatility", betterHigh: false, max: 100 },
  { key: "il", label: "Impermanent loss", betterHigh: false, max: 100 },
  { key: "gas", label: "Gas cost", betterHigh: false, max: 100 },
];

const KNOWN = new Set<ProtocolKey>(DEPLOYMENT.protocols.map((p) => p.key));

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round1 = (n: number) => Math.round(n * 10) / 10;
const norm = (n: number, lo: number, hi: number) => clamp((n - lo) / (hi - lo), 0, 1);

/** Stable string hash → [0, 1). */
function hash01(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Smooth per-(protocol, factor) drift over ticks, with a touch of wobble. */
function drift(key: ProtocolKey, factor: string, tick: number, amp: number): number {
  const phase = hash01(`${key}:${factor}:phase`) * Math.PI * 2;
  const periodTicks = 4 + Math.floor(hash01(`${key}:${factor}:period`) * 6); // 4..9
  const slow = Math.sin((tick / periodTicks) * Math.PI * 2 + phase);
  const wobble = (hash01(`${key}:${factor}:${tick}`) - 0.5) * 0.3;
  return amp * (slow + wobble);
}

function composite(b: ScoreBreakdown): number {
  const raw =
    W.apy * norm(b.apy, 0, 12) +
    W.incentives * norm(b.incentives, 0, 4) +
    W.risk * (1 - b.risk / 100) +
    W.volatility * (1 - b.volatility / 100) +
    W.il * (1 - b.il / 100) +
    W.gas * (1 - b.gas / 100);
  return round1(clamp(raw, 0, 100));
}

function rationaleFor(key: ProtocolKey, b: ScoreBreakdown): string {
  const label = DEPLOYMENT.protocols.find((p) => p.key === key)?.label ?? key;
  if (b.risk <= 18 && b.volatility <= 28) return `${label}: steady, low-risk yield at ${round1(b.apy)}%.`;
  if (b.incentives >= 2.2) return `${label}: ${round1(b.apy)}% + ${round1(b.incentives)}% incentives.`;
  if (b.risk >= 34) return `${label}: top APY (${round1(b.apy)}%) but higher risk.`;
  return `${label}: ${round1(b.apy)}% APY, balanced risk.`;
}

/** Deterministic score for one protocol at a given tick. */
export function scoreProtocolAt(key: ProtocolKey, tick: number): ProtocolScore {
  const base = BASE[key];
  const breakdown: ScoreBreakdown = {
    apy: round1(clamp(base.apy + drift(key, "apy", tick, 2.2), 0.5, 14)),
    incentives: round1(clamp(base.incentives + drift(key, "inc", tick, 0.8), 0, 5)),
    risk: Math.round(clamp(base.risk + drift(key, "risk", tick, 6), 2, 95)),
    volatility: Math.round(clamp(base.volatility + drift(key, "vol", tick, 8), 2, 95)),
    il: Math.round(clamp(base.il + drift(key, "il", tick, 2), 0, 60)),
    gas: Math.round(clamp(base.gas + drift(key, "gas", tick, 5), 5, 90)),
  };
  return { key, breakdown, score: composite(breakdown), rationale: rationaleFor(key, breakdown) };
}

/** All protocols' scores at a tick, ranked best-first. */
export function allScoresAt(tick: number): ProtocolScore[] {
  return DEPLOYMENT.protocols
    .map((p) => scoreProtocolAt(p.key, tick))
    .sort((a, b) => b.score - a.score);
}

export const tickFor = (now: number = Date.now()) => Math.floor(now / TICK_MS);
export const msUntilNextTick = (now: number = Date.now()) => TICK_MS - (now % TICK_MS);

/**
 * The keeper's decision: which approved protocol to hold at this tick, or `null`
 * to stay put. Picks the highest-scoring *approved* protocol, but only moves an
 * already-invested position if the leader beats it by `HYSTERESIS` — so it does
 * not churn on every tiny lead change.
 */
export function decideTarget(
  location: FundLocation,
  approved: ProtocolKey[],
  tick: number,
): ProtocolKey | null {
  const set = approved.filter((k) => KNOWN.has(k));
  if (set.length === 0) return null;

  const ranked = set.map((k) => scoreProtocolAt(k, tick)).sort((a, b) => b.score - a.score);
  const leader = ranked[0];

  const inApproved =
    location !== "idle" && location !== "empty" && set.includes(location as ProtocolKey);

  if (inApproved) {
    if (leader.key === location) return null;
    const current = scoreProtocolAt(location as ProtocolKey, tick).score;
    if (leader.score - current < HYSTERESIS) return null;
    return leader.key;
  }
  // Idle, or parked in a protocol the user no longer approves → go to the leader.
  return leader.key;
}
