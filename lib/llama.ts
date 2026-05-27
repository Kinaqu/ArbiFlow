import snapshotJson from "./data/arbitrum-pools-snapshot.json";

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
};

export type PoolFetchResult = {
  pools: NormalizedPool[];
  source: "live" | "snapshot";
  generatedAt: string;
};

type RawPool = {
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

type LlamaResponse = { status?: string; data?: RawPool[] };

type SnapshotShape = { pools: NormalizedPool[]; generatedAt: string };

const snapshot = snapshotJson as SnapshotShape;

function labelFor(project: string): string {
  if (PROJECT_LABELS[project]) return PROJECT_LABELS[project];
  return project
    .split("-")
    .map((p) => (p.length ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

function parseSymbols(symbol: string | null | undefined): string[] {
  return String(symbol ?? "")
    .split(/[-/]/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

function normalize(raw: RawPool): NormalizedPool {
  const tier: PoolTier = CURATED_PROJECTS.has(raw.project) ? "core" : "honorable";
  const predictionUp =
    raw.predictions && raw.predictions.predictedClass === "Stable/Up"
      ? Number(raw.predictions.predictedProbability ?? 0) / 100
      : 0;
  return {
    id: raw.pool,
    project: raw.project,
    projectLabel: labelFor(raw.project),
    chain: "Arbitrum",
    symbol: raw.symbol,
    symbols: parseSymbols(raw.symbol),
    tvlUsd: Number(raw.tvlUsd ?? 0),
    apy: Number(raw.apy ?? 0),
    apyBase: Number(raw.apyBase ?? 0),
    apyReward: Number(raw.apyReward ?? 0),
    stablecoin: Boolean(raw.stablecoin),
    ilRisk: raw.ilRisk === "yes" ? "yes" : "no",
    exposure: raw.exposure === "multi" ? "multi" : "single",
    predictionUp,
    tier,
  };
}

function selectPools(rawPools: RawPool[]): NormalizedPool[] {
  const arb = rawPools.filter((p) => p.chain === "Arbitrum");
  const core = arb.filter((p) => CURATED_PROJECTS.has(p.project));
  const honorable = arb
    .filter(
      (p) =>
        !CURATED_PROJECTS.has(p.project) &&
        Number(p.tvlUsd ?? 0) >= HONORABLE_MIN_TVL &&
        Number(p.apy ?? 0) > 0 &&
        Number(p.apy ?? 0) <= HONORABLE_MAX_APY &&
        p.ilRisk !== "yes",
    )
    .sort((a, b) => Number(b.tvlUsd ?? 0) - Number(a.tvlUsd ?? 0))
    .slice(0, HONORABLE_LIMIT);
  return [...core, ...honorable].map(normalize);
}

function fromSnapshot(): PoolFetchResult {
  return {
    pools: snapshot.pools,
    source: "snapshot",
    generatedAt: snapshot.generatedAt,
  };
}

export async function fetchArbitrumPools(): Promise<PoolFetchResult> {
  if (process.env.ARBITRUM_FORCE_SNAPSHOT === "1") {
    return fromSnapshot();
  }
  try {
    const res = await fetch("https://yields.llama.fi/pools", {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`llama ${res.status}`);
    const json = (await res.json()) as LlamaResponse;
    const data = Array.isArray(json.data) ? json.data : [];
    const pools = selectPools(data);
    if (pools.length === 0) return fromSnapshot();
    return {
      pools,
      source: "live",
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return fromSnapshot();
  }
}
