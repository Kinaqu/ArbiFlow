// Relay (relay.link) cross-chain bridge — REST API integration.
//
// We deliberately use the REST API rather than @relayprotocol/relay-sdk: the
// repo's next.config.ts documents real ESM/named-export friction with the
// wagmi/Reown stack under Turbopack/Next 16, and the SDK pulls a large
// dependency tree that fights the bundler. The REST surface is small and gives
// us full control over the fee breakdown we want to show up front.

import { ARBITRUM_TOKENS, type Token } from "./tokens";

export const RELAY_API = "https://api.relay.link";
export const ARBITRUM_CHAIN_ID = 42161;

// Relay represents the native gas token with the zero address.
export const RELAY_NATIVE = "0x0000000000000000000000000000000000000000";

/**
 * Destination asset on Arbitrum for a bridged source symbol. Always an Aave V3
 * reserve so the funds are deposit-ready on arrival. Bridged-only symbols
 * (USDbC) collapse onto canonical Arbitrum USDC.
 */
export function arbitrumDestinationFor(symbol: string): Token {
  const map: Record<string, string> = {
    USDC: "USDC",
    "USDC.E": "USDC.e",
    USDBC: "USDC",
    USDT: "USDT",
    DAI: "DAI",
    WETH: "WETH",
  };
  const target = map[symbol.toUpperCase()] ?? "USDC";
  const token = ARBITRUM_TOKENS.find((t) => t.symbol === target);
  // USDC is always present in ARBITRUM_TOKENS, so this fallback is unreachable
  // in practice — it only narrows the type.
  return token ?? ARBITRUM_TOKENS.find((t) => t.symbol === "USDC")!;
}

export type RelayFeeBreakdown = {
  relayerFeeUsd: number; // relayer service fee
  originGasUsd: number; // gas to submit the deposit tx on the origin chain
  destinationGasUsd: number; // relayer-covered gas to fill on Arbitrum
  appFeeUsd: number; // any app/referrer fee (0 for us)
  totalFeesUsd: number;
  minReceived: number; // expected amount out, in destination token units
  minReceivedUsd: number;
  etaSeconds: number;
  priceImpactPct: number;
};

// A single executable step item from Relay — a transaction to send via the wallet.
export type RelayTxItem = {
  to: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
  chainId: number;
};

export type RelayStep = {
  id: string;
  action: string;
  description: string;
  kind: string; // "transaction" | "signature"
  items: RelayTxItem[];
};

export type RelayQuote = {
  fees: RelayFeeBreakdown;
  steps: RelayStep[];
  requestId: string | null;
  destToken: Token;
};

type LooseAmount =
  | { amountUsd?: string | number; amount?: string; amountFormatted?: string }
  | undefined;

const usd = (a: LooseAmount): number => Number(a?.amountUsd ?? 0) || 0;

export type GetQuoteArgs = {
  user: `0x${string}`;
  originChainId: number;
  originCurrency: string; // token address, or RELAY_NATIVE
  amountWei: string; // exact input, in origin token base units
  symbol: string; // source symbol → resolves the Arbitrum destination asset
};

export async function getQuote({
  user,
  originChainId,
  originCurrency,
  amountWei,
  symbol,
}: GetQuoteArgs): Promise<RelayQuote> {
  const destToken = arbitrumDestinationFor(symbol);
  const destinationCurrency =
    destToken.address === "native" ? RELAY_NATIVE : destToken.address;

  const res = await fetch(`${RELAY_API}/quote`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      user,
      recipient: user,
      originChainId,
      destinationChainId: ARBITRUM_CHAIN_ID,
      originCurrency,
      destinationCurrency,
      amount: amountWei,
      tradeType: "EXACT_INPUT",
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Relay returns a human message for dust / below-minimum / no-route cases.
    const msg =
      (body && (body.message || body.error)) ||
      `Relay quote failed (${res.status})`;
    throw new Error(typeof msg === "string" ? msg : "Relay quote failed");
  }

  return parseQuote(body, destToken);
}

