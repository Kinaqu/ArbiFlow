// Server-only API guards. Two concerns:
//   1. Open read API — API key + per-key rate limit + CORS (withPublicApi).
//   2. Keeper write endpoints — SIWE-owner authorization (requireVaultOwner).
// Imported only by route handlers; reads server env and talks to the chain.

import { NextResponse } from "next/server";
import { createPublicClient, http, isAddress, type PublicClient } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { TESTNET_DEPLOYMENT as DEPLOYMENT } from "./testnet";
import { VAULT_ABI } from "./testnet-abi";
import { verifySiweSession } from "./siwe";
import { PUBLISHABLE_API_KEY } from "./api-key";

// ---- open read API: keys ----------------------------------------------------

function validKeys(): Set<string> {
  const env = (process.env.ARBIFLOW_API_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  return new Set([PUBLISHABLE_API_KEY, ...env]);
}

function extractKey(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth && auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return request.headers.get("x-api-key")?.trim() || null;
}

export function requireApiKey(request: Request): { ok: true; keyId: string } | { ok: false } {
  const key = extractKey(request);
  if (key && validKeys().has(key)) return { ok: true, keyId: key };
  return { ok: false };
}

// ---- open read API: rate limit (in-memory, best-effort per instance) --------
// NOTE: per-instance memory — fine for a demo. Production should use a shared
// store (Vercel KV / Upstash) so limits hold across serverless instances.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function rlConfig(): { limit: number; windowMs: number } {
  const limit = Number.parseInt(process.env.API_RATE_LIMIT ?? "", 10);
  const windowMs = Number.parseInt(process.env.API_RATE_WINDOW_MS ?? "", 10);
  return {
    limit: Number.isFinite(limit) && limit > 0 ? limit : 60,
    windowMs: Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 60_000,
  };
}

export type RateResult = { ok: boolean; limit: number; remaining: number; reset: number };

export function rateLimit(keyId: string): RateResult {
  const { limit, windowMs } = rlConfig();
  const now = Date.now();
  let b = buckets.get(keyId);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(keyId, b);
  }
  b.count++;
  return { ok: b.count <= limit, limit, remaining: Math.max(0, limit - b.count), reset: b.resetAt };
}

function rlHeaders(rl: RateResult): Record<string, string> {
  return {
    "x-ratelimit-limit": String(rl.limit),
    "x-ratelimit-remaining": String(rl.remaining),
    "x-ratelimit-reset": String(Math.ceil(rl.reset / 1000)),
  };
}

// ---- open read API: CORS ----------------------------------------------------

const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, authorization, x-api-key",
  "access-control-max-age": "86400",
};

export function withCors<T extends NextResponse>(res: T): T {
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v);
  return res;
}

export function corsPreflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Wrap a public read handler with API-key + rate-limit + CORS. Pair it with a
 * sibling `export function OPTIONS() { return corsPreflight(); }` on the route.
 */
export function withPublicApi(
  handler: (request: Request) => Promise<NextResponse> | NextResponse,
) {
  return async (request: Request): Promise<NextResponse> => {
    const key = requireApiKey(request);
    if (!key.ok) {
      return withCors(
        NextResponse.json(
          {
            error: "unauthorized",
            message:
              "Missing or invalid API key. Send it as 'Authorization: Bearer <key>' or the 'x-api-key' header.",
          },
          { status: 401 },
        ),
      );
    }
    const rl = rateLimit(key.keyId);
    if (!rl.ok) {
      return withCors(
        NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rlHeaders(rl) }),
      );
    }
    const res = await handler(request);
    for (const [k, v] of Object.entries(rlHeaders(rl))) res.headers.set(k, v);
    return withCors(res);
  };
}

// ---- keeper write endpoints: SIWE-owner authorization -----------------------

let _pc: PublicClient | null = null;
function publicClient(): PublicClient {
  if (_pc) return _pc;
  const rpc = process.env.ARBITRUM_SEPOLIA_RPC_URL?.trim() || undefined;
  _pc = createPublicClient({ chain: arbitrumSepolia, transport: http(rpc) });
  return _pc;
}

export async function readVaultOwner(vault: `0x${string}`): Promise<`0x${string}`> {
  return publicClient().readContract({
    address: vault,
    abi: VAULT_ABI,
    functionName: "owner",
  }) as Promise<`0x${string}`>;
}

export type AuthToken = { message?: string; signature?: string };
export type OwnerCheck = { ok: true } | { ok: false; status: number; error: string };

/**
 * Authorize a fund-moving keeper action (tick/redeem) on `vault`. The public demo
 * vault is open by design — project-owned showcase with faucet funds, driven by
 * the /architecture heartbeat. Every other vault requires a SIWE session token
 * whose recovered signer equals the vault's on-chain owner, so no one can move
 * another user's funds. (The chain still restricts even the owner's moves to
 * value-preserving rebalances among whitelisted pools.)
 */
export async function requireVaultOwner(
  vault: `0x${string}`,
  auth: AuthToken | undefined,
  host: string | null,
): Promise<OwnerCheck> {
  const demo = DEPLOYMENT.demoVault;
  if (demo && isAddress(demo) && vault.toLowerCase() === demo.toLowerCase()) {
    return { ok: true };
  }
  if (!auth?.message || !auth.signature) {
    return { ok: false, status: 401, error: "auth_required" };
  }
  const signer = await verifySiweSession(auth.message, auth.signature as `0x${string}`, {
    host: host ?? undefined,
  });
  if (!signer) return { ok: false, status: 401, error: "bad_auth" };

  let owner: `0x${string}`;
  try {
    owner = await readVaultOwner(vault);
  } catch {
    return { ok: false, status: 502, error: "owner_read_failed" };
  }
  if (signer.toLowerCase() !== owner.toLowerCase()) {
    return { ok: false, status: 403, error: "not_owner" };
  }
  return { ok: true };
}
