import type { ScanResult } from "./scan";
import type { ScoredPool } from "./score";

// USDC ↔ USDC.e are functionally interchangeable for yield-seeking;
// matches via synonym are flagged with requiresSwap so UI can badge them.
const SYMBOL_SYNONYMS: Record<string, string[]> = {
  USDC: ["USDC", "USDC.E"],
  "USDC.E": ["USDC", "USDC.E"],
};

const PER_TOKEN_LIMIT = 3;

export type MatchedPool = ScoredPool & { requiresSwap: boolean };

export type OpportunitySet = {
  symbol: string;
  balanceUsd: number;
  topPools: MatchedPool[];
};

export type OpportunitiesResponse = {
  perToken: OpportunitySet[];
  pools: ScoredPool[];
  generatedAt: string;
  source: "live" | "snapshot";
};

function compareScored(a: ScoredPool, b: ScoredPool): number {
  if (b.score !== a.score) return b.score - a.score;
  if (b.tvlUsd !== a.tvlUsd) return b.tvlUsd - a.tvlUsd;
  return a.id.localeCompare(b.id);
}

export function buildOpportunities(
  scoredPools: ScoredPool[],
  scan: ScanResult | null,
): {
  perToken: OpportunitySet[];
  pools: ScoredPool[];
} {
  const pools = [...scoredPools].sort(compareScored);

  if (!scan) {
    return { perToken: [], pools };
  }

  const perToken: OpportunitySet[] = [];
  for (const token of scan.tokens) {
    if (!token.idle) continue;
    const symbolUp = token.symbol.toUpperCase();
    const synonyms = SYMBOL_SYNONYMS[symbolUp] ?? [symbolUp];
    const synSet = new Set(synonyms);

    const matched: MatchedPool[] = [];
    for (const pool of pools) {
      const hit = pool.symbols.some((s) => synSet.has(s));
      if (!hit) continue;
      matched.push({
        ...pool,
        requiresSwap: !pool.symbols.includes(symbolUp),
      });
      if (matched.length >= PER_TOKEN_LIMIT) break;
    }

    if (matched.length > 0) {
      perToken.push({
        symbol: token.symbol,
        balanceUsd: token.usdValue ?? 0,
        topPools: matched,
      });
    }
  }

  return { perToken, pools };
}
