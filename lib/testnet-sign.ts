// Shared EIP-712 allocation encoding for the testnet vault demo.
//
// A rebalance is authorized by a backend signature over
// Allocation(callsHash, nonce, deadline). Signing now happens server-side in
// `lib/keeper-signer.ts` with the backend key — never in the browser — so this
// module only builds the calls hash and typed-data shape that the client and
// server must agree on. The chain still enforces that only whitelisted targets
// are touched, value can't drop, and only the owner can withdraw.

import { encodeAbiParameters, keccak256 } from "viem";

export type VaultCall = {
  target: `0x${string}`;
  sellToken: `0x${string}`;
  sellAmount: bigint;
  value: bigint;
  data: `0x${string}`;
};

const CALL_TUPLE_ARRAY = [
  {
    type: "tuple[]",
    components: [
      { name: "target", type: "address" },
      { name: "sellToken", type: "address" },
      { name: "sellAmount", type: "uint256" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
  },
] as const;

/** keccak256(abi.encode(calls)) — matches the vault's `callsHash`. */
export function callsHashOf(calls: VaultCall[]): `0x${string}` {
  return keccak256(encodeAbiParameters(CALL_TUPLE_ARRAY, [calls]));
}

/** EIP-712 type definition for the vault's `Allocation` struct. */
export const ALLOCATION_TYPES = {
  Allocation: [
    { name: "callsHash", type: "bytes32" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

/** Full typed-data payload for `signTypedData` over Allocation(...) for a vault. */
export function allocationTypedData(params: {
  vault: `0x${string}`;
  chainId: number;
  calls: VaultCall[];
  nonce: bigint;
  deadline: bigint;
}) {
  return {
    domain: {
      name: "ArbiFlowDelegationVault",
      version: "1",
      chainId: params.chainId,
      verifyingContract: params.vault,
    },
    types: ALLOCATION_TYPES,
    primaryType: "Allocation" as const,
    message: {
      callsHash: callsHashOf(params.calls),
      nonce: params.nonce,
      deadline: params.deadline,
    },
  };
}
