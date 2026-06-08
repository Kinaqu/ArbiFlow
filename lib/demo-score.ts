// Demo scoring engine for the testnet vault.
//
// These scores are intentionally FAKE — there is no live market behind the three
// stand-in protocols — but they are deterministic, distinct per protocol, and
// drift over time, so the server (which decides the rebalance) and the browser
// (which shows the user why) compute the same thing. Each protocol has its own
// profile across the factors a real engine would weigh (APY, incentives, risk,
// volatility, IL, gas), so the leader changes every so often — and the keeper
// sometimes moves, sometimes deliberately stays put.
//
// Two time signals are layered on each factor:
//   • a SLOW drift (period ~60–120s) — the decision signal, so the approved
//     leader changes a handful of times over a demo. `decisionScoreAt` uses it.
//   • a fast, small JITTER (period ~3–6s) — display-only liveliness, so the bars
//     and numbers visibly wobble ~2×/sec. `displayScoreAt` adds it on top.
// Decisions use the slow signal only, so they don't flip on jitter.

import { TESTNET_DEPLOYMENT as DEPLOYMENT, type ProtocolKey } from "./testnet";
import type { FundLocation } from "./vault-calls";

/** A real on-chain decision/move happens this often on testnet (~35s). */
export const DECISION_MS = 35_000;
/** A leader must beat the current spot by this many points to be worth a move. */
export const HYSTERESIS = 4;
/** Realistic mainnet cadence (~1 move/week) — used only for the gas estimate. */
export const MAINNET_MOVE_DAYS = 7;
/** Rough gas units for one cross-protocol rebalance (withdraw + supply + reimburse). */
export const MOVE_GAS_ESTIMATE = BigInt(300_000);
/** Jitter amplitude as a fraction of each factor's slow-drift amplitude. */
const JITTER_FRACTION = 0.1;

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

/** A presenter override for the demo controls: force a hold, or boost one key. */
export type DecisionOverride = { kind: "hold" } | { kind: "boost"; key: ProtocolKey };

/** Result of one keeper decision tick — the /api/keeper/tick response shape.
 *  Lives here (a secret-free module) so client code never imports the route. */
