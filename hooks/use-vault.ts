"use client";

import { useCallback, useState } from "react";
import { encodeFunctionData, erc20Abi, zeroAddress } from "viem";
import { useQuery } from "@tanstack/react-query";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import {
  TESTNET_DEPLOYMENT as DEPLOYMENT,
  ARBITRUM_SEPOLIA_ID,
  isDeployed,
  type ProtocolKey,
} from "@/lib/testnet";
import { FACTORY_ABI, VAULT_ABI, MINT_ABI, PROTOCOL_ABI } from "@/lib/testnet-abi";
import { signAllocation, type VaultCall } from "@/lib/testnet-sign";

const USDC = DEPLOYMENT.usdc as `0x${string}`;
const FACTORY = DEPLOYMENT.factory as `0x${string}`;
const ZERO = BigInt(0);

// Where the vault's funds currently sit. The demo keeps them concentrated in one
// place at a time, so "move" always relocates the full balance.
export type FundLocation = ProtocolKey | "idle" | "empty";

export type VaultState = {
  vault: `0x${string}` | null;
  walletUsdc: bigint;
  vaultUsdc: bigint;
  positions: Record<ProtocolKey, bigint>;
  location: FundLocation;
  activeAmount: bigint;
};

const ZERO_POS: Record<ProtocolKey, bigint> = {
  aave: ZERO,
  compound: ZERO,
  morpho: ZERO,
};

const EMPTY: VaultState = {
  vault: null,
  walletUsdc: ZERO,
  vaultUsdc: ZERO,
  positions: { ...ZERO_POS },
  location: "empty",
  activeAmount: ZERO,
};

const short = (e: unknown) =>
  (e instanceof Error ? e.message : "Transaction failed").split("\n")[0];

function protoByKey(key: ProtocolKey) {
  const p = DEPLOYMENT.protocols.find((x) => x.key === key)!;
  return { proto: p.address as `0x${string}`, pos: p.posToken as `0x${string}` };
}

function supplyCall(proto: `0x${string}`, vault: `0x${string}`, amount: bigint): VaultCall {
  return {
    target: proto,
    sellToken: USDC,
    sellAmount: amount,
    value: ZERO,
    data: encodeFunctionData({ abi: PROTOCOL_ABI, functionName: "supply", args: [amount, vault] }),
  };
}

function withdrawCall(
  proto: `0x${string}`,
  pos: `0x${string}`,
  vault: `0x${string}`,
  amount: bigint,
): VaultCall {
  return {
    target: proto,
    sellToken: pos,
    sellAmount: amount,
    value: ZERO,
    data: encodeFunctionData({ abi: PROTOCOL_ABI, functionName: "withdraw", args: [amount, vault] }),
  };
}

// Batch that relocates `amount` from `source` to `target` (either may be "idle").
function buildMove(
  vault: `0x${string}`,
  source: FundLocation,
  target: FundLocation,
  amount: bigint,
): VaultCall[] {
  const calls: VaultCall[] = [];
  if (source !== "idle" && source !== "empty") {
    const { proto, pos } = protoByKey(source);
    calls.push(withdrawCall(proto, pos, vault, amount));
  }
  if (target !== "idle" && target !== "empty") {
    const { proto } = protoByKey(target);
    calls.push(supplyCall(proto, vault, amount));
  }
  return calls;
}

export type TxLogEntry = { label: string; hash: `0x${string}` };

