import {
  createPublicClient,
  http,
  erc20Abi,
  formatUnits,
  isAddress,
} from "viem";
import { arbitrum, base, optimism } from "viem/chains";
import {
  CHAINS,
  NATIVE_ETH,
  TOKENS_BY_CHAIN,
  type ChainKey,
  type Token,
} from "./tokens";

const IDLE_THRESHOLD_USD = 5;

const RPC_URLS: Record<ChainKey, string> = {
  arbitrum: process.env.ARBITRUM_RPC_URL ?? "https://arb1.arbitrum.io/rpc",
  base: process.env.BASE_RPC_URL ?? "https://mainnet.base.org",
  optimism: process.env.OPTIMISM_RPC_URL ?? "https://mainnet.optimism.io",
};

const VIEM_CHAINS = { arbitrum, base, optimism } as const;

// Per-chain clients. Note: Base/Optimism are OP-stack chains whose viem types
// differ from Arbitrum's (extra "deposit" tx variant), so we let TS infer each
// property's concrete type rather than collapsing them to a single PublicClient
// annotation (which fails to unify).
const clients = {
  arbitrum: createPublicClient({
    chain: arbitrum,
    transport: http(RPC_URLS.arbitrum, { batch: true }),
  }),
  base: createPublicClient({
    chain: base,
    transport: http(RPC_URLS.base, { batch: true }),
  }),
  optimism: createPublicClient({
    chain: optimism,
    transport: http(RPC_URLS.optimism, { batch: true }),
  }),
} as const;

export type ScannedToken = {
  symbol: string;
  name: string;
  address: Token["address"];
  decimals: number;
  color: string;
  chain: ChainKey;
  chainId: number;
  balance: string;
  balanceFormatted: number;
  usdPrice: number | null;
  usdValue: number | null;
  idle: boolean;
};

export type ScanResult = {
  address: `0x${string}`;
  scannedAt: string;
  totalUsd: number;
  idleUsd: number;
  tokens: ScannedToken[];
};

type LlamaPrices = {
  coins: Record<string, { price: number; symbol: string; decimals?: number }>;
};

// DeFiLlama price key for a token on a given chain. Native ETH is the same asset
// on every L2, so it always resolves to the coingecko ethereum feed.
function priceKey(token: Token, chain: ChainKey): string {
  return token.address === "native"
    ? "coingecko:ethereum"
    : `${chain}:${token.address.toLowerCase()}`;
}

async function fetchPrices(
  tokens: Token[],
  chain: ChainKey,
): Promise<Record<string, number | null>> {
  const keys = tokens.map((t) => priceKey(t, chain)).join(",");
  const url = `https://coins.llama.fi/prices/current/${keys}?searchWidth=4h`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Llama ${res.status}`);
    const data = (await res.json()) as LlamaPrices;
    return Object.fromEntries(
      tokens.map((t) => [t.symbol, data.coins[priceKey(t, chain)]?.price ?? null]),
    );
  } catch (err) {
    console.error(`[scan] price fetch failed (${chain}):`, err);
    return Object.fromEntries(tokens.map((t) => [t.symbol, null]));
  }
}

async function scanChain(
  address: `0x${string}`,
  chain: ChainKey,
): Promise<ScannedToken[]> {
  const client = clients[chain];
  const meta = CHAINS[chain];
  const tokenList = TOKENS_BY_CHAIN[chain];
  const erc20 = tokenList.filter((t) => t.address !== "native");

  const [nativeBalance, erc20Balances, prices] = await Promise.all([
    client.getBalance({ address }),
    client.multicall({
      allowFailure: true,
      contracts: erc20.map((t) => ({
        address: t.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf" as const,
        args: [address] as const,
      })),
    }),
    fetchPrices(tokenList, chain),
  ]);

  const nativeFormatted = Number(formatUnits(nativeBalance, NATIVE_ETH.decimals));
  const nativePrice = prices[NATIVE_ETH.symbol] ?? null;
  const nativeUsd = nativePrice !== null ? nativeFormatted * nativePrice : null;
  const native: ScannedToken = {
    symbol: NATIVE_ETH.symbol,
    name: NATIVE_ETH.name,
    address: NATIVE_ETH.address,
    decimals: NATIVE_ETH.decimals,
    color: NATIVE_ETH.color,
    chain,
    chainId: meta.id,
    balance: nativeBalance.toString(),
    balanceFormatted: nativeFormatted,
    usdPrice: nativePrice,
    usdValue: nativeUsd,
    // ETH is volatile — tracked but never flagged "idle"
    idle: false,
  };

  const erc20Scanned: ScannedToken[] = erc20.map((t, i) => {
    const result = erc20Balances[i];
    const raw = result.status === "success" ? (result.result as bigint) : BigInt(0);
    const balanceFormatted = Number(formatUnits(raw, t.decimals));
    const usdPrice = prices[t.symbol] ?? null;
    const usdValue = usdPrice !== null ? balanceFormatted * usdPrice : null;
    const idle =
      !t.volatile && usdValue !== null && usdValue >= IDLE_THRESHOLD_USD;
    return {
      symbol: t.symbol,
      name: t.name,
      address: t.address,
      decimals: t.decimals,
      color: t.color,
      chain,
      chainId: meta.id,
      balance: raw.toString(),
      balanceFormatted,
      usdPrice,
      usdValue,
      idle,
    };
  });

  return [native, ...erc20Scanned];
}

export async function scanWallet(rawAddress: string): Promise<ScanResult> {
  if (!isAddress(rawAddress)) {
    throw new Error("invalid_address");
  }
  const address = rawAddress as `0x${string}`;

  const chainKeys = Object.keys(VIEM_CHAINS) as ChainKey[];
  const perChain = await Promise.all(
    chainKeys.map((chain) => scanChain(address, chain)),
  );

  const tokens = perChain
    .flat()
    .filter((t) => t.balanceFormatted > 0)
    .sort((a, b) => (b.usdValue ?? 0) - (a.usdValue ?? 0));

  const totalUsd = tokens.reduce((s, t) => s + (t.usdValue ?? 0), 0);
  const idleUsd = tokens
    .filter((t) => t.idle)
    .reduce((s, t) => s + (t.usdValue ?? 0), 0);

  return {
    address,
    scannedAt: new Date().toISOString(),
    totalUsd,
    idleUsd,
    tokens,
  };
}
