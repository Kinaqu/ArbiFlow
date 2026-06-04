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
  factory: "0xfBD2833422cDb010dD39B0eF4ef05783CBcc81D7",
  usdc: "0x041797298eEe9F8Aa66D6A0CE9A3af4dB85D2F90",
  protocols: [
    {
      key: "aave",
      label: "Aave (demo)",
      address: "0x697F12d48A27692785d6E0FED5f4393A78341305",
      posToken: "0x935BfDCa1C438648A89983fEFf917Baec17c8041",
    },
    {
      key: "compound",
      label: "Compound (demo)",
      address: "0x625C4035EC4Fb2ce9Bd9e80a1112244Ffa2771a0",
      posToken: "0x9Ebd582B9957B5C0625dAa7f7D783B5cD5914fB3",
    },
    {
      key: "morpho",
      label: "Morpho (demo)",
      address: "0x3C4538bD0184cc5729c1e85b0F41f170873eE586",
      posToken: "0xEe11Ddd2f71d728cF0D9472ad65712D6813B1724",
    },
  ],
  demoVault: "0x49db49ecf73b945Ea4eBA8d7e502dDF4bd5266D4",
  txs: {
    deposit:
      "0x794c50f4e62359cdbbc1f8ea136fa504adcca30bfa3b17001011ad0072413fee",
    rebalance:
      "0x1285b71d685cbb21b5945d3e4df53e5ce76f294b892cde41f80a806cd721da32",
    withdraw:
      "0xef54c6ed81290ff070240c398c4a38729c40d8bfef66d29b0298e8e033b1b2a4",
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
