"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import { buildSiweMessage, verifySiwe } from "@/lib/siwe";

const keyFor = (a: string) => `arbiflow:siwe:${a.toLowerCase()}`;
const CHANGED_EVENT = "arbiflow:siwe-changed";

function readVerified(address?: string): boolean {
  if (!address || typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(keyFor(address));
    return !!raw && JSON.parse(raw).verified === true;
  } catch {
    return false;
  }
}

// localStorage is an external store — subscribe so the verified flag re-reads
// after verify() writes (same-tab) or another tab changes it. This keeps the
// banner and execute buttons in sync without a setState-in-effect.
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

  const verified = useSyncExternalStore(
    subscribe,
    () => readVerified(address),
    () => false,
  );

  const verify = useCallback(async (): Promise<boolean> => {
    if (!address) return false;
    setError(null);
    setPending(true);
    try {
      const { message, issuedAt } = buildSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        uri: window.location.origin,
      });
      const signature = await signMessageAsync({ message });
      const ok = await verifySiwe(message, signature, address);
      if (!ok) throw new Error("Signature did not match the connected wallet");
      localStorage.setItem(
        keyFor(address),
        JSON.stringify({ verified: true, issuedAt }),
      );
      window.dispatchEvent(new Event(CHANGED_EVENT));
      return true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message.split("\n")[0] : "Verification failed",
      );
      return false;
    } finally {
      setPending(false);
    }
  }, [address, chainId, signMessageAsync]);

  return { address, verified, pending, error, verify };
}
