// Arbitrum Sepolia demo deployment of the DelegationVault stack.
//
// Fill these in after running `contracts/script/DeployDemo.s.sol` against
// Arbitrum Sepolia — copy the addresses straight from the script's console
// output. While they are empty the /architecture page shows a "deployment
// pending" note, so the app builds and runs fine before the demo is deployed.

export const ARBISCAN_SEPOLIA = "https://sepolia.arbiscan.io";

export type TestnetDeployment = {
  chain: string;
  chainId: number;
  factory: string;
  vault: string;
  usdc: string;
  posToken: string;
  protocol: string;
  txs?: { deposit: string; rebalance: string; withdraw: string };
};

export const TESTNET_DEPLOYMENT: TestnetDeployment = {
  chain: "Arbitrum Sepolia",
  chainId: 421614,
  factory: "0x020016ACBd1AaBA92578a3A553b6958C0404ac32",
  vault: "0x883CfbfA50B6D8473d61982B9d5973Ff0e2440B7",
  usdc: "0x6eFa17EDe2Fc0cA75A2e5A27d1D45f2eDe977ec2",
  posToken: "0x074bBB6a94750FFA427BA63870Cd3EFC1aAF778B",
  protocol: "0x52c86146944e1C28Eeb3948858ea000B718899AD",
  txs: {
    deposit:
      "0xadfe94b6ec52c8e050f94374dbbaf4d73bd046a0ffc28d41b4b72e5e2e49c6a3",
    rebalance:
      "0xe02a74756f89d014f8eae2dc67440d1d0c3995b6884369f3e13252286bb1334e",
    withdraw:
      "0xf11a5ba7cf6e206f19a2b7ffd5ccd3ed64d7804d152de77066737ee9d3ad606d",
  },
};

/** True once the demo has been deployed and addresses pasted above. */
export function isDeployed(d: TestnetDeployment = TESTNET_DEPLOYMENT): boolean {
  return Boolean(d.vault && d.factory);
}

/** Arbiscan (Sepolia) link for an address or tx hash. */
export function arbiscanSepolia(
  hash: string,
  kind: "address" | "tx" = "address",
): string {
  return `${ARBISCAN_SEPOLIA}/${kind}/${hash}`;
}
