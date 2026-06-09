"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ScanResult } from "@/lib/scan";
import {
  buildOpportunities,
  type OpportunitiesResponse,
} from "@/lib/opportunities";
import type { OpportunitiesApiResponse } from "@/app/api/opportunities/route";
import { publishableApiHeaders } from "@/lib/api-key";

async function fetchOpportunities(): Promise<OpportunitiesApiResponse> {
  const res = await fetch("/api/opportunities", { headers: publishableApiHeaders() });
  if (!res.ok) {
    throw new Error(`opportunities failed (${res.status})`);
  }
  return res.json() as Promise<OpportunitiesApiResponse>;
}

export function useOpportunities(
  scan: ScanResult | undefined,
  enabled: boolean,
) {
  const q = useQuery({
    queryKey: ["opportunities"],
    queryFn: fetchOpportunities,
    enabled,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const data = useMemo<OpportunitiesResponse | undefined>(() => {
    if (!q.data) return undefined;
    const { perToken, pools } = buildOpportunities(q.data.pools, scan ?? null);
    return {
      perToken,
      pools,
      generatedAt: q.data.generatedAt,
      source: q.data.source,
    };
  }, [q.data, scan]);

  return {
    data,
    isLoading: q.isLoading,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
  };
}
