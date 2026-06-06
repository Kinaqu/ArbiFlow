"use client";

import { useState } from "react";
import { formatUnits, parseEther, parseUnits } from "viem";
import { ExternalLink, Loader2, ShieldCheck, Vault } from "lucide-react";
import { fmtUsdc } from "@/lib/format";
import { arbiscanSepolia } from "@/lib/testnet";
import type { VaultApi } from "./testnet-app";

export function VaultCard({ v }: { v: VaultApi }) {
  const { state } = v;
  const [amount, setAmount] = useState("");
  const [gasAmount, setGasAmount] = useState("0.02");

  const creating = v.pending === "create";
  const depositing = v.pending === "deposit";
  const withdrawing = v.pending === "withdraw";
  const delegating = v.pending === "delegate";
  const forcing = v.pending === "forceExit";

  const walletNum = Number(formatUnits(state.walletUsdc, 6));
  const amountNum = Number(amount) || 0;
  const canDeposit = amountNum > 0 && amountNum <= walletNum && !v.pending;

  let parsed = BigInt(0);
  try {
    parsed = amount ? parseUnits(amount, 6) : BigInt(0);
  } catch {
    parsed = BigInt(0);
  }

  let gasParsed = BigInt(0);
  try {
    gasParsed = gasAmount && gasAmount !== "0" ? parseEther(gasAmount) : BigInt(0);
  } catch {
    gasParsed = BigInt(0);
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
          02 · your vault
        </div>
        <Vault className="w-4 h-4 text-accent" />
      </div>

      {!state.vault ? (
        <>
          <p className="text-sm text-muted-strong">
            Deploy your own non-custodial vault clone, delegated to ArbiFlow. The
            backend becomes its keeper — it can rebalance across the protocols you
            approve, but can never withdraw. Only you can take funds out.
          </p>
          <button
            type="button"
            onClick={() => v.createVault()}
            disabled={!!v.pending}
            className="btn-primary w-full rounded-md py-2.5 text-sm font-medium text-white inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {creating ? "Creating + delegating…" : "Create vault"}
          </button>
        </>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
                idle in vault
              </div>
              <div className="font-mono tabular text-3xl font-semibold">
                {fmtUsdc(state.vaultUsdc)}
              </div>
            </div>
            <a
              href={arbiscanSepolia(state.vault)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-accent hover:text-foreground inline-flex items-center gap-1"
            >
              vault <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {v.delegated ? (
            <div className="flex items-center gap-2 text-[11px] text-mint">
              <ShieldCheck className="w-3.5 h-3.5" />
              Delegated to ArbiFlow — only you can withdraw.
            </div>
          ) : (
            <div className="rounded-lg border border-gold/30 bg-gold/5 p-3 space-y-2">
              <p className="text-[11px] text-muted-strong">
                This vault isn&apos;t delegated yet, so ArbiFlow can&apos;t
                rebalance it. Grant permission to start.
              </p>
              <button
                type="button"
                onClick={() => v.delegate()}
                disabled={!!v.pending}
                className="btn-primary w-full rounded-md py-2 text-sm font-medium text-white inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {delegating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {delegating ? "Delegating…" : "Delegate to ArbiFlow"}
              </button>
            </div>
          )}

          <div className="rounded-lg border border-border bg-surface-2/40 p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted">
              <span>deposit afUSDC</span>
              <button
                type="button"
                onClick={() => setAmount(String(walletNum))}
                className="text-accent hover:text-foreground"
              >
                max {fmtUsdc(state.walletUsdc)}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.0"
                disabled={!!v.pending}
                className="flex-1 bg-transparent text-xl font-mono tabular focus:outline-none disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => v.deposit(parsed, gasParsed)}
                disabled={!canDeposit}
                className="btn-primary rounded-md px-4 py-2 text-sm font-medium text-white inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {depositing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {depositing ? "…" : gasParsed > BigInt(0) ? "Deposit + gas" : "Deposit"}
              </button>
            </div>
            {amountNum > walletNum ? (
              <div className="text-[11px] text-rose">exceeds wallet balance</div>
            ) : null}

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                + gas reserve
              </span>
              <div className="flex items-center gap-1.5">
                {(["0", "0.01", "0.02"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGasAmount(g)}
                    className={`rounded-md border px-2 py-1 text-[11px] font-mono tabular transition-colors ${
                      gasAmount === g
                        ? "border-accent/50 bg-accent/10 text-foreground"
                        : "border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {g === "0" ? "off" : g}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-muted leading-relaxed">
              Optional ETH gas reserve — your ETH, withdrawable any time, spent
              only to reimburse the keeper&apos;s gas per rebalance.
            </p>
          </div>

          {state.activeAmount > BigInt(0) ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => v.withdrawAll()}
                disabled={!!v.pending}
                className="btn-ghost w-full rounded-md py-2 text-sm font-medium text-foreground inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {withdrawing ? "Withdrawing…" : "Withdraw all to wallet"}
              </button>
              <button
                type="button"
                onClick={() => v.forceExit()}
                disabled={!!v.pending}
                className="w-full text-[11px] text-muted hover:text-rose inline-flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {forcing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                {forcing ? "Force exiting…" : "Force exit (emergency, skips the keeper)"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
