"use client";

import { useSyncExternalStore } from "react";

// Lightweight client-side store of "deployed" positions (mostly simulated in
// the demo), persisted to localStorage. Powers the /portfolio payoff screen.

export type Position = {
  id: string;
  poolId: string;
  project: string;
  projectLabel: string;
  symbol: string;
  amountUsd: number;
  apy: number;
  simulated: boolean;
  ts: number;
};

const KEY = "arbiflow:positions";
const EMPTY: Position[] = [];

let cache: Position[] | null = null;
const listeners = new Set<() => void>();

function read(): Position[] {
  if (cache) return cache;
  if (typeof window === "undefined") {
    cache = EMPTY;
    return cache;
  }
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]") as Position[];
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: Position[]) {
  cache = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

export function addPosition(p: Omit<Position, "id" | "ts">) {
  const pos: Position = { ...p, id: `${p.poolId}-${Date.now()}`, ts: Date.now() };
  write([pos, ...read()]);
}

export function clearPositions() {
  write([]);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function usePositions(): Position[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
