"use client";

import { useCallback, useState } from "react";
import { parseUnits } from "viem";
import type { ScannedToken } from "@/lib/scan";
import type { ScoredPool } from "@/lib/score";
import { isAaveExecutable } from "@/lib/aave";
import { RELAY_NATIVE } from "@/lib/relay";
import { useBridge } from "./use-bridge";
import { useExecute, type ExecMode } from "./use-execute";

// Orchestrates the one-click "bring & deposit": bridge an L2 asset to Arbitrum
// via Relay (leg 1), then deposit the arrival into the chosen pool (leg 2).
// Composes useBridge + useExecute — no duplicated tx logic.

export type RoutePhase =
  | "idle"
  | "quoting"
  | "quoted"
  | "bridging"
  | "bridged"
  | "depositing"
  | "done"
  | "error";

export type RouteQuoteArgs = {
  source: ScannedToken;
  amount: bigint;
  amountUsd: number;
  simulate: boolean;
};

export type RouteRunArgs = {
  source: ScannedToken;
  pool: ScoredPool;
  simulate: boolean;
};

export function useRoute() {
  const bridge = useBridge();
  const deposit = useExecute();
  const [phase, setPhase] = useState<RoutePhase>("idle");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhase("idle");
    setError(null);
    bridge.reset();
    deposit.reset();
  }, [bridge, deposit]);

  const requestQuote = useCallback(
    async (a: RouteQuoteArgs) => {
      setError(null);
      setPhase("quoting");
      const originCurrency =
        a.source.address === "native" ? RELAY_NATIVE : a.source.address;
      const q = await bridge.requestQuote({
        originChainId: a.source.chainId,
        originCurrency,
        amountWei: a.amount.toString(),
        symbol: a.source.symbol,
        amountUsd: a.amountUsd,
        simulate: a.simulate,
      });
      if (!q) {
        setPhase("error");
        return null;
      }
      setPhase("quoted");
      return q;
    },
    [bridge],
  );

  const run = useCallback(
    async (a: RouteRunArgs) => {
      setError(null);
      const quote = bridge.quote;
      if (!quote) {
        setError("Request a quote first");
        setPhase("error");
        return;
      }

      // Leg 1 — bridge to Arbitrum.
      setPhase("bridging");
      const bridged = await bridge.execute({
        originChainId: a.source.chainId,
        simulate: a.simulate,
      });
      if (!bridged) {
        setError(bridge.error ?? "Bridge failed");
        setPhase("error");
        return;
      }
      setPhase("bridged");

      // Leg 2 — deposit the arrival into the target pool.
      const destToken = quote.destToken;
      if (destToken.address === "native") {
        // Native ETH can't be supplied directly — funds are home, stop here.
        setPhase("done");
        return;
      }
      const recv = quote.fees.minReceived;
      const amount = parseUnits(
        recv ? recv.toFixed(destToken.decimals) : "0",
        destToken.decimals,
      );
      const mode: ExecMode = isAaveExecutable(a.pool.project, destToken.symbol)
        ? "native"
        : "enso";

      setPhase("depositing");
      const deposited = await deposit.run({
        asset: destToken.address,
        amount,
        amountFormatted: recv,
        project: a.pool.project,
        underlyingTokens: a.pool.underlyingTokens,
        symbol: destToken.symbol,
        simulate: a.simulate,
        mode,
      });
      if (!deposited) {
        setError(deposit.error ?? "Deposit failed");
        setPhase("error");
        return;
      }
      setPhase("done");
    },
    [bridge, deposit],
  );

  return { phase, error, bridge, deposit, requestQuote, run, reset };
}
