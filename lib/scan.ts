import { createPublicClient, http, erc20Abi, formatUnits, isAddress } from "viem";
import { arbitrum } from "viem/chains";
import { ARBITRUM_TOKENS, NATIVE_ETH, type Token } from "./tokens";

const RPC_URL = process.env.ARBITRUM_RPC_URL ?? "https://arb1.arbitrum.io/rpc";
const IDLE_THRESHOLD_USD = 5;

const client = createPublicClient({
  chain: arbitrum,
  transport: http(RPC_URL, { batch: true }),
});

export type ScannedToken = {
  symbol: string;
  name: string;
  address: Token["address"];
  decimals: number;
  color: string;
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

async function fetchPrices(
  tokens: Token[],
): Promise<Record<string, number | null>> {
  const keys = tokens
    .map((t) =>
      t.address === "native"
        ? "coingecko:ethereum"
        : `arbitrum:${t.address.toLowerCase()}`,
    )
    .join(",");

  const url = `https://coins.llama.fi/prices/current/${keys}?searchWidth=4h`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Llama ${res.status}`);
    const data = (await res.json()) as LlamaPrices;
    return Object.fromEntries(
      tokens.map((t) => {
        const key =
          t.address === "native"
            ? "coingecko:ethereum"
            : `arbitrum:${t.address.toLowerCase()}`;
        return [t.symbol, data.coins[key]?.price ?? null];
      }),
    );
  } catch (err) {
    console.error("[scan] price fetch failed:", err);
    return Object.fromEntries(tokens.map((t) => [t.symbol, null]));
  }
}

export async function scanWallet(rawAddress: string): Promise<ScanResult> {
  if (!isAddress(rawAddress)) {
    throw new Error("invalid_address");
  }
  const address = rawAddress as `0x${string}`;

  const erc20 = ARBITRUM_TOKENS.filter((t) => t.address !== "native");

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
    fetchPrices(ARBITRUM_TOKENS),
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
      balance: raw.toString(),
      balanceFormatted,
      usdPrice,
      usdValue,
      idle,
    };
  });

  const tokens = [native, ...erc20Scanned]
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
