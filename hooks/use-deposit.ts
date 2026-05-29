"use client";

import { useCallback, useState } from "react";
import { erc20Abi } from "viem";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { arbitrum } from "viem/chains";
import { AAVE_POOL_ABI, AAVE_V3_POOL } from "@/lib/aave";

export type DepositStep =
  | "idle"
  | "switching"
  | "approving"
  | "supplying"
  | "done"
  | "error";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const fakeHash = () =>
  ("0x" +
    Array.from({ length: 64 }, () =>
      "0123456789abcdef".charAt(Math.floor(Math.random() * 16)),
    ).join("")) as `0x${string}`;

export type RunArgs = {
  asset: `0x${string}`;
  amount: bigint;
  simulate: boolean;
};

export function useDeposit() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [step, setStep] = useState<DepositStep>("idle");
  const [approveHash, setApproveHash] = useState<`0x${string}` | null>(null);
  const [supplyHash, setSupplyHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep("idle");
    setApproveHash(null);
    setSupplyHash(null);
    setError(null);
  }, []);

  const run = useCallback(
    async ({ asset, amount, simulate }: RunArgs) => {
      setError(null);
      setApproveHash(null);
      setSupplyHash(null);

      try {
        // Dry-run: walk the same UX with fake hashes, no wallet popup.
        if (simulate) {
          setStep("approving");
          await sleep(900);
          setApproveHash(fakeHash());
          setStep("supplying");
          await sleep(1100);
          setSupplyHash(fakeHash());
          setStep("done");
          return;
        }

        if (!address) throw new Error("Wallet not connected");
        if (!publicClient) throw new Error("No RPC client available");

        if (chainId !== arbitrum.id) {
          setStep("switching");
          await switchChainAsync({ chainId: arbitrum.id });
        }

        const allowance = await publicClient.readContract({
          address: asset,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address, AAVE_V3_POOL],
        });

        if (allowance < amount) {
          setStep("approving");
          const hash = await writeContractAsync({
            address: asset,
            abi: erc20Abi,
            functionName: "approve",
            args: [AAVE_V3_POOL, amount],
            chainId: arbitrum.id,
          });
          setApproveHash(hash);
          await publicClient.waitForTransactionReceipt({ hash });
        }

        setStep("supplying");
        const hash = await writeContractAsync({
          address: AAVE_V3_POOL,
          abi: AAVE_POOL_ABI,
          functionName: "supply",
          args: [asset, amount, address, 0],
          chainId: arbitrum.id,
        });
        setSupplyHash(hash);
        await publicClient.waitForTransactionReceipt({ hash });
        setStep("done");
      } catch (e) {
        // wagmi/viem wrap user rejections — surface a short, friendly message.
        const msg = e instanceof Error ? e.message : "Transaction failed";
        setError(msg.split("\n")[0]);
        setStep("error");
      }
    },
    [address, chainId, publicClient, switchChainAsync, writeContractAsync],
  );

  return { step, approveHash, supplyHash, error, run, reset };
}
