"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { erc20Abi, zeroAddress } from "viem";
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
import { FACTORY_ABI, VAULT_ABI, MINT_ABI } from "@/lib/testnet-abi";
import type { FundLocation } from "@/lib/vault-calls";
import { TICK_MS, msUntilNextTick, type KeeperTickResult } from "@/lib/demo-score";

const USDC = DEPLOYMENT.usdc as `0x${string}`;
const FACTORY = DEPLOYMENT.factory as `0x${string}`;
const ZERO = BigInt(0);

export type VaultState = {
  vault: `0x${string}` | null;
  keeper: `0x${string}` | null;
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
  keeper: null,
  walletUsdc: ZERO,
  vaultUsdc: ZERO,
  positions: { ...ZERO_POS },
  location: "empty",
  activeAmount: ZERO,
};

const short = (e: unknown) =>
  (e instanceof Error ? e.message : "Transaction failed").split("\n")[0];

const isKey = (k: unknown): k is ProtocolKey =>
  typeof k === "string" && DEPLOYMENT.protocols.some((p) => p.key === k);

const labelOf = (key: ProtocolKey) =>
  DEPLOYMENT.protocols.find((p) => p.key === key)?.label ?? key;

const approvalsKey = (vault: string) => `arbiflow:approved:${vault.toLowerCase()}`;

// The per-vault allow-list lives in localStorage, exposed as an external store
// so the hook can read it with useSyncExternalStore (SSR-safe, no setState in
// render/effects). Snapshots are cached per vault so the reference is stable.
const EMPTY_APPROVED: ProtocolKey[] = [];
const approvalListeners = new Set<() => void>();
const approvalCache = new Map<string, ProtocolKey[]>();

function readApprovalsLS(vault: string): ProtocolKey[] {
  try {
    const raw = localStorage.getItem(approvalsKey(vault));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isKey) : EMPTY_APPROVED;
  } catch {
    return EMPTY_APPROVED;
  }
}

function approvalsSnapshot(vault: string | null): ProtocolKey[] {
  if (!vault) return EMPTY_APPROVED;
  const k = vault.toLowerCase();
  let cached = approvalCache.get(k);
  if (!cached) {
    cached = readApprovalsLS(vault);
    approvalCache.set(k, cached);
  }
  return cached;
}

function setApprovals(vault: string, next: ProtocolKey[]) {
  approvalCache.set(vault.toLowerCase(), next);
  try {
    localStorage.setItem(approvalsKey(vault), JSON.stringify(next));
  } catch {
    /* ignore quota/availability errors */
  }
  approvalListeners.forEach((l) => l());
}

