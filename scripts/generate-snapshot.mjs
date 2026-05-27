// One-shot snapshot generator. Re-run before demo for fresh data:
//   node scripts/generate-snapshot.mjs
//
// Output: lib/data/arbitrum-pools-snapshot.json
// Shape: { pools: NormalizedPool[], generatedAt: string }
// Keep this filter logic in sync with lib/llama.ts.

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CURATED_PROJECTS = new Set([
  "aave-v3",
  "radiant-v2",
  "gmx-v2-perps",
  "camelot-v3",
  "uniswap-v3",
  "pendle",
  "curve-dex",
  "compound-v3",
]);

// Mirror of lib/portal.ts — keep in sync.
const PORTAL_BASE_CATEGORY = {
  "aave-v3": "lending",
  "morpho-blue": "lending",
  "fluid-lending": "lending",
  "compound-v3": "lending",
  pendle: "fixed-yield",
};
const PORTAL_PROJECTS = new Set(Object.keys(PORTAL_BASE_CATEGORY));
const LST_SYMBOLS = new Set([
  "WSTETH", "WEETH", "RSETH", "EZETH", "STETH", "RETH", "CBETH", "ETH+",
]);

const ICON_BASE = "/icons/protocols";

const PROJECT_LABELS = {
  "aave-v3": "Aave V3",
  "radiant-v2": "Radiant V2",
  "gmx-v2-perps": "GMX V2",
  "camelot-v3": "Camelot V3",
  "uniswap-v3": "Uniswap V3",
  pendle: "Pendle",
  "curve-dex": "Curve",
  "compound-v3": "Compound V3",
};

const HONORABLE_MIN_TVL = 5_000_000;
const HONORABLE_MAX_APY = 50;
const HONORABLE_LIMIT = 12;

function labelFor(project) {
  if (PROJECT_LABELS[project]) return PROJECT_LABELS[project];
  return project
    .split("-")
    .map((p) => (p.length ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

function parseSymbols(symbol) {
  return String(symbol ?? "")
    .split(/[-/]/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

function normalize(raw) {
  const tier = CURATED_PROJECTS.has(raw.project) ? "core" : "honorable";
  const apy = Number.isFinite(raw.apy) ? raw.apy : 0;
  const apyBase = Number.isFinite(raw.apyBase) ? raw.apyBase : 0;
  const apyReward = Number.isFinite(raw.apyReward) ? raw.apyReward : 0;
  const predictionUp =
    raw.predictions && raw.predictions.predictedClass === "Stable/Up"
      ? Number(raw.predictions.predictedProbability ?? 0) / 100
      : 0;
  const symbols = parseSymbols(raw.symbol);
  const portalFeatured = PORTAL_PROJECTS.has(raw.project);
  let portalCategory = null;
  if (portalFeatured) {
    const isLst = symbols.some((s) => LST_SYMBOLS.has(s));
    portalCategory = isLst ? "liquid-staking" : PORTAL_BASE_CATEGORY[raw.project];
  }
  return {
    id: raw.pool,
    project: raw.project,
    projectLabel: labelFor(raw.project),
    chain: "Arbitrum",
    symbol: raw.symbol,
    symbols,
    tvlUsd: Number(raw.tvlUsd ?? 0),
    apy,
    apyBase,
    apyReward,
    stablecoin: Boolean(raw.stablecoin),
    ilRisk: raw.ilRisk === "yes" ? "yes" : "no",
    exposure: raw.exposure === "multi" ? "multi" : "single",
    predictionUp,
    tier,
    iconPath: `${ICON_BASE}/${raw.project}.png`,
    portalFeatured,
    portalCategory,
  };
}

function selectPools(rawPools) {
  const arb = rawPools.filter((p) => p.chain === "Arbitrum");

  const core = arb.filter((p) => CURATED_PROJECTS.has(p.project));

  const portalExtra = arb.filter(
    (p) =>
      !CURATED_PROJECTS.has(p.project) && PORTAL_PROJECTS.has(p.project),
  );

  const honorable = arb
    .filter(
      (p) =>
        !CURATED_PROJECTS.has(p.project) &&
        !PORTAL_PROJECTS.has(p.project) &&
        Number(p.tvlUsd ?? 0) >= HONORABLE_MIN_TVL &&
        Number(p.apy ?? 0) <= HONORABLE_MAX_APY &&
        Number(p.apy ?? 0) > 0 &&
        p.ilRisk !== "yes",
    )
    .sort((a, b) => Number(b.tvlUsd ?? 0) - Number(a.tvlUsd ?? 0))
    .slice(0, HONORABLE_LIMIT);

  return [...core, ...portalExtra, ...honorable].map(normalize);
}

async function main() {
  console.log("Fetching DeFiLlama yields…");
  const res = await fetch("https://yields.llama.fi/pools");
  if (!res.ok) {
    throw new Error(`DeFiLlama responded ${res.status}`);
  }
  const json = await res.json();
  const data = Array.isArray(json?.data) ? json.data : [];
  console.log(`Got ${data.length} pools, filtering to Arbitrum curated + honorable…`);

  const arb = data.filter((p) => p.chain === "Arbitrum");
  const projectCounts = arb.reduce((acc, p) => {
    acc[p.project] = (acc[p.project] ?? 0) + 1;
    return acc;
  }, {});
  const topProjects = Object.entries(projectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25);
  console.log("Top Arbitrum projects by pool count:");
  for (const [p, n] of topProjects) {
    const mark = CURATED_PROJECTS.has(p) ? " ✓ curated" : "";
    console.log(`  ${n.toString().padStart(4)}  ${p}${mark}`);
  }

  const pools = selectPools(data);

  const here = dirname(fileURLToPath(import.meta.url));
  const outPath = resolve(here, "..", "lib", "data", "arbitrum-pools-snapshot.json");
  await mkdir(dirname(outPath), { recursive: true });
  const payload = { pools, generatedAt: new Date().toISOString() };
  await writeFile(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");

  const coreCount = pools.filter((p) => p.tier === "core").length;
  const honorableCount = pools.filter((p) => p.tier === "honorable").length;
  console.log(
    `\nWrote ${pools.length} pools (${coreCount} core, ${honorableCount} honorable) to ${outPath}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
