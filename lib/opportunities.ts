import type { ScanResult } from "./scan";
import type { ScoredPool } from "./score";
import type { PortalCategory } from "./portal";

// USDC ↔ USDC.e are functionally interchangeable for yield-seeking;
// matches via synonym are flagged with requiresSwap so UI can badge them.
const SYMBOL_SYNONYMS: Record<string, string[]> = {
  USDC: ["USDC", "USDC.E"],
  "USDC.E": ["USDC", "USDC.E"],
};

const PER_TOKEN_LIMIT = 3;
const EXPLORE_LIMIT = 10;
const PORTAL_PER_CATEGORY = 3;

export type MatchedPool = ScoredPool & { requiresSwap: boolean };

export type OpportunitySet = {
  symbol: string;
  balanceUsd: number;
  topPools: MatchedPool[];
};

export type PortalCategoryGroup = {
  category: PortalCategory;
  pools: ScoredPool[];
};

export type OpportunitiesResponse = {
  perToken: OpportunitySet[];
  portal: PortalCategoryGroup[];
  explore: ScoredPool[];
  generatedAt: string;
  source: "live" | "snapshot";
};

function compareScored(a: ScoredPool, b: ScoredPool): number {
  if (b.score !== a.score) return b.score - a.score;
  if (b.tvlUsd !== a.tvlUsd) return b.tvlUsd - a.tvlUsd;
  return a.id.localeCompare(b.id);
}

function buildPortalGroups(sorted: ScoredPool[]): PortalCategoryGroup[] {
  const order: PortalCategory[] = ["lending", "liquid-staking", "fixed-yield"];
  const byCategory = new Map<PortalCategory, ScoredPool[]>();
  for (const cat of order) byCategory.set(cat, []);
  for (const pool of sorted) {
    if (!pool.portalFeatured || !pool.portalCategory) continue;
    const bucket = byCategory.get(pool.portalCategory);
    if (!bucket || bucket.length >= PORTAL_PER_CATEGORY) continue;
    bucket.push(pool);
  }
  return order
    .map((category) => ({ category, pools: byCategory.get(category) ?? [] }))
    .filter((g) => g.pools.length > 0);
}

export function buildOpportunities(
  scoredPools: ScoredPool[],
  scan: ScanResult | null,
): {
  perToken: OpportunitySet[];
  portal: PortalCategoryGroup[];
  explore: ScoredPool[];
} {
  const sorted = [...scoredPools].sort(compareScored);
  const explore = sorted.slice(0, EXPLORE_LIMIT);
  const portal = buildPortalGroups(sorted);

  if (!scan) {
    return { perToken: [], portal, explore };
  }

  const perToken: OpportunitySet[] = [];
  for (const token of scan.tokens) {
    if (!token.idle) continue;
    const symbolUp = token.symbol.toUpperCase();
    const synonyms = SYMBOL_SYNONYMS[symbolUp] ?? [symbolUp];
    const synSet = new Set(synonyms);

    const matched: MatchedPool[] = [];
    for (const pool of sorted) {
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

  return { perToken, portal, explore };
}
