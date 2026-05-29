import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 3600;

type LlamaChart = {
  status?: string;
  data?: Array<{ timestamp: string; apy: number | null; tvlUsd: number | null }>;
};

export type PoolChartPoint = { t: number; apy: number; tvlUsd: number };
export type PoolChartResponse = { points: PoolChartPoint[] };

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  // DeFiLlama pool ids are uuids — validate to avoid passing arbitrary paths.
  if (!id || !/^[a-zA-Z0-9-]+$/.test(id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://yields.llama.fi/chart/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`llama ${res.status}`);
    const json = (await res.json()) as LlamaChart;
    const data = Array.isArray(json.data) ? json.data : [];
    const points: PoolChartPoint[] = data
      .map((d) => ({
        t: Date.parse(d.timestamp),
        apy: Number(d.apy ?? 0),
        tvlUsd: Number(d.tvlUsd ?? 0),
      }))
      .filter((p) => Number.isFinite(p.t))
      .slice(-90);

    return NextResponse.json({ points } satisfies PoolChartResponse, {
      headers: {
        "cache-control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("[pool-chart] DeFiLlama chart fetch failed:", err);
    return NextResponse.json({ error: "pool_chart_failed" }, { status: 502 });
  }
}
