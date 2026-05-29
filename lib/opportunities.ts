import type { ScannedToken, ScanResult } from "./scan";
import type { ScoredPool } from "./score";
import type { ChainKey } from "./tokens";

// USDC ↔ USDC.e ↔ USDbC are functionally interchangeable for yield-seeking;
// matches via synonym are flagged with requiresSwap so the UI can badge them.
const SYMBOL_SYNONYMS: Record<string, string[]> = {
  USDC: ["USDC", "USDC.E"],
  "USDC.E": ["USDC", "USDC.E"],
  USDBC: ["USDC", "USDC.E"],
};

const PER_TOKEN_LIMIT = 3;

export type MatchedPool = ScoredPool & { requiresSwap: boolean };

// Where an idle symbol is held. Arbitrum sources can deposit directly; Base /
// Optimism sources must bridge to Arbitrum first.
export type SourceChain = {
  chain: ChainKey;
  chainId: number;
  usd: number;
  balanceFormatted: number;
  token: ScannedToken;
};

export type OpportunitySet = {
  symbol: string;
  balanceUsd: number;
  sourceChains: SourceChain[];
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

  // Aggregate idle holdings by symbol — the same asset can sit idle on Arbitrum,
  // Base and Optimism at once. Each symbol becomes one opportunity, tracking the
  // per-chain sources behind it (Arbitrum = deposit-ready, L2s = bridge first).
  const bySymbol = new Map<string, SourceChain[]>();
  const orderedSymbols: string[] = [];
  for (const token of scan.tokens) {
    if (!token.idle) continue;
    const symbolUp = token.symbol.toUpperCase();
    if (!bySymbol.has(symbolUp)) {
      bySymbol.set(symbolUp, []);
      orderedSymbols.push(token.symbol);
    }
    bySymbol.get(symbolUp)!.push({
      chain: token.chain,
      chainId: token.chainId,
      usd: token.usdValue ?? 0,
      balanceFormatted: token.balanceFormatted,
      token,
    });
  }

  // Arbitrum first within a symbol so the UI defaults to the deposit-ready source.
  const chainRank: Record<ChainKey, number> = {
    arbitrum: 0,
    base: 1,
    optimism: 2,
  };

  const perToken: OpportunitySet[] = [];
  for (const displaySymbol of orderedSymbols) {
    const symbolUp = displaySymbol.toUpperCase();
    const sources = bySymbol
      .get(symbolUp)!
      .sort((a, b) => chainRank[a.chain] - chainRank[b.chain]);

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
        symbol: displaySymbol,
        balanceUsd: sources.reduce((s, c) => s + c.usd, 0),
        sourceChains: sources,
        topPools: matched,
      });
    }
  }

  return { perToken, pools };
}
