"use client";

import { LayoutGroup, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { fmtUsdc } from "@/lib/format";
import {
  TESTNET_DEPLOYMENT as DEPLOYMENT,
  type ProtocolKey,
} from "@/lib/testnet";
import type { VaultApi } from "./testnet-app";

const NODES: { key: "idle" | ProtocolKey; label: string; sub: string }[] = [
  { key: "idle", label: "Idle (vault)", sub: "uninvested" },
  ...DEPLOYMENT.protocols.map((p) => ({
    key: p.key,
    label: p.label,
    sub: "earning",
  })),
];

export function AllocationBoard({ v }: { v: VaultApi }) {
  const { state } = v;
  const hasFunds = state.activeAmount > BigInt(0);
  const moving = v.pending?.startsWith("allocate") || v.pending === "withdraw";

  return (
    <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
          03 · allocation · rebalance across protocols
        </div>
        {moving ? (
          <span className="text-[10px] font-mono uppercase tracking-widest text-gold inline-flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" /> moving funds…
          </span>
        ) : null}
      </div>

      {!hasFunds ? (
        <p className="text-sm text-muted">
          Deposit afUSDC into your vault, then route it here — into Aave, then on
          to Compound or Morpho — to watch the auto-rebalance move real funds
          between protocols. Every move is a signed, on-chain transaction.
        </p>
      ) : null}

      <LayoutGroup>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {NODES.map((n) => {
            const holding = state.location === n.key;
            const isPending = v.pending === `allocate:${n.key}`;
            return (
              <div
                key={n.key}
                className={`relative rounded-lg border p-4 flex flex-col gap-3 min-h-[150px] transition-colors ${
                  holding
                    ? "border-gold/60 bg-gold/5"
                    : "border-border bg-surface-2/30"
                }`}
              >
                <div>
                  <div className="text-sm font-medium leading-tight">
                    {n.label}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    {n.sub}
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  {holding ? (
                    <motion.div
                      layoutId="funds"
                      transition={{ type: "spring", stiffness: 220, damping: 26 }}
                      className="font-mono tabular text-lg font-semibold text-gold"
                    >
                      ${fmtUsdc(state.activeAmount)}
                    </motion.div>
                  ) : (
                    <span className="text-muted text-xs">—</span>
                  )}
                </div>

                {!holding && hasFunds ? (
                  <button
                    type="button"
                    onClick={() => v.allocate(n.key)}
                    disabled={!!v.pending}
                    className="btn-ghost rounded-md py-1.5 text-xs font-medium text-foreground inline-flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    {n.key === "idle" ? "Redeem here" : "Move here"}
                  </button>
                ) : holding ? (
                  <div className="text-center text-[10px] font-mono uppercase tracking-widest text-gold/80">
                    holding
                  </div>
                ) : (
                  <div className="h-[30px]" />
                )}
              </div>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
