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

const PROTOCOL_APP_URLS: Record<string, string> = {
  "aave-v3": "https://app.aave.com/?marketName=proto_arbitrum_v3",
  "gmx-v2-perps": "https://app.gmx.io/#/pools",
  "uniswap-v3": "https://app.uniswap.org/pools",
  pendle: "https://app.pendle.finance/trade/markets",
  "camelot-v3": "https://app.camelot.exchange/",
  "curve-dex": "https://curve.fi/",
  "compound-v3": "https://app.compound.finance/",
  "radiant-v2": "https://app.radiant.capital/",
  "morpho-blue": "https://app.morpho.org/",
  "fluid-lending": "https://fluid.instadapp.io/",
};

/** External app URL for a protocol, falling back to its DeFiLlama page. */
export function protocolUrl(project: string): string {
  return (
    PROTOCOL_APP_URLS[project] ??
    `https://defillama.com/protocol/${project}`
  );
}
