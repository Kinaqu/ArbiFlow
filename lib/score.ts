import type { NormalizedPool } from "./llama";

export type ScoreBreakdown = {
  apy: number;
  tvl: number;
  trust: number;
  stability: number;
  prediction: number;
};

export type ScoredPool = NormalizedPool & {
  score: number;
  breakdown: ScoreBreakdown;
  rationale: string;
};

export const SCORE_MAX: ScoreBreakdown = {
  apy: 40,
  tvl: 20,
  trust: 15,
  stability: 15,
  prediction: 10,
};

const APY_FULL = Math.log10(1 + 30);
const TVL_FULL = Math.log10(100_000_000);

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

function apyComponent(apy: number): number {
  if (!Number.isFinite(apy) || apy <= 0) return 0;
  const ratio = Math.log10(1 + apy) / APY_FULL;
  return SCORE_MAX.apy * Math.min(1, ratio);
}

function tvlComponent(tvlUsd: number): number {
  if (!Number.isFinite(tvlUsd) || tvlUsd <= 0) return 0;
  const ratio = Math.log10(Math.max(1, tvlUsd)) / TVL_FULL;
  return SCORE_MAX.tvl * Math.min(1, ratio);
}

function trustComponent(tier: NormalizedPool["tier"]): number {
  return tier === "core" ? SCORE_MAX.trust : 8;
}

function stabilityComponent(pool: NormalizedPool): number {
  return (pool.stablecoin ? 12 : 0) + (pool.ilRisk === "no" ? 3 : 0);
}

function predictionComponent(predictionUp: number): number {
  return SCORE_MAX.prediction * clamp(predictionUp, 0, 1);
}

function dominant(b: ScoreBreakdown): keyof ScoreBreakdown {
  let best: keyof ScoreBreakdown = "apy";
  let bestFill = -1;
  for (const k of Object.keys(b) as Array<keyof ScoreBreakdown>) {
    const fill = b[k] / SCORE_MAX[k];
    if (fill > bestFill) {
      bestFill = fill;
      best = k;
    }
  }
  return best;
}

function rationaleFor(pool: NormalizedPool, b: ScoreBreakdown): string {
  const tvlM = (pool.tvlUsd / 1_000_000).toFixed(pool.tvlUsd >= 10_000_000 ? 0 : 1);
  const apy = pool.apy.toFixed(2);
  switch (dominant(b)) {
    case "apy":
      return `Top APY (${apy}%) on ${pool.projectLabel} with $${tvlM}M TVL.`;
    case "tvl":
      return `Deep $${tvlM}M liquidity on ${pool.projectLabel} earning ${apy}%.`;
    case "trust":
      return `Blue-chip ${pool.projectLabel} pool, ${apy}% APY, $${tvlM}M TVL.`;
    case "stability":
      return `Stablecoin pool, zero IL, ${apy}% on ${pool.projectLabel}.`;
    case "prediction":
      return `DeFiLlama forecasts continued ${apy}% on ${pool.projectLabel}.`;
  }
}

export function scorePool(pool: NormalizedPool): ScoredPool {
  const breakdown: ScoreBreakdown = {
    apy: apyComponent(pool.apy),
    tvl: tvlComponent(pool.tvlUsd),
    trust: trustComponent(pool.tier),
    stability: stabilityComponent(pool),
    prediction: predictionComponent(pool.predictionUp),
  };
  const raw =
    breakdown.apy +
    breakdown.tvl +
    breakdown.trust +
    breakdown.stability +
    breakdown.prediction;
  const score = Math.round(raw * 10) / 10;
  return {
    ...pool,
    score,
    breakdown,
    rationale: rationaleFor(pool, breakdown),
  };
}
