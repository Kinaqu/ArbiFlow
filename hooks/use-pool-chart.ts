"use client";

import { useQuery } from "@tanstack/react-query";
import type { PoolChartResponse } from "@/app/api/pool-chart/route";

export function usePoolChart(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ["pool-chart", id],
    queryFn: async (): Promise<PoolChartResponse> => {
      const res = await fetch(`/api/pool-chart?id=${id}`);
      if (!res.ok) throw new Error(`pool chart failed (${res.status})`);
      return res.json() as Promise<PoolChartResponse>;
    },
    enabled,
    staleTime: 60 * 60_000,
    retry: 1,
  });
}
