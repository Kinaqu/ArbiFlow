"use client";

import { useQuery } from "@tanstack/react-query";
import type { ScanResult } from "@/lib/scan";

async function fetchScan(address: string): Promise<ScanResult> {
  const res = await fetch(`/api/scan?address=${address}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `scan failed (${res.status})`);
  }
  return res.json() as Promise<ScanResult>;
}

export function useScan(address: string | undefined) {
  return useQuery({
    queryKey: ["scan", address],
    queryFn: () => fetchScan(address!),
    enabled: !!address,
    staleTime: 60_000,
    retry: 1,
  });
}