export type KeeperTickResult = {
  moved: boolean;
  location: FundLocation;
  from?: FundLocation;
  to?: ProtocolKey;
  hash?: `0x${string}`;
  /** Set on a "keeper_error" — the swallowed-but-surfaced failure message. */
  message?: string;
  reason:
    | "moved"
    | "stay"
    | "no_funds"
    | "no_approvals"
    | "not_delegated"
    | "needs_gas"
    | "needs_keeper_float"
    | "keeper_error"
    | "demo_boost"
    | "demo_hold";
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

/** Slow per-(protocol, factor) drift — the decision signal (period ~60–120s). */
function slowDrift(key: ProtocolKey, factor: string, tMs: number, amp: number): number {
  const phase = hash01(`${key}:${factor}:phase`) * Math.PI * 2;
  const periodMs = 60_000 + hash01(`${key}:${factor}:period`) * 60_000; // 60–120s
  return amp * Math.sin((tMs / periodMs) * Math.PI * 2 + phase);
}

/** Fast, small jitter layered on top for display liveliness (period ~3–6s). */
function jitter(key: ProtocolKey, factor: string, tMs: number, amp: number): number {
  const phase = hash01(`${key}:${factor}:jphase`) * Math.PI * 2;
  const periodMs = 3_000 + hash01(`${key}:${factor}:jperiod`) * 3_000; // 3–6s
  return amp * JITTER_FRACTION * Math.sin((tMs / periodMs) * Math.PI * 2 + phase);
}

function breakdownAt(key: ProtocolKey, tMs: number, withJitter: boolean): ScoreBreakdown {
  const base = BASE[key];
  const f = (factor: string, amp: number) =>
    slowDrift(key, factor, tMs, amp) + (withJitter ? jitter(key, factor, tMs, amp) : 0);
  return {
    apy: round1(clamp(base.apy + f("apy", 2.2), 0.5, 14)),
    incentives: round1(clamp(base.incentives + f("inc", 0.8), 0, 5)),
    risk: Math.round(clamp(base.risk + f("risk", 6), 2, 95)),
    volatility: Math.round(clamp(base.volatility + f("vol", 8), 2, 95)),
    il: Math.round(clamp(base.il + f("il", 2), 0, 60)),
    gas: Math.round(clamp(base.gas + f("gas", 5), 5, 90)),
  };
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

function scoreFrom(key: ProtocolKey, breakdown: ScoreBreakdown): ProtocolScore {
  return { key, breakdown, score: composite(breakdown), rationale: rationaleFor(key, breakdown) };
}

/** Lively score (slow drift + fast jitter) for the UI bars/numbers. */
export function displayScoreAt(key: ProtocolKey, tMs: number): ProtocolScore {
  return scoreFrom(key, breakdownAt(key, tMs, true));
}

/** Stable score (slow drift only) the keeper actually decides on. */
export function decisionScoreAt(key: ProtocolKey, tMs: number): ProtocolScore {
  return scoreFrom(key, breakdownAt(key, tMs, false));
}

/** All protocols' display scores at a time, ranked best-first (for the panel). */
export function allDisplayScoresAt(tMs: number): ProtocolScore[] {
  return DEPLOYMENT.protocols
    .map((p) => displayScoreAt(p.key, tMs))
    .sort((a, b) => b.score - a.score);
}

/** Best *approved* protocol by the stable decision score, or null if none approved. */
export function decisionLeader(approved: ProtocolKey[], tMs: number): ProtocolScore | null {
  const set = approved.filter((k) => KNOWN.has(k));
  if (set.length === 0) return null;
  return set.map((k) => decisionScoreAt(k, tMs)).sort((a, b) => b.score - a.score)[0];
}

export const msUntilNextDecision = (now: number = Date.now()) => DECISION_MS - (now % DECISION_MS);

/**
 * The keeper's decision: which approved protocol to hold at time `tMs`, or `null`
 * to stay put. A presenter `override` wins first — `hold` forces no move, `boost`
 * forces a specific approved target. Otherwise it picks the highest-scoring
 * *approved* protocol on the stable decision score, only moving an already-
 * invested position if the leader beats it by `HYSTERESIS` (no churn on tiny leads).
 */
export function decideTarget(
  location: FundLocation,
  approved: ProtocolKey[],
  tMs: number,
  override?: DecisionOverride,
): ProtocolKey | null {
  const set = approved.filter((k) => KNOWN.has(k));
  if (set.length === 0) return null;

  if (override?.kind === "hold") return null;
  if (override?.kind === "boost") {
    return set.includes(override.key) && override.key !== location ? override.key : null;
  }

  const ranked = set.map((k) => decisionScoreAt(k, tMs)).sort((a, b) => b.score - a.score);
  const leader = ranked[0];

  const inApproved =
    location !== "idle" && location !== "empty" && set.includes(location as ProtocolKey);

  if (inApproved) {
    if (leader.key === location) return null;
    const current = decisionScoreAt(location as ProtocolKey, tMs).score;
    if (leader.score - current < HYSTERESIS) return null;
    return leader.key;
  }
  // Idle, or parked in a protocol the user no longer approves → go to the leader.
  return leader.key;
}

/**
 * For a chosen ETH gas reserve at the live gas price, how many ~weekly mainnet
 * moves it covers and roughly how long that lasts. Display-only (the realistic
 * mainnet cadence, shown separately from the sped-up ~35s testnet demo).
 */
export function gasReserveEstimate(
  reserveWei: bigint,
  gasPriceWei: bigint,
): { moves: number; days: number } {
  const costPerMove = MOVE_GAS_ESTIMATE * gasPriceWei;
  if (costPerMove <= BigInt(0) || reserveWei <= BigInt(0)) return { moves: 0, days: 0 };
  const moves = Number(reserveWei) / Number(costPerMove);
  return { moves, days: moves * MAINNET_MOVE_DAYS };
}
