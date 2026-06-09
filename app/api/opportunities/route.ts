import { NextResponse } from "next/server";
import { fetchArbitrumPools } from "@/lib/llama";
import { scorePool, type ScoredPool } from "@/lib/score";
import { withPublicApi, corsPreflight } from "@/lib/api-auth";

export const runtime = "nodejs";
// API-key gating reads request headers, so the route is dynamic. The heavy
// upstream pool fetch stays cached in lib/llama (next: { revalidate: 300 }), and
// the response keeps its CDN cache-control hint.
export const dynamic = "force-dynamic";

export type OpportunitiesApiResponse = {
  pools: ScoredPool[];
  generatedAt: string;
  source: "live" | "snapshot";
};

export const GET = withPublicApi(async () => {
  try {
    const { pools, source, generatedAt } = await fetchArbitrumPools();
    const scored = pools
      .map(scorePool)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.tvlUsd !== a.tvlUsd) return b.tvlUsd - a.tvlUsd;
        return a.id.localeCompare(b.id);
      });
    const body: OpportunitiesApiResponse = {
      pools: scored,
      generatedAt,
      source,
    };
    return NextResponse.json(body, {
      headers: {
        "cache-control": "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "opportunities_failed" },
      { status: 502 },
    );
  }
});

export function OPTIONS() {
  return corsPreflight();
}
