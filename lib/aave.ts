import { tokenBySymbol, type Token } from "./tokens";

// Aave V3 Pool on Arbitrum One — the canonical entry point for supply/withdraw.
// https://docs.aave.com/developers/deployed-contracts/v3-mainnet/arbitrum
export const AAVE_V3_POOL =
  "0x794a61358D6845594F94dc1DB02A252b5b4814aD" as const;

export const AAVE_POOL_ABI = [
  {
    type: "function",
    name: "supply",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
      { name: "referralCode", type: "uint16" },
    ],
    outputs: [],
  },
] as const;

// ERC-20 symbols that are live Aave V3 reserves on Arbitrum we allow depositing.
// Conservative on purpose — supplying a non-reserve asset reverts.
const AAVE_RESERVE_SYMBOLS = new Set([
  "USDC",
  "USDC.e",
  "USDT",
  "DAI",
  "WETH",
  "WBTC",
  "ARB",
  "LINK",
]);

/** The underlying token if `symbol` is an Aave V3 Arbitrum reserve we support. */
export function aaveReserveFor(symbol: string): Token | null {
  if (!AAVE_RESERVE_SYMBOLS.has(symbol)) return null;
  const token = tokenBySymbol(symbol);
  if (!token || token.address === "native") return null;
  return token;
}

/** Whether a pool can be deposited in-app via Aave supply for the held asset. */
export function isAaveExecutable(project: string, heldSymbol: string): boolean {
  return project === "aave-v3" && aaveReserveFor(heldSymbol) !== null;
}

/**
 * Deep-link to the exact pool on DeFiLlama's yield page (works for every
 * protocol from the `pool.id` we already store, and links out to the protocol).
 */
export function poolUrl(pool: { id: string }): string {
  return `https://defillama.com/yields/pool/${pool.id}`;
}