export function useVault() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: ARBITRUM_SEPOLIA_ID });

  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txs, setTxs] = useState<TxLogEntry[]>([]);

  const onSepolia = chainId === ARBITRUM_SEPOLIA_ID;

  // On-chain state via react-query (consistent with use-scan / use-opportunities)
  // — reads from Sepolia regardless of the wallet's current chain, and ops call
  // refetch() when they finish.
  const {
    data: state = EMPTY,
    refetch,
    isLoading: loading,
  } = useQuery({
    queryKey: ["vault-state", address],
    enabled: isDeployed() && !!address && !!publicClient,
    staleTime: 10_000,
    queryFn: async (): Promise<VaultState> => {
      const user = address!;
      const client = publicClient!;

      const [vaultAddr, walletUsdc] = await Promise.all([
        client.readContract({
          address: FACTORY,
          abi: FACTORY_ABI,
          functionName: "vaultOf",
          args: [user],
        }) as Promise<`0x${string}`>,
        client.readContract({
          address: USDC,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [user],
        }) as Promise<bigint>,
      ]);

      const hasVault = vaultAddr && vaultAddr !== zeroAddress;
      let vaultUsdc = ZERO;
      const positions: Record<ProtocolKey, bigint> = { ...ZERO_POS };

      if (hasVault) {
        vaultUsdc = (await client.readContract({
          address: USDC,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [vaultAddr],
        })) as bigint;
        await Promise.all(
          DEPLOYMENT.protocols.map(async (p) => {
            positions[p.key] = (await client.readContract({
              address: p.posToken as `0x${string}`,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [vaultAddr],
            })) as bigint;
          }),
        );
      }

      let location: FundLocation = "empty";
      let activeAmount = ZERO;
      const inProto = DEPLOYMENT.protocols.find((p) => positions[p.key] > ZERO);
      if (inProto) {
        location = inProto.key;
        activeAmount = positions[inProto.key];
      } else if (vaultUsdc > ZERO) {
        location = "idle";
        activeAmount = vaultUsdc;
      }

      return {
        vault: hasVault ? vaultAddr : null,
        walletUsdc,
        vaultUsdc,
        positions,
        location,
        activeAmount,
      };
    },
  });

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const ensureSepolia = useCallback(async () => {
    if (chainId !== ARBITRUM_SEPOLIA_ID) {
      await switchChainAsync({ chainId: ARBITRUM_SEPOLIA_ID });
    }
  }, [chainId, switchChainAsync]);

  // Send one tx, append it to the activity log, wait for it to mine.
  const track = useCallback(
    async (label: string, send: () => Promise<`0x${string}`>): Promise<`0x${string}`> => {
      const hash = await send();
      setTxs((t) => [{ label, hash }, ...t].slice(0, 8));
      await publicClient!.waitForTransactionReceipt({ hash });
      return hash;
    },
    [publicClient],
  );

  // Wrap an operation: clear errors, switch to Sepolia, run, then re-read state.
  const withOp = useCallback(
    async (name: string, fn: () => Promise<void>) => {
      setError(null);
      setPending(name);
      try {
        await ensureSepolia();
        await fn();
        await refresh();
      } catch (e) {
        setError(short(e));
      } finally {
        setPending(null);
      }
    },
    [ensureSepolia, refresh],
  );

  const faucet = useCallback(
    (amount: bigint) =>
      withOp("faucet", async () => {
        if (!address) throw new Error("Wallet not connected");
        await track("Faucet mint", () =>
          writeContractAsync({
            address: USDC,
            abi: MINT_ABI,
            functionName: "mint",
            args: [address, amount],
            chainId: ARBITRUM_SEPOLIA_ID,
          }),
        );
      }),
    [withOp, track, writeContractAsync, address],
  );

  const createVault = useCallback(
    () =>
      withOp("create", async () => {
        if (!address) throw new Error("Wallet not connected");
        await track("Create vault", () =>
          writeContractAsync({
            address: FACTORY,
            abi: FACTORY_ABI,
            functionName: "createVault",
            args: [],
            chainId: ARBITRUM_SEPOLIA_ID,
          }),
        );
        const vault = (await publicClient!.readContract({
          address: FACTORY,
          abi: FACTORY_ABI,
          functionName: "vaultOf",
          args: [address],
        })) as `0x${string}`;
        // The user is their own keeper, so they can submit their own rebalances.
        await track("Set keeper", () =>
          writeContractAsync({
            address: vault,
            abi: VAULT_ABI,
            functionName: "setKeeper",
            args: [address],
            chainId: ARBITRUM_SEPOLIA_ID,
          }),
        );
      }),
    [withOp, track, writeContractAsync, address, publicClient],
  );

  const deposit = useCallback(
    (amount: bigint) =>
      withOp("deposit", async () => {
        const vault = state.vault;
        if (!address) throw new Error("Wallet not connected");
        if (!vault) throw new Error("Create your vault first");
        const allowance = (await publicClient!.readContract({
          address: USDC,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address, vault],
        })) as bigint;
        if (allowance < amount) {
          await track("Approve afUSDC", () =>
            writeContractAsync({
              address: USDC,
              abi: erc20Abi,
              functionName: "approve",
              args: [vault, amount],
              chainId: ARBITRUM_SEPOLIA_ID,
            }),
          );
        }
        await track("Deposit to vault", () =>
          writeContractAsync({
            address: vault,
            abi: VAULT_ABI,
            functionName: "deposit",
            args: [USDC, amount],
            chainId: ARBITRUM_SEPOLIA_ID,
          }),
        );
      }),
    [withOp, track, writeContractAsync, address, publicClient, state.vault],
  );

  // Sign + submit a rebalance that relocates the full balance to `target`.
  const rebalanceTo = useCallback(
    async (
      vault: `0x${string}`,
      source: FundLocation,
      target: FundLocation,
      amount: bigint,
      label: string,
    ) => {
      const calls = buildMove(vault, source, target, amount);
      if (calls.length === 0) return;
      const nonce = (await publicClient!.readContract({
        address: vault,
        abi: VAULT_ABI,
        functionName: "nonce",
      })) as bigint;
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const signature = await signAllocation({
        vault,
        chainId: ARBITRUM_SEPOLIA_ID,
        calls,
        nonce,
        deadline,
      });
      await track(label, () =>
        writeContractAsync({
          address: vault,
          abi: VAULT_ABI,
          functionName: "rebalance",
          args: [calls, deadline, signature],
          chainId: ARBITRUM_SEPOLIA_ID,
        }),
      );
    },
    [track, writeContractAsync, publicClient],
  );

  const allocate = useCallback(
    (target: ProtocolKey | "idle") =>
      withOp(`allocate:${target}`, async () => {
        const { vault, location, activeAmount } = state;
        if (!vault) throw new Error("Create your vault first");
        if (activeAmount <= ZERO) throw new Error("Nothing to allocate — deposit first");
        if (location === target) return;
        const label =
          target === "idle" ? "Redeem to vault" : `Rebalance → ${protoByKey(target).proto.slice(0, 6)}…`;
        await rebalanceTo(vault, location, target, activeAmount, label);
      }),
    [withOp, rebalanceTo, state],
  );

  const withdrawAll = useCallback(
    () =>
      withOp("withdraw", async () => {
        const { vault, location, activeAmount } = state;
        if (!address) throw new Error("Wallet not connected");
        if (!vault) throw new Error("No vault");
        // Redeem any deployed position back to USDC first.
        if (location !== "idle" && location !== "empty") {
          await rebalanceTo(vault, location, "idle", activeAmount, "Redeem to vault");
        }
        const idle = (await publicClient!.readContract({
          address: USDC,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [vault],
        })) as bigint;
        if (idle > ZERO) {
          await track("Withdraw to wallet", () =>
            writeContractAsync({
              address: vault,
              abi: VAULT_ABI,
              functionName: "withdraw",
              args: [USDC, idle, address],
              chainId: ARBITRUM_SEPOLIA_ID,
            }),
          );
        }
      }),
    [withOp, rebalanceTo, track, writeContractAsync, address, publicClient, state],
  );

  return {
    state,
    loading,
    pending,
    error,
    txs,
    onSepolia,
    ensureSepolia,
    refresh,
    faucet,
    createVault,
    deposit,
    allocate,
    withdrawAll,
  };
}
