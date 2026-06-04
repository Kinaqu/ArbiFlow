// Client-side allocation signing for the testnet vault demo.
//
// The deployed factory's `backendSigner` is the public demo key 0xA11CE, so the
// browser can sign each rebalance allocation and the user (as their own vault's
// keeper) submits it — a fully self-service testnet flow with no backend. In
// production this key lives only in the ArbiFlow backend; never ship a real
// signer key to the client.

import { encodeAbiParameters, keccak256 } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export type VaultCall = {
  target: `0x${string}`;
  sellToken: `0x${string}`;
  sellAmount: bigint;
  value: bigint;
  data: `0x${string}`;
};

// 0xA11CE padded to 32 bytes → address 0xe05fcC23807536bEe418f142D19fa0d21BB0cfF7.
const DEMO_SIGNER_PK =
  "0x00000000000000000000000000000000000000000000000000000000000a11ce" as const;

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

/** EIP-712 signature over Allocation(callsHash, nonce, deadline) for a vault. */
export function signAllocation(params: {
  vault: `0x${string}`;
  chainId: number;
  calls: VaultCall[];
  nonce: bigint;
  deadline: bigint;
}): Promise<`0x${string}`> {
  return privateKeyToAccount(DEMO_SIGNER_PK).signTypedData({
    domain: {
      name: "ArbiFlowDelegationVault",
      version: "1",
      chainId: params.chainId,
      verifyingContract: params.vault,
    },
    types: {
      Allocation: [
        { name: "callsHash", type: "bytes32" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Allocation",
    message: {
      callsHash: callsHashOf(params.calls),
      nonce: params.nonce,
      deadline: params.deadline,
    },
  });
}
