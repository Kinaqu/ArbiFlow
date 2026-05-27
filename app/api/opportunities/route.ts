import { NextResponse } from "next/server";
import { fetchArbitrumPools } from "@/lib/llama";
import { scorePool, type ScoredPool } from "@/lib/score";

export const runtime = "nodejs";
export const revalidate = 300;

export type OpportunitiesApiResponse = {
  pools: ScoredPool[];
  generatedAt: string;
  source: "live" | "snapshot";
};

export async function GET() {
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
}