function subscribeApprovals(cb: () => void): () => void {
  approvalListeners.add(cb);
  return () => approvalListeners.delete(cb);
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
  const [decision, setDecision] = useState<KeeperTickResult | null>(null);

  const onSepolia = chainId === ARBITRUM_SEPOLIA_ID;

  // Address of the backend keeper/relayer that vaults delegate to. Fetched once
  // from the server (it derives it from DEPLOYER_PK) so it can't drift.
  const { data: keeperAddress = null } = useQuery({
    queryKey: ["keeper-address"],
    staleTime: Infinity,
    queryFn: async (): Promise<`0x${string}` | null> => {
      const res = await fetch("/api/keeper/address");
      if (!res.ok) return null;
      const { address: a } = (await res.json()) as { address?: `0x${string}` };
      return a ?? null;
    },
  });

  // On-chain state via react-query — reads from Sepolia regardless of the
  // wallet's current chain; ops call refetch() when they finish.
  const {
    data: state = EMPTY,
    refetch,
    isLoading: loading,
  } = useQuery({
    queryKey: ["vault-state", address],
    enabled: isDeployed() && !!address && !!publicClient,
    staleTime: 4_000,
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
      let keeper: `0x${string}` | null = null;
      const positions: Record<ProtocolKey, bigint> = { ...ZERO_POS };

      if (hasVault) {
        const [usdcBal, keeperAddr] = await Promise.all([
          client.readContract({
            address: USDC,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [vaultAddr],
          }) as Promise<bigint>,
          client.readContract({
            address: vaultAddr,
            abi: VAULT_ABI,
            functionName: "keeper",
          }) as Promise<`0x${string}`>,
        ]);
        vaultUsdc = usdcBal;
        keeper = keeperAddr;
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
        keeper,
        walletUsdc,
        vaultUsdc,
        positions,
        location,
        activeAmount,
      };
    },
  });

  const delegated =
    !!state.vault &&
    !!keeperAddress &&
    !!state.keeper &&
    state.keeper.toLowerCase() === keeperAddress.toLowerCase();

  // --- user-managed allow-list (which protocols ArbiFlow may route to) --------
  const approved = useSyncExternalStore(
    subscribeApprovals,
    () => approvalsSnapshot(state.vault),
    () => EMPTY_APPROVED,
  );

  // Refs keep the heartbeat callbacks free of stale closures. Synced in an
  // effect (never during render) so they reflect the latest commit.
  const stateRef = useRef(state);
  const approvedRef = useRef(approved);
  const keeperRef = useRef(keeperAddress);
  const refetchRef = useRef(refetch);
  useEffect(() => {
    stateRef.current = state;
    approvedRef.current = approved;
    keeperRef.current = keeperAddress;
    refetchRef.current = refetch;
  });

  const approve = useCallback((key: ProtocolKey) => {
    const vault = stateRef.current.vault;
    if (!vault) return;
    const cur = approvalsSnapshot(vault);
    if (cur.includes(key)) return;
    setApprovals(vault, [...cur, key]);
  }, []);

  const revoke = useCallback((key: ProtocolKey) => {
    const vault = stateRef.current.vault;
    if (!vault) return;
    const cur = approvalsSnapshot(vault);
    if (!cur.includes(key)) return;
    setApprovals(
      vault,
      cur.filter((k) => k !== key),
    );
  }, []);

  const isApproved = useCallback((key: ProtocolKey) => approved.includes(key), [approved]);

  // --- helpers ---------------------------------------------------------------
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const ensureSepolia = useCallback(async () => {
    if (chainId !== ARBITRUM_SEPOLIA_ID) {
      await switchChainAsync({ chainId: ARBITRUM_SEPOLIA_ID });
    }
  }, [chainId, switchChainAsync]);

  const logTx = useCallback((label: string, hash: `0x${string}`) => {
    setTxs((t) => [{ label, hash }, ...t].slice(0, 8));
  }, []);

  // Send one tx, log it, wait for it to mine.
  const track = useCallback(
    async (label: string, send: () => Promise<`0x${string}`>): Promise<`0x${string}`> => {
      const hash = await send();
      logTx(label, hash);
      await publicClient!.waitForTransactionReceipt({ hash });
      return hash;
    },
    [publicClient, logTx],
  );

  // Wrap a user op: clear errors, switch to Sepolia, run, re-read state.
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

  const resolveKeeper = useCallback(async (): Promise<`0x${string}`> => {
    if (keeperRef.current) return keeperRef.current;
    const res = await fetch("/api/keeper/address");
    if (!res.ok) throw new Error("Keeper backend unavailable — set DEPLOYER_PK on the server.");
    const { address: a } = (await res.json()) as { address?: `0x${string}` };
    if (!a) throw new Error("Keeper backend unavailable.");
    return a;
  }, []);

  // --- user actions ----------------------------------------------------------
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
        const keeper = await resolveKeeper();
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
        // Delegate to the ArbiFlow backend keeper — so the backend (not the
        // user) can rebalance. The user keeps withdraw/emergencyWithdraw.
        await track("Delegate to ArbiFlow", () =>
          writeContractAsync({
            address: vault,
            abi: VAULT_ABI,
            functionName: "setKeeper",
            args: [keeper],
            chainId: ARBITRUM_SEPOLIA_ID,
          }),
        );
      }),
    [withOp, track, writeContractAsync, address, publicClient, resolveKeeper],
  );

  // Re-point an existing vault's keeper at the backend (grant permission).
  const delegate = useCallback(
    () =>
      withOp("delegate", async () => {
        const vault = stateRef.current.vault;
        if (!vault) throw new Error("Create your vault first");
        const keeper = await resolveKeeper();
        await track("Delegate to ArbiFlow", () =>
          writeContractAsync({
            address: vault,
            abi: VAULT_ABI,
            functionName: "setKeeper",
            args: [keeper],
            chainId: ARBITRUM_SEPOLIA_ID,
          }),
        );
      }),
    [withOp, track, writeContractAsync, resolveKeeper],
  );

  const deposit = useCallback(
    (amount: bigint) =>
      withOp("deposit", async () => {
        const vault = stateRef.current.vault;
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
    [withOp, track, writeContractAsync, address, publicClient],
  );

  // Owner withdraws everything: ask the backend keeper to redeem any deployed
  // position back to idle USDC first, then the owner withdraws the idle USDC.
  const withdrawAll = useCallback(
    () =>
      withOp("withdraw", async () => {
        const { vault, location } = stateRef.current;
        if (!address) throw new Error("Wallet not connected");
        if (!vault) throw new Error("No vault");

        if (location !== "idle" && location !== "empty") {
          const res = await fetch("/api/keeper/redeem", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ vault }),
          });
          const data = (await res.json()) as {
            redeemed?: boolean;
            hash?: `0x${string}`;
            reason?: string;
          };
          if (data.redeemed && data.hash) {
            logTx("Keeper redeem → idle", data.hash);
          } else if (data.reason === "not_delegated") {
            throw new Error("Vault isn't delegated — use Force exit to pull funds out.");
          }
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
    [withOp, track, logTx, writeContractAsync, address, publicClient],
  );

  // Non-custodial escape hatch: sweep every vault token straight to the owner,
  // even if the backend keeper is offline. Position tokens come out as-is.
  const forceExit = useCallback(
    () =>
      withOp("forceExit", async () => {
        const vault = stateRef.current.vault;
        if (!address) throw new Error("Wallet not connected");
        if (!vault) throw new Error("No vault");
        const tokens = [USDC, ...DEPLOYMENT.protocols.map((p) => p.posToken as `0x${string}`)];
        await track("Emergency exit", () =>
          writeContractAsync({
            address: vault,
            abi: VAULT_ABI,
            functionName: "emergencyWithdraw",
            args: [tokens, address],
            chainId: ARBITRUM_SEPOLIA_ID,
          }),
        );
      }),
    [withOp, track, writeContractAsync, address],
  );

  // --- keeper heartbeat ------------------------------------------------------
  const tickingRef = useRef(false);

  const runTick = useCallback(async () => {
    const s = stateRef.current;
    const keeper = keeperRef.current;
    const appr = approvedRef.current;
    if (tickingRef.current) return;
    if (!s.vault || !keeper) return;
    if (!s.keeper || s.keeper.toLowerCase() !== keeper.toLowerCase()) return;
    if (s.activeAmount <= ZERO || appr.length === 0) return;

    tickingRef.current = true;
    try {
      const res = await fetch("/api/keeper/tick", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ vault: s.vault, approved: appr }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as KeeperTickResult;
      setDecision(data);
      if (data.moved && data.hash && data.to) {
        logTx(`Auto-rebalance → ${labelOf(data.to)}`, data.hash);
        await refetchRef.current();
      }
    } catch {
      /* transient — next tick retries */
    } finally {
      tickingRef.current = false;
    }
  }, [logTx]);

  const eligible = delegated && state.activeAmount > ZERO && approved.length > 0;

  useEffect(() => {
    if (!eligible) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    // Fire once now for a fast first decision, then align to tick boundaries.
    runTick();
    const align = setTimeout(() => {
      runTick();
      interval = setInterval(runTick, TICK_MS);
    }, msUntilNextTick());
    return () => {
      clearTimeout(align);
      if (interval) clearInterval(interval);
    };
  }, [eligible, runTick]);

  return {
    state,
    loading,
    pending,
    error,
    txs,
    onSepolia,
    keeperAddress,
    delegated,
    approved,
    decision,
    ensureSepolia,
    refresh,
    faucet,
    createVault,
    delegate,
    deposit,
    approve,
    revoke,
    isApproved,
    withdrawAll,
    forceExit,
  };
}
