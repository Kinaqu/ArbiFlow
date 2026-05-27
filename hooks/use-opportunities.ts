"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ScanResult } from "@/lib/scan";
import {
  buildOpportunities,
  type OpportunitiesResponse,
} from "@/lib/opportunities";
import type { OpportunitiesApiResponse } from "@/app/api/opportunities/route";

async function fetchOpportunities(): Promise<OpportunitiesApiResponse> {
  const res = await fetch("/api/opportunities");
  if (!res.ok) {
    throw new Error(`opportunities failed (${res.status})`);
  }
  return res.json() as Promise<OpportunitiesApiResponse>;
}

export function useOpportunities(scan: ScanResult | undefined) {
  const q = useQuery({
    queryKey: ["opportunities"],
    queryFn: fetchOpportunities,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const data = useMemo<OpportunitiesResponse | undefined>(() => {
    if (!q.data) return undefined;
    const { perToken, explore } = buildOpportunities(
      q.data.pools,
      scan ?? null,
    );
    return {
      perToken,
      explore,
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
