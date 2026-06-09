"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import { buildSiweMessage, verifySiwe } from "@/lib/siwe";

const keyFor = (a: string) => `arbiflow:siwe:${a.toLowerCase()}`;
const CHANGED_EVENT = "arbiflow:siwe-changed";

/** The token sent with fund-moving keeper calls; the server re-verifies it. */
export type SiweToken = { message: string; signature: `0x${string}` };

type Stored = { message: string; signature: `0x${string}`; expiresAt: string };

function rawFor(address?: string): string | null {
  if (!address || typeof window === "undefined") return null;
  return localStorage.getItem(keyFor(address));
}

/** Parse the stored token, returning null if absent, malformed, or expired. */
function parseToken(raw: string | null): SiweToken | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<Stored>;
    if (!v.message || !v.signature || !v.expiresAt) return null;
    if (Date.parse(v.expiresAt) <= Date.now()) return null;
    return { message: v.message, signature: v.signature };
  } catch {
    return null;
  }
}

// localStorage is an external store — subscribe so the token re-reads after
// verify() writes (same-tab) or another tab changes it. Keeps the banner and
// execute buttons in sync without a setState-in-effect.
function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", cb);
  window.addEventListener(CHANGED_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(CHANGED_EVENT, cb);
  };
}

export function useSiwe() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-renders when the stored token changes; the raw string is a stable
  // snapshot (Object.is-equal across reads while unchanged).
  const raw = useSyncExternalStore(
    subscribe,
    () => rawFor(address),
    () => null,
  );
  const authToken = parseToken(raw);
  const verified = !!authToken;

  // Sign the SIWE challenge once; the {message, signature} becomes a ~24h session
  // token the server checks against the vault's on-chain owner. Returns the token
  // so callers can use it immediately without waiting for the store to settle.
  const verify = useCallback(async (): Promise<SiweToken | null> => {
    if (!address) return null;
    setError(null);
    setPending(true);
    try {
      const { message, expiresAt } = buildSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        uri: window.location.origin,
      });
      const signature = await signMessageAsync({ message });
      const ok = await verifySiwe(message, signature, address);
      if (!ok) throw new Error("Signature did not match the connected wallet");
      localStorage.setItem(keyFor(address), JSON.stringify({ message, signature, expiresAt }));
      window.dispatchEvent(new Event(CHANGED_EVENT));
      return { message, signature };
    } catch (e) {
      setError(e instanceof Error ? e.message.split("\n")[0] : "Verification failed");
      return null;
    } finally {
      setPending(false);
    }
  }, [address, chainId, signMessageAsync]);

  return { address, verified, pending, error, verify, authToken };
}
