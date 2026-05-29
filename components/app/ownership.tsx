"use client";

import { createContext, useContext, type ReactNode } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useSiwe } from "@/hooks/use-siwe";

type OwnershipValue = {
  address?: `0x${string}`;
  verified: boolean;
  pending: boolean;
  error: string | null;
  verify: () => Promise<boolean>;
};

const OwnershipContext = createContext<OwnershipValue | null>(null);

// Single shared ownership state for the /app subtree, so the banner and the
// execute buttons stay in sync after the user signs (localStorage alone wouldn't
// propagate within the same tab).
export function OwnershipProvider({ children }: { children: ReactNode }) {
  const siwe = useSiwe();
  return (
    <OwnershipContext.Provider value={siwe}>
      {children}
    </OwnershipContext.Provider>
  );
}

export function useOwnership(): OwnershipValue {
  const ctx = useContext(OwnershipContext);
  if (!ctx) {
    throw new Error("useOwnership must be used within an OwnershipProvider");
  }
  return ctx;
}

/** Banner shown in /app when a real wallet is connected but not yet verified. */
export function OwnershipBanner() {
  const { address, verified, pending, error, verify } = useOwnership();
  if (!address || verified) return null;

  return (
    <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        <ShieldCheck className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
        <div className="min-w-0">
          <div className="text-sm font-medium">Verify wallet ownership</div>
          <div className="text-[12px] text-muted-strong">
            Sign a quick message to prove you control this wallet. Required
            before depositing or bridging — browsing stays open.
            {error ? <span className="text-rose"> · {error}</span> : null}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => verify()}
        disabled={pending}
        className="btn-primary inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 flex-shrink-0"
      >
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {pending ? "Awaiting signature…" : "Verify ownership"}
      </button>
    </div>
  );
}

/** Compact verified badge for headers. */
export function OwnershipBadge() {
  const { address, verified } = useOwnership();
  if (!address || !verified) return null;
  return (
    <span
      className="text-[10px] font-mono uppercase tracking-wider text-mint border border-mint/40 bg-mint/10 rounded px-1.5 py-0.5 inline-flex items-center gap-1"
      title="Wallet ownership verified via signature"
    >
      <ShieldCheck className="w-3 h-3" />
      ownership verified
    </span>
  );
}
