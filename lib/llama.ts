import snapshotJson from "./data/arbitrum-pools-snapshot.json";
import {
  selectPools,
  type LlamaResponse,
  type NormalizedPool,
} from "./pool-select";

export type { NormalizedPool, PoolTier } from "./pool-select";

export type PoolFetchResult = {
  pools: NormalizedPool[];
  source: "live" | "snapshot";
  generatedAt: string;
};

type SnapshotShape = { pools: NormalizedPool[]; generatedAt: string };

const snapshot = snapshotJson as SnapshotShape;

function fromSnapshot(): PoolFetchResult {
  return {
    pools: snapshot.pools,
    source: "snapshot",
    generatedAt: snapshot.generatedAt,
  };
}

// Every selected pool reading zero APY and zero TVL is a strong signal the
// upstream response shape changed (e.g. a renamed field silently parsing to 0)
// rather than a real market state — treat it as a failed fetch.
function isDegenerate(pools: NormalizedPool[]): boolean {
  return pools.every((p) => p.apy === 0 && p.tvlUsd === 0);
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
    if (!Array.isArray(json.data)) {
      console.warn(
        "[opportunities] DeFiLlama response missing `data` array, serving snapshot",
      );
      return fromSnapshot();
    }
    const pools = selectPools(json.data);
    if (pools.length === 0 || isDegenerate(pools)) {
      console.warn(
        "[opportunities] DeFiLlama returned no usable Arbitrum pools, serving snapshot",
      );
      return fromSnapshot();
    }
    return {
      pools,
      source: "live",
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(
      "[opportunities] live DeFiLlama fetch failed, serving snapshot:",
      err,
    );
    return fromSnapshot();
  }
}
