"use client";

import { useCallback, useState } from "react";
import { erc20Abi } from "viem";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSendTransaction,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { arbitrum } from "viem/chains";
import { AAVE_POOL_ABI, AAVE_V3_POOL } from "@/lib/aave";
import { getRoute, mockRoute, type EnsoRouteResult } from "@/lib/enso";

// Universal deposit execution: a native Aave V3 fast path (no router fee) plus
// an Enso-routed path for every other protocol. Mirrors the old use-deposit.ts
// shape (which it supersedes) so the modal swap is mechanical.

export type ExecStep =
  | "idle"
  | "routing"
  | "switching"
  | "approving"
  | "executing"
  | "done"
  | "error";

export type ExecMode = "native" | "enso";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const fakeHash = () =>
  ("0x" +
    Array.from({ length: 64 }, () =>
      "0123456789abcdef".charAt(Math.floor(Math.random() * 16)),
    ).join("")) as `0x${string}`;

const short = (e: unknown) =>
  (e instanceof Error ? e.message : "Transaction failed").split("\n")[0];

export type RouteReqArgs = {
  asset: `0x${string}`;
  amount: bigint;
  amountFormatted: number;
  project: string;
  underlyingTokens: string[];
  symbol: string;
  simulate: boolean;
};

export type RunArgs = RouteReqArgs & { mode: ExecMode };

export function useExecute() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient({ chainId: arbitrum.id });

  const [step, setStep] = useState<ExecStep>("idle");
  const [route, setRoute] = useState<EnsoRouteResult | null>(null);
  const [approveHash, setApproveHash] = useState<`0x${string}` | null>(null);
  const [execHash, setExecHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep("idle");
    setRoute(null);
    setApproveHash(null);
    setExecHash(null);
    setError(null);
  }, []);

  // Fetch (or mock) an Enso route summary for the modal to display up front.
  const requestRoute = useCallback(
    async (a: RouteReqArgs): Promise<EnsoRouteResult | null> => {
      setError(null);
      setStep("routing");
      try {
        const r = a.simulate
          ? mockRoute(a.symbol, a.amountFormatted)
          : address
            ? await getRoute({
                fromAddress: address,
                tokenIn: a.asset,
                amountIn: a.amount.toString(),
                project: a.project,
                underlyingTokens: a.underlyingTokens,
                poolSymbol: a.symbol,
              })
            : { executable: false as const, reason: "Wallet not connected" };
        setRoute(r);
        return r;
      } finally {
        setStep("idle");
      }
    },
    [address],
  );

  const run = useCallback(
    async (a: RunArgs) => {
      setError(null);
      setApproveHash(null);
      setExecHash(null);

      try {
        // Dry-run: walk the same UX with fake hashes, no wallet popup.
        if (a.simulate) {
          setStep("approving");
          await sleep(900);
          setApproveHash(fakeHash());
          setStep("executing");
          await sleep(1100);
          setExecHash(fakeHash());
          setStep("done");
          return true;
        }

        if (!address) throw new Error("Wallet not connected");
        if (!publicClient) throw new Error("No RPC client available");

        if (chainId !== arbitrum.id) {
          setStep("switching");
          await switchChainAsync({ chainId: arbitrum.id });
        }

        if (a.mode === "native") {
          // Aave V3 supply — the original deposit flow, preserved verbatim.
          const allowance = await publicClient.readContract({
            address: a.asset,
            abi: erc20Abi,
            functionName: "allowance",
            args: [address, AAVE_V3_POOL],
          });
          if (allowance < a.amount) {
            setStep("approving");
            const hash = await writeContractAsync({
              address: a.asset,
              abi: erc20Abi,
              functionName: "approve",
              args: [AAVE_V3_POOL, a.amount],
              chainId: arbitrum.id,
            });
            setApproveHash(hash);
            await publicClient.waitForTransactionReceipt({ hash });
          }
          setStep("executing");
          const hash = await writeContractAsync({
            address: AAVE_V3_POOL,
            abi: AAVE_POOL_ABI,
            functionName: "supply",
            args: [a.asset, a.amount, address, 0],
            chainId: arbitrum.id,
          });
          setExecHash(hash);
          await publicClient.waitForTransactionReceipt({ hash });
          setStep("done");
          return true;
        }

        // Enso-routed deposit into any other protocol.
        const r =
          route && route.executable
            ? route
            : await getRoute({
                fromAddress: address,
                tokenIn: a.asset,
                amountIn: a.amount.toString(),
                project: a.project,
                underlyingTokens: a.underlyingTokens,
                poolSymbol: a.symbol,
              });
        if (!r.executable) {
          throw new Error(r.reason || "No route available");
        }

        const allowance = await publicClient.readContract({
          address: a.asset,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address, r.spender],
        });
        if (allowance < a.amount) {
          setStep("approving");
          const hash = await writeContractAsync({
            address: a.asset,
            abi: erc20Abi,
            functionName: "approve",
            args: [r.spender, a.amount],
            chainId: arbitrum.id,
          });
          setApproveHash(hash);
          await publicClient.waitForTransactionReceipt({ hash });
        }

        setStep("executing");
        const hash = await sendTransactionAsync({
          to: r.tx.to,
          data: r.tx.data,
          value: BigInt(r.tx.value || "0"),
          chainId: arbitrum.id,
        });
        setExecHash(hash);
        await publicClient.waitForTransactionReceipt({ hash });
        setStep("done");
        return true;
      } catch (e) {
        setError(short(e));
        setStep("error");
        return false;
      }
    },
    [
      address,
      chainId,
      publicClient,
      route,
      switchChainAsync,
      writeContractAsync,
      sendTransactionAsync,
    ],
  );

  return {
    step,
    route,
    approveHash,
    execHash,
    error,
    requestRoute,
    run,
    reset,
  };
}
