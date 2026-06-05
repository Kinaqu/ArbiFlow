// Builds the rebalance call batches the vault executes. Isomorphic and
// secret-free, so the client (display/withdraw) and the server-side keeper
// (the actual signed rebalances) construct identical batches.

import { encodeFunctionData } from "viem";
import { TESTNET_DEPLOYMENT as DEPLOYMENT, type ProtocolKey } from "./testnet";
import { PROTOCOL_ABI } from "./testnet-abi";
import type { VaultCall } from "./testnet-sign";

const USDC = DEPLOYMENT.usdc as `0x${string}`;
const ZERO = BigInt(0);

// Where the vault's funds currently sit. The demo keeps them concentrated in one
// place at a time, so "move" always relocates the full balance.
export type FundLocation = ProtocolKey | "idle" | "empty";

export function protoByKey(key: ProtocolKey) {
  const p = DEPLOYMENT.protocols.find((x) => x.key === key)!;
  return { proto: p.address as `0x${string}`, pos: p.posToken as `0x${string}` };
}

export function supplyCall(
  proto: `0x${string}`,
  vault: `0x${string}`,
  amount: bigint,
): VaultCall {
  return {
    target: proto,
    sellToken: USDC,
    sellAmount: amount,
    value: ZERO,
    data: encodeFunctionData({ abi: PROTOCOL_ABI, functionName: "supply", args: [amount, vault] }),
  };
}

export function withdrawCall(
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

/** Batch that relocates `amount` from `source` to `target` (either may be "idle"). */
export function buildMove(
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
