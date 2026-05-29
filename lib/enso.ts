// Enso router (enso.finance) — universal DeFi deposit execution.
//
// Enso's /shortcuts/route returns ready-to-send calldata for depositing a token
// into a protocol position (aToken, cToken, vault share, LP …) across most
// Arbitrum protocols. We never call Enso from the browser: the API key is held
// server-side in app/api/execute-route/route.ts and this module talks to that
// proxy. Shared types live here so the route handler can import them too.
//
// This file is framework-neutral (no "use client", no React) so it is safe to
// import from both client hooks and the server route.

export const ARBITRUM_CHAIN_ID = 42161;
export const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%

export type EnsoTokenOut = {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
};

export type EnsoRouteResult =
  | { executable: false; reason: string }
  | {
      executable: true;
      tokenOut: EnsoTokenOut;
      tx: { to: `0x${string}`; data: `0x${string}`; value: string };
      spender: `0x${string}`; // approve tokenIn to this before sending tx
      amountOut: string; // tokenOut base units
      amountOutFormatted: number;
      priceImpactPct: number | null;
      slippageBps: number;
      simulated?: boolean;
    };

export type GetRouteArgs = {
  fromAddress: `0x${string}`;
  tokenIn: `0x${string}`;
  amountIn: string; // base units
  project: string; // DeFiLlama project slug
  underlyingTokens: string[];
  poolSymbol: string;
  slippageBps?: number;
};

/** Ask our server proxy to resolve + price a deposit route. Never throws. */
export async function getRoute(args: GetRouteArgs): Promise<EnsoRouteResult> {
  try {
    const res = await fetch("/api/execute-route", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(args),
    });
    const body = (await res.json().catch(() => null)) as EnsoRouteResult | null;
    if (!body) return { executable: false, reason: "No route response" };
    return body;
  } catch (e) {
    return {
      executable: false,
      reason: e instanceof Error ? e.message : "Route request failed",
    };
  }
}

/**
 * Offline route summary for the Simulate dry-run — plausible numbers, no network
 * and no real calldata. Mirrors lib/relay.ts `mockQuote`.
 */
export function mockRoute(
  tokenOutSymbol: string,
  amountInFormatted: number,
  decimals = 6,
): Extract<EnsoRouteResult, { executable: true }> {
  return {
    executable: true,
    tokenOut: {
      address: "0x0000000000000000000000000000000000000000",
      symbol: tokenOutSymbol,
      decimals,
    },
    tx: {
      to: "0x0000000000000000000000000000000000000000",
      data: "0x",
      value: "0",
    },
    spender: "0x0000000000000000000000000000000000000000",
    amountOut: "0",
    amountOutFormatted: amountInFormatted * 0.999,
    priceImpactPct: -0.02,
    slippageBps: DEFAULT_SLIPPAGE_BPS,
    simulated: true,
  };
}

export const fmtSlippage = (bps: number) => `${(bps / 100).toFixed(2)}%`;
