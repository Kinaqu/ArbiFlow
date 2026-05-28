// Single source of truth for the DeFiLlama → domain transform.
// Imported by both lib/llama.ts (runtime) and scripts/generate-snapshot.ts
// (offline snapshot generator) so the curation/normalization logic can never
// drift between them. Pure: no snapshot import, no network.

import { portalMetaFor, PORTAL_PROJECTS, type PortalCategory } from "./portal";

export const CURATED_PROJECTS = new Set([
  "aave-v3",
  "radiant-v2",
  "gmx-v2-perps",
  "camelot-v3",
  "uniswap-v3",
  "pendle",
  "curve-dex",
  "compound-v3",
]);

const ICON_BASE = "/icons/protocols";

const PROJECT_LABELS: Record<string, string> = {
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

export type PoolTier = "core" | "honorable";

export type NormalizedPool = {
  id: string;
  project: string;
  projectLabel: string;
  chain: "Arbitrum";
  symbol: string;
  symbols: string[];
  tvlUsd: number;
  apy: number;
  apyBase: number;
  apyReward: number;
  stablecoin: boolean;
  ilRisk: "no" | "yes";
  exposure: "single" | "multi";
  predictionUp: number;
  tier: PoolTier;
  iconPath: string;
  portalFeatured: boolean;
  portalCategory: PortalCategory | null;
};

export type RawPool = {
  pool: string;
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number | null;
  apy: number | null;
  apyBase: number | null;
  apyReward: number | null;
  stablecoin: boolean | null;
  ilRisk: string | null;
  exposure: string | null;
  predictions: {
    predictedClass: string | null;
    predictedProbability: number | null;
  } | null;
};

export type LlamaResponse = { status?: string; data?: RawPool[] };

const finite = (n: number | null | undefined): number =>
  Number.isFinite(n) ? (n as number) : 0;

export function labelFor(project: string): string {
  if (PROJECT_LABELS[project]) return PROJECT_LABELS[project];
  return project
    .split("-")
    .map((p) => (p.length ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

export function parseSymbols(symbol: string | null | undefined): string[] {
  return String(symbol ?? "")
    .split(/[-/]/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

export function normalize(raw: RawPool): NormalizedPool {
  const tier: PoolTier = CURATED_PROJECTS.has(raw.project) ? "core" : "honorable";
  const predictionUp =
    raw.predictions && raw.predictions.predictedClass === "Stable/Up"
      ? Number(raw.predictions.predictedProbability ?? 0) / 100
      : 0;
  const symbols = parseSymbols(raw.symbol);
  const { portalFeatured, portalCategory } = portalMetaFor(raw.project, symbols);
  return {
    id: raw.pool,
    project: raw.project,
    projectLabel: labelFor(raw.project),
    chain: "Arbitrum",
    symbol: raw.symbol,
    symbols,
    tvlUsd: Number(raw.tvlUsd ?? 0),
    apy: finite(raw.apy),
    apyBase: finite(raw.apyBase),
    apyReward: finite(raw.apyReward),
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

export function selectPools(rawPools: RawPool[]): NormalizedPool[] {
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
        Number(p.apy ?? 0) > 0 &&
        Number(p.apy ?? 0) <= HONORABLE_MAX_APY &&
        p.ilRisk !== "yes",
    )
    .sort((a, b) => Number(b.tvlUsd ?? 0) - Number(a.tvlUsd ?? 0))
    .slice(0, HONORABLE_LIMIT);
  return [...core, ...portalExtra, ...honorable].map(normalize);
}