function parseQuote(body: unknown, destToken: Token): RelayQuote {
  const b = body as {
    fees?: Record<string, LooseAmount>;
    details?: {
      currencyOut?: {
        amount?: string;
        amountFormatted?: string;
        amountUsd?: string | number;
      };
      timeEstimate?: number;
      totalImpact?: { percent?: string | number };
    };
    steps?: Array<{
      id?: string;
      action?: string;
      description?: string;
      kind?: string;
      items?: Array<{
        data?: {
          to?: string;
          value?: string;
          data?: string;
          chainId?: number;
        };
      }>;
    }>;
    requestId?: string;
  };

  const fees = b.fees ?? {};
  const out = b.details?.currencyOut;

  const relayerFeeUsd = usd(fees.relayerService);
  const originGasUsd = usd(fees.gas);
  const destinationGasUsd = usd(fees.relayerGas);
  const appFeeUsd = usd(fees.app);

  const breakdown: RelayFeeBreakdown = {
    relayerFeeUsd,
    originGasUsd,
    destinationGasUsd,
    appFeeUsd,
    totalFeesUsd: relayerFeeUsd + originGasUsd + destinationGasUsd + appFeeUsd,
    minReceived: Number(out?.amountFormatted ?? 0) || 0,
    minReceivedUsd: Number(out?.amountUsd ?? 0) || 0,
    etaSeconds: Number(b.details?.timeEstimate ?? 0) || 0,
    priceImpactPct: Number(b.details?.totalImpact?.percent ?? 0) || 0,
  };

  const steps: RelayStep[] = (b.steps ?? [])
    .map((s) => ({
      id: s.id ?? "",
      action: s.action ?? "",
      description: s.description ?? "",
      kind: s.kind ?? "transaction",
      items: (s.items ?? [])
        .filter((it) => it.data?.to && it.data?.data !== undefined)
        .map((it) => ({
          to: it.data!.to as `0x${string}`,
          value: BigInt(it.data!.value ?? "0"),
          data: (it.data!.data ?? "0x") as `0x${string}`,
          chainId: Number(it.data!.chainId ?? 0),
        })),
    }))
    // Drop signature-only / empty steps — we execute on-chain transactions only.
    .filter((s) => s.kind === "transaction" && s.items.length > 0);

  return {
    fees: breakdown,
    steps,
    requestId: b.requestId ?? null,
    destToken,
  };
}

/** Human ETA, e.g. "~12s" or "~3m". */
export function formatEta(seconds: number): string {
  if (seconds <= 0) return "—";
  if (seconds < 60) return `~${Math.round(seconds)}s`;
  return `~${Math.round(seconds / 60)}m`;
}

/**
 * A plausible mocked quote for the Simulate dry-run — small flat relayer fee +
 * nominal gas, no network call. Mirrors the deposit modal's offline demo shape.
 */
export function mockQuote(symbol: string, amountUsd: number): RelayQuote {
  const destToken = arbitrumDestinationFor(symbol);
  const relayerFeeUsd = Math.max(0.12, amountUsd * 0.0008);
  const originGasUsd = 0.04;
  const destinationGasUsd = 0.02;
  const minReceivedUsd = Math.max(0, amountUsd - relayerFeeUsd - destinationGasUsd);
  return {
    fees: {
      relayerFeeUsd,
      originGasUsd,
      destinationGasUsd,
      appFeeUsd: 0,
      totalFeesUsd: relayerFeeUsd + originGasUsd + destinationGasUsd,
      minReceived: minReceivedUsd, // ≈ stablecoin units
      minReceivedUsd,
      etaSeconds: 12,
      priceImpactPct: -0.02,
    },
    steps: [],
    requestId: null,
    destToken,
  };
}

/**
 * Poll Relay for intent settlement on the destination chain. Resolves true on
 * "success", false if it gives up before the deadline (best-effort — the origin
 * tx is already on-chain at this point).
 */
export async function pollStatus(
  requestId: string,
  { timeoutMs = 90_000, intervalMs = 4_000 } = {},
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(
        `${RELAY_API}/intents/status/v3?requestId=${requestId}`,
      );
      if (res.ok) {
        const body = (await res.json()) as { status?: string };
        if (body.status === "success") return true;
        if (body.status === "failure" || body.status === "refund") return false;
      }
    } catch {
      // transient — keep polling
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}
