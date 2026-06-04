"use client";

import { useCallback, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

// App-level network mode. Mainnet is the live intelligence layer (scan → ranked
// pools → direct deposit); Testnet is the non-custodial vault demo on Arbitrum
// Sepolia (faucet → vault → rebalance across protocols). Backed by a tiny
// localStorage store via useSyncExternalStore so the choice persists and every
// consumer stays in sync — without an effect or a hydration mismatch.

export type NetworkMode = "mainnet" | "testnet";

const STORAGE_KEY = "arbiflow:network-mode";
const listeners = new Set<() => void>();

function read(): NetworkMode {
  if (typeof window === "undefined") return "mainnet";
  return window.localStorage.getItem(STORAGE_KEY) === "testnet"
    ? "testnet"
    : "mainnet";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb); // sync across tabs
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useNetworkMode() {
  const mode = useSyncExternalStore(
    subscribe,
    read,
    () => "mainnet" as NetworkMode,
  );
  const setMode = useCallback((m: NetworkMode) => {
    window.localStorage.setItem(STORAGE_KEY, m);
    listeners.forEach((l) => l());
  }, []);
  return { mode, setMode };
}

const OPTIONS: { mode: NetworkMode; label: string; sub: string }[] = [
  { mode: "mainnet", label: "Mainnet", sub: "live" },
  { mode: "testnet", label: "Testnet", sub: "sepolia" },
];

export function NetworkToggle({ className = "" }: { className?: string }) {
  const { mode, setMode } = useNetworkMode();
  return (
    <div
      role="tablist"
      aria-label="Network mode"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-surface/70 p-0.5 backdrop-blur-xl",
        className,
      )}
    >
      {OPTIONS.map((o) => {
        const active = mode === o.mode;
        return (
          <button
            key={o.mode}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setMode(o.mode)}
            className={cn(
              "rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors",
              active ? "bg-accent text-white" : "text-muted hover:text-foreground",
            )}
          >
            {o.label}
            <span className={active ? "text-white/60" : "text-muted/60"}>
              {" "}
              · {o.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}
