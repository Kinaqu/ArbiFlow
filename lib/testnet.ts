// Arbitrum Sepolia demo deployment of the DelegationVault stack.
//
// Fill these in after running `contracts/script/DeployDemo.s.sol` against
// Arbitrum Sepolia — copy the addresses straight from the script's console
// output. While they are empty the /architecture page and the in-app testnet
// view both show a "deployment pending" note, so the app builds and runs fine
// before the demo is deployed.

export const ARBISCAN_SEPOLIA = "https://sepolia.arbiscan.io";
export const ARBITRUM_SEPOLIA_ID = 421614;

// Public demo allocation signer — address of private key 0xA11CE (the factory's
// `backendSigner`). On testnet the frontend signs allocations with this known
// key so the flow is self-service; in production the real key lives only in the
// ArbiFlow backend. Constant across deployments, so it's safe to hardcode.
export const DEMO_BACKEND_SIGNER =
  "0xe05fcC23807536bEe418f142D19fa0d21BB0cfF7";

export type ProtocolKey = "aave" | "compound" | "morpho";

export type TestnetProtocol = {
  key: ProtocolKey;
  label: string;
  /** MockProtocol contract (a whitelisted rebalance target). */
  address: string;
  /** Position token it issues (a priced, whitelisted vault asset). */
  posToken: string;
};

export type TestnetDeployment = {
  chain: string;
  chainId: number;
  factory: string;
  /** afUSDC — the faucet-mintable demo stable, and the vault's deposit asset. */
  usdc: string;
  backendSigner: string;
  protocols: TestnetProtocol[];
  /** The script's own demo vault, linked from /architecture. */
  demoVault?: string;
  txs?: { deposit: string; rebalance: string; withdraw: string };
};

export const TESTNET_DEPLOYMENT: TestnetDeployment = {
  chain: "Arbitrum Sepolia",
  chainId: ARBITRUM_SEPOLIA_ID,
  backendSigner: DEMO_BACKEND_SIGNER,
  // --- Arbitrum Sepolia deploy (contracts/script/DeployDemo.s.sol) ---
  factory: "0xAd84Cd0C4aA9D85D2B8D877C742F3feB59892B78",
  usdc: "0x3AE930B0960d1d883fDBa4F7Bb9D6Fe03eDE08e5",
  protocols: [
    {
      key: "aave",
      label: "Aave (demo)",
      address: "0x6908ec486B1591aA983D590301407188fdB81667",
      posToken: "0x258598532799907F7124893000f97307EB5b8975",
    },
    {
      key: "compound",
      label: "Compound (demo)",
      address: "0xd009eFd44546b74AB4D14433FaAeFd9854FB5A2d",
      posToken: "0xB6417D27fb16c0FFbE530007fa37BCB096bED029",
    },
    {
      key: "morpho",
      label: "Morpho (demo)",
      address: "0xD5AA7198C36fA8342FcAa4Df0ae67d44Fb1FC838",
      posToken: "0x72De1Ec129D7F73b4bed4631E0be9e6f13E23bd7",
    },
  ],
  demoVault: "0xB2AA9601b085350fD0eE12697C829BBa51f4d56E",
  txs: {
    deposit:
      "0x2112658d20d8671fdbf0287783aa09d589c7903374a2e3b0544996617285ff07",
    rebalance:
      "0x49de94facec1e9704437fa5de349e5b05e110a929b13b9c5b2fe37a708da3d02",
    withdraw:
      "0x1532325cb5b26a849f1b1b9e379a4bc3b2173ece092c8e7ab7b0a815f0369208",
  },
};

/** True once the factory, stable, and every protocol address are filled in. */
export function isDeployed(d: TestnetDeployment = TESTNET_DEPLOYMENT): boolean {
  return Boolean(
    d.factory &&
      d.usdc &&
      d.protocols.length > 0 &&
      d.protocols.every((p) => p.address && p.posToken),
  );
}

/** Arbiscan (Sepolia) link for an address or tx hash. */
export function arbiscanSepolia(
  hash: string,
  kind: "address" | "tx" = "address",
): string {
  return `${ARBISCAN_SEPOLIA}/${kind}/${hash}`;
}
