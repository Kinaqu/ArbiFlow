// Minimal deterministic checks on the scoring engine.
// Re-implements scorePool in plain JS (mirrors lib/score.ts) so we can
// validate without a TS test runner. If you change one, update the other.

import test from "node:test";
import assert from "node:assert/strict";

const SCORE_MAX = { apy: 40, tvl: 20, trust: 15, stability: 15, prediction: 10 };
const APY_FULL = Math.log10(1 + 30);
const TVL_FULL = Math.log10(100_000_000);
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function scorePool(p) {
  const apy = p.apy > 0 ? SCORE_MAX.apy * Math.min(1, Math.log10(1 + p.apy) / APY_FULL) : 0;
  const tvl = p.tvlUsd > 0 ? SCORE_MAX.tvl * Math.min(1, Math.log10(Math.max(1, p.tvlUsd)) / TVL_FULL) : 0;
  const trust = p.tier === "core" ? 15 : 8;
  const stability = (p.stablecoin ? 12 : 0) + (p.ilRisk === "no" ? 3 : 0);
  const prediction = SCORE_MAX.prediction * clamp(p.predictionUp, 0, 1);
  const raw = apy + tvl + trust + stability + prediction;
  return Math.round(raw * 10) / 10;
}

const aaveStable = {
  apy: 5,
  tvlUsd: 50_000_000,
  tier: "core",
  stablecoin: true,
  ilRisk: "no",
  predictionUp: 0.8,
};

const wildPool = {
  apy: 1000,
  tvlUsd: 10_000,
  tier: "honorable",
  stablecoin: false,
  ilRisk: "yes",
  predictionUp: 0,
};

test("stable blue-chip pool scores high", () => {
  const s = scorePool(aaveStable);
  console.log("  Aave stable score:", s);
  assert.ok(s >= 70, `expected >= 70, got ${s}`);
});

test("APY cap limits wild outliers", () => {
  const s = scorePool(wildPool);
  console.log("  Wild 1000% APY score:", s);
  assert.ok(s <= 60, `expected <= 60, got ${s}`);
});

test("scoring is deterministic", () => {
  assert.equal(scorePool(aaveStable), scorePool(aaveStable));
  assert.equal(scorePool(wildPool), scorePool(wildPool));
});
