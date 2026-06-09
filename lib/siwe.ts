// Sign-In With Ethereum (EIP-4361) ownership challenge. Proves the connector
// controls the wallet's private key — a signature challenge, NOT a ZK proof.
//
// The signed message doubles as a short-lived *session token*: the client keeps
// {message, signature} and sends it with each fund-moving keeper call, and the
// server (see lib/api-auth.ts `requireVaultOwner`) re-verifies it and checks the
// recovered signer is the vault's on-chain owner. So it gates the API for real —
// it is no longer only a client-side banner. Stateless (no server nonce store):
// the token is bound to the wallet, the domain, and a 24h expiry, and authorizes
// only the owner's own vault, which the chain already restricts to value-
// preserving moves among whitelisted pools. It can never move funds elsewhere.

import { recoverMessageAddress } from "viem";
import { createSiweMessage, generateSiweNonce, parseSiweMessage } from "viem/siwe";

const STATEMENT =
  "Sign in to ArbiFlow. This authorizes auto-rebalance and redeem on the vault you own — it can never move your funds to anyone else.";

/** How long a signed session token stays valid before the wallet must re-sign. */
export const SIWE_TTL_MS = 24 * 60 * 60 * 1000;

export type SiweChallenge = {
  message: string;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
};

export function buildSiweMessage({
  address,
  chainId,
  domain,
  uri,
}: {
  address: `0x${string}`;
  chainId: number;
  domain: string;
  uri: string;
}): SiweChallenge {
  const nonce = generateSiweNonce();
  const issuedAt = new Date();
  const expirationTime = new Date(issuedAt.getTime() + SIWE_TTL_MS);
  const message = createSiweMessage({
    address,
    chainId,
    domain,
    uri,
    version: "1",
    nonce,
    statement: STATEMENT,
    issuedAt,
    expirationTime,
  });
  return {
    message,
    nonce,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expirationTime.toISOString(),
  };
}

/**
 * Verify the signature recovers to the expected address. Uses EOA recovery
 * (recoverMessageAddress) rather than verifySiweMessage so no public client is
 * required — sufficient for proving key ownership of a standard wallet.
 */
export async function verifySiwe(
  message: string,
  signature: `0x${string}`,
  expected: `0x${string}`,
): Promise<boolean> {
  try {
    const recovered = await recoverMessageAddress({ message, signature });
    return recovered.toLowerCase() === expected.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Server-side verification of a SIWE session token. Returns the recovered signer
 * address only if the message is unexpired, bound to `host` (anti cross-site
 * replay), and its signature recovers to the address it claims. Returns null on
 * any failure. The caller is responsible for checking that the signer owns the
 * resource being acted on (e.g. == the vault's on-chain owner).
 */
export async function verifySiweSession(
  message: string,
  signature: `0x${string}`,
  opts: { host?: string } = {},
): Promise<`0x${string}` | null> {
  try {
    const fields = parseSiweMessage(message);
    if (!fields.address) return null;
    // Must carry an expiry, and it must be in the future.
    if (!fields.expirationTime || fields.expirationTime.getTime() <= Date.now()) {
      return null;
    }
    // Bind to our host so a signature solicited by another site can't be replayed
    // here. Skipped only when the caller can't determine the host.
    if (opts.host && fields.domain && fields.domain !== opts.host) return null;
    const recovered = await recoverMessageAddress({ message, signature });
    if (recovered.toLowerCase() !== fields.address.toLowerCase()) return null;
    return recovered;
  } catch {
    return null;
  }
}
