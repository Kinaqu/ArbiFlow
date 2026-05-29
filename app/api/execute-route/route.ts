import { NextResponse } from "next/server";
import {
  ARBITRUM_CHAIN_ID,
  DEFAULT_SLIPPAGE_BPS,
  type EnsoRouteResult,
  type GetRouteArgs,
} from "@/lib/enso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENSO_API = "https://api.enso.finance/api/v1";
const API_KEY = process.env.ENSO_API_KEY;

// DeFiLlama project slug → Enso protocol slug, for the few that differ. Most
// match; unknown slugs fall through unchanged and rely on underlying-set match.
const SLUG_MAP: Record<string, string> = {
  "curve-dex": "curve",
  "gmx-v2-perps": "gmx",
  "uniswap-v3": "uniswap-v3",
  "camelot-v3": "camelot-v3",
};

type EnsoTokenRow = {
  address: string;
  symbol?: string;
  decimals?: number;
  protocolSlug?: string;
  underlyingTokens?: Array<{ address?: string } | string> | null;
  tvl?: number | null;
};

// Position-token resolution is stable per (slug, underlying-set) — cache it so
// repeat deposits skip the discovery round-trip.
const tokenOutCache = new Map<
  string,
  { address: string; symbol: string; decimals: number } | null
>();

function ensoHeaders(): HeadersInit {
  return {
    accept: "application/json",
    ...(API_KEY ? { authorization: `Bearer ${API_KEY}` } : {}),
  };
}

function underlyingSet(addrs: string[]): Set<string> {
  return new Set(addrs.map((a) => a.toLowerCase()));
}

function rowUnderlyings(row: EnsoTokenRow): string[] {
  return (row.underlyingTokens ?? [])
    .map((u) => (typeof u === "string" ? u : (u?.address ?? "")))
    .filter(Boolean)
    .map((a) => a.toLowerCase());
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

/**
 * Find the on-chain position token to deposit into. Anchors on an exact
 * underlying-token-set match (safe across slug naming drift), preferring the
 * candidate whose Enso protocol slug matches the DeFiLlama project.
 */
async function resolveTokenOut(
  project: string,
  underlyingTokens: string[],
): Promise<{ address: string; symbol: string; decimals: number } | null> {
  if (underlyingTokens.length === 0) return null;
  const mappedSlug = SLUG_MAP[project] ?? project;
  const want = underlyingSet(underlyingTokens);
  const cacheKey = `${mappedSlug}:${[...want].sort().join(",")}`;
  if (tokenOutCache.has(cacheKey)) return tokenOutCache.get(cacheKey)!;

  const params = new URLSearchParams({
    chainId: String(ARBITRUM_CHAIN_ID),
    type: "defi",
    underlyingTokens: underlyingTokens[0],
    page: "1",
  });
  const res = await fetch(`${ENSO_API}/tokens?${params}`, {
    headers: ensoHeaders(),
  });
  if (!res.ok) {
    tokenOutCache.set(cacheKey, null);
    return null;
  }
  const body = (await res.json().catch(() => null)) as {
    data?: EnsoTokenRow[];
  } | null;
  const rows = body?.data ?? [];

  // Keep only candidates whose underlying set exactly matches the pool's.
  const exact = rows.filter((r) => setsEqual(underlyingSet(rowUnderlyings(r)), want));
  const pool = exact.length > 0 ? exact : rows;
  if (pool.length === 0) {
    tokenOutCache.set(cacheKey, null);
    return null;
  }

  const scored = pool
    .map((r) => ({
      r,
      score: (r.protocolSlug === mappedSlug ? 2 : 0) + (r.tvl ? 0.1 : 0),
      tvl: r.tvl ?? 0,
    }))
    .sort((a, b) => b.score - a.score || b.tvl - a.tvl);

  const best = scored[0]?.r;
  if (!best || !best.address || best.decimals == null) {
    tokenOutCache.set(cacheKey, null);
    return null;
  }
  const resolved = {
    address: best.address,
    symbol: best.symbol ?? "position",
    decimals: best.decimals,
  };
  tokenOutCache.set(cacheKey, resolved);
  return resolved;
}

export async function POST(request: Request) {
  if (!API_KEY) {
    // Not configured — let the client fall back to the protocol deep-link.
    const out: EnsoRouteResult = {
      executable: false,
      reason: "Router not configured",
    };
    return NextResponse.json(out);
  }

  let args: GetRouteArgs;
  try {
    args = (await request.json()) as GetRouteArgs;
  } catch {
    return NextResponse.json(
      { executable: false, reason: "Invalid request" } satisfies EnsoRouteResult,
      { status: 400 },
    );
  }

  const slippageBps = args.slippageBps ?? DEFAULT_SLIPPAGE_BPS;

  try {
    const tokenOut = await resolveTokenOut(args.project, args.underlyingTokens);
    if (!tokenOut) {
      return NextResponse.json({
        executable: false,
        reason: "No routable position for this pool",
      } satisfies EnsoRouteResult);
    }

    const params = new URLSearchParams({
      chainId: String(ARBITRUM_CHAIN_ID),
      fromAddress: args.fromAddress,
      receiver: args.fromAddress,
      amountIn: args.amountIn,
      tokenIn: args.tokenIn,
      tokenOut: tokenOut.address,
      slippage: String(slippageBps),
      routingStrategy: "router",
    });
    const res = await fetch(`${ENSO_API}/shortcuts/route?${params}`, {
      headers: ensoHeaders(),
    });
    const body = (await res.json().catch(() => null)) as {
      tx?: { to?: string; data?: string; value?: string };
      amountOut?: string;
      priceImpact?: number | null;
      message?: string;
    } | null;

    if (!res.ok || !body?.tx?.to || !body.tx.data) {
      return NextResponse.json({
        executable: false,
        reason: body?.message ?? `Route unavailable (${res.status})`,
      } satisfies EnsoRouteResult);
    }

    const amountOut = String(body.amountOut ?? "0");
    const amountOutFormatted = Number(amountOut) / 10 ** tokenOut.decimals;
    // Enso returns priceImpact in basis points; null when not computed.
    const priceImpactPct =
      body.priceImpact == null ? null : body.priceImpact / 100;

    const out: EnsoRouteResult = {
      executable: true,
      tokenOut: {
        address: tokenOut.address as `0x${string}`,
        symbol: tokenOut.symbol,
        decimals: tokenOut.decimals,
      },
      tx: {
        to: body.tx.to as `0x${string}`,
        data: body.tx.data as `0x${string}`,
        value: String(body.tx.value ?? "0"),
      },
      spender: body.tx.to as `0x${string}`,
      amountOut,
      amountOutFormatted,
      priceImpactPct,
      slippageBps,
    };
    return NextResponse.json(out);
  } catch (err) {
    return NextResponse.json({
      executable: false,
      reason: err instanceof Error ? err.message : "Route failed",
    } satisfies EnsoRouteResult);
  }
}
