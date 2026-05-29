// Sign-In With Ethereum (EIP-4361) ownership challenge. This proves the
// connector controls the wallet's private key — it is a signature challenge,
// NOT a zero-knowledge proof. Kept fully client-side for the hackathon (no
// server session); the nonce is generated locally per challenge.

import { recoverMessageAddress } from "viem";
import { createSiweMessage, generateSiweNonce } from "viem/siwe";

const STATEMENT = "Verify you own this wallet to use ArbiFlow.";

export type SiweChallenge = {
  message: string;
  nonce: string;
  issuedAt: string;
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
  const message = createSiweMessage({
    address,
    chainId,
    domain,
    uri,
    version: "1",
    nonce,
    statement: STATEMENT,
    issuedAt,
  });
  return { message, nonce, issuedAt: issuedAt.toISOString() };
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
