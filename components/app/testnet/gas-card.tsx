"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { VaultApi } from "./testnet-app";

const PRESETS = ["0.01", "0.02", "0.05"] as const;
const ZERO = BigInt(0);

/** Roughly how long a reserve lasts at the realistic ~1 move/week mainnet cadence. */
function lastsLabel(days: number): string {
  if (days <= 0) return "—";
  if (days < 1) return "under a day";
  if (days < 14) return `~${Math.round(days)} days`;
  if (days < 60) return `~${Math.round(days / 7)} weeks`;
  return `~${Math.round(days / 30)} months`;
}

export function GasCard({ v }: { v: VaultApi }) {
  const { state } = v;
  const [amount, setAmount] = useState("0.02");

  const funding = v.pending === "depositGas";
  const withdrawing = v.pending === "withdrawGas";

  let parsed = ZERO;
  try {
    parsed = amount ? parseEther(amount) : ZERO;
  } catch {
    parsed = ZERO;
  }

  const est = v.gasEstimateFor(parsed);
  const reserveEth = Number(formatEther(state.vaultEth));
  const canFund = parsed > ZERO && !v.pending;

  return (
    <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
        02b · gas reserve
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
            ETH in your vault
          </div>
          <div className="font-mono tabular text-3xl font-semibold">
            {reserveEth.toLocaleString("en-US", { maximumFractionDigits: 4 })}
            <span className="text-base text-muted ml-1">ETH</span>
          </div>
        </div>
        {state.vaultEth > ZERO ? (
          <button
            type="button"
            onClick={() => v.withdrawGas()}
            disabled={!!v.pending}
            className="text-[11px] text-muted hover:text-foreground inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {withdrawing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            {withdrawing ? "Withdrawing…" : "Withdraw gas"}
          </button>
        ) : null}
      </div>

      <p className="text-[11px] text-muted leading-relaxed">
        Your ETH, withdrawable any time — spent only to reimburse the keeper&apos;s
        gas per rebalance (plus a tiny relayer top-up so auto-rebalancing stays funded).
      </p>

      {v.needsGas ? (
        <div className="rounded-lg border border-rose/30 bg-rose/5 p-3 flex items-start gap-2 text-[11px] text-rose">
          <AlertTriangle className="w-3.5 h-3.5 mt-px shrink-0" />
          <span>
            Reserve can&apos;t cover the next move — auto-rebalancing is paused. Top
            up below to resume.
          </span>
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-surface-2/40 p-3 space-y-3">
        <div className="flex items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(p)}
              className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-mono tabular transition-colors ${
                amount === p
                  ? "border-accent/50 bg-accent/10 text-foreground"
                  : "border-border text-muted-strong hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="custom"
            className="w-20 bg-transparent text-right text-xs font-mono tabular focus:outline-none border-b border-border focus:border-accent"
          />
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-strong">
            {v.gasPrice === null
              ? "estimating gas…"
              : parsed > ZERO
                ? `≈ ${Math.round(est.moves)} moves · lasts ${lastsLabel(est.days)}`
                : "choose an amount"}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
            at 1 move/week
          </span>
        </div>

        <button
          type="button"
          onClick={() => v.depositGas(parsed)}
          disabled={!canFund}
          className="btn-primary w-full rounded-md py-2 text-sm font-medium text-white inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {funding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {funding ? "Funding…" : v.needsGas ? "Top up gas" : "Fund gas reserve"}
        </button>
      </div>
    </div>
  );
}
