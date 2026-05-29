"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import { parseUnits } from "viem";
import type { ScoredPool } from "@/lib/score";
import type { ScannedToken } from "@/lib/scan";
import { useDeposit, type DepositStep } from "@/hooks/use-deposit";
import { fmtUsd } from "@/lib/format";
import { monthlyYield, yearlyYield } from "@/lib/earnings";
import { addPosition } from "@/lib/positions";
import { EarningsTicker } from "@/components/app/earnings-ticker";

const arbiscan = (hash: string) => `https://arbiscan.io/tx/${hash}`;

function TxRow({
  label,
  state,
  hash,
}: {
  label: string;
  state: "idle" | "pending" | "done" | "skipped";
  hash: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          {state === "done" ? (
            <Check className="w-4 h-4 text-mint" />
          ) : state === "pending" ? (
            <Loader2 className="w-4 h-4 animate-spin text-gold" />
          ) : state === "skipped" ? (
            <Check className="w-4 h-4 text-muted" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-border" />
          )}
        </span>
        <span
          className={`text-sm ${
            state === "idle" ? "text-muted" : "text-foreground"
          }`}
        >
          {label}
          {state === "skipped" ? (
            <span className="text-muted"> · already approved</span>
          ) : null}
        </span>
      </div>
      {hash ? (
        <a
          href={arbiscan(hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono uppercase tracking-wider text-accent hover:text-foreground inline-flex items-center gap-1"
        >
          tx <ExternalLink className="w-3 h-3" />
        </a>
      ) : null}
    </div>
  );
}

function approveState(step: DepositStep, hash: string | null) {
  if (step === "approving") return "pending" as const;
  if (step === "supplying" || step === "done")
    return hash ? ("done" as const) : ("skipped" as const);
  return "idle" as const;
}

function supplyState(step: DepositStep) {
  if (step === "supplying") return "pending" as const;
  if (step === "done") return "done" as const;
  return "idle" as const;
}

export function DepositModal({
  pool,
  token,
  preview,
  onClose,
}: {
  pool: ScoredPool;
  token: ScannedToken;
  preview: boolean;
  onClose: () => void;
}) {
  const { step, approveHash, supplyHash, error, run } = useDeposit();
  const [amount, setAmount] = useState(String(token.balanceFormatted));
  const [simulate, setSimulate] = useState(false);
  // Sample-wallet preview can never sign — it always runs the dry-run.
  const effectiveSimulate = preview || simulate;

  const busy = step === "switching" || step === "approving" || step === "supplying";
  const balance = token.balanceFormatted;
  const amountNum = Number(amount) || 0;
  const usd = token.usdPrice != null ? amountNum * token.usdPrice : null;

  let parsed = BigInt(0);
  try {
    parsed = amount ? parseUnits(amount, token.decimals) : BigInt(0);
  } catch {
    parsed = BigInt(0);
  }
  const invalid = parsed <= BigInt(0) || amountNum > balance;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  // Record the (mostly simulated) position once on success → /portfolio.
  const recorded = useRef(false);
  useEffect(() => {
    if (step !== "done" || recorded.current) return;
    recorded.current = true;
    addPosition({
      poolId: pool.id,
      project: pool.project,
      projectLabel: pool.projectLabel,
      symbol: token.symbol,
      amountUsd: usd ?? amountNum,
      apy: pool.apy,
      simulated: effectiveSimulate,
    });
  }, [step, pool, token, usd, amountNum, effectiveSimulate]);

  function onAmountChange(raw: string) {
    let v = raw.replace(/[^0-9.]/g, "");
    const [int, frac] = v.split(".");
    if (frac !== undefined) v = `${int}.${frac.slice(0, token.decimals)}`;
    setAmount(v);
  }

  async function onDeposit() {
    if (invalid || token.address === "native") return;
    await run({ asset: token.address, amount: parsed, simulate: effectiveSimulate });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => !busy && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6 space-y-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
              deposit to {pool.projectLabel}
            </div>
            <div className="text-lg font-medium">
              {token.symbol}{" "}
              <span className="text-muted font-mono text-sm">
                · {pool.apy.toFixed(2)}% APY · Aave V3
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !busy && onClose()}
            disabled={busy}
            className="text-muted hover:text-foreground disabled:opacity-40"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "done" ? (
          <div className="rounded-lg border border-mint/30 bg-mint/5 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-mint text-sm font-medium">
                <Check className="w-4 h-4" />
                {effectiveSimulate
                  ? "Simulated deposit complete"
                  : "Deposit confirmed"}
              </div>
              {effectiveSimulate ? (
                <span className="text-[9px] font-mono uppercase tracking-wider text-gold border border-gold/40 bg-gold/10 rounded px-1.5 py-0.5">
                  simulated
                </span>
              ) : null}
            </div>
            <p className="text-sm text-muted-strong">
              Supplied {amount} {token.symbol} to Aave V3 — now earning yield as
              a{token.symbol}. Withdraw anytime from Aave.
            </p>
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-0.5">
                  projected
                </div>
                <div className="font-mono tabular text-sm text-mint">
                  +{fmtUsd(yearlyYield(amountNum, pool.apy))}/yr
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-0.5">
                  earning now
                </div>
                <div className="text-sm">
                  <EarningsTicker amountUsd={usd ?? amountNum} apy={pool.apy} />{" "}
                  <span className="text-muted text-[10px]">live</span>
                </div>
              </div>
            </div>
            <div className="border-t border-border pt-1">
              <TxRow
                label={`Approve ${token.symbol}`}
                state={approveState(step, approveHash)}
                hash={approveHash}
              />
              <TxRow
                label="Supply to Aave V3"
                state={supplyState(step)}
                hash={supplyHash}
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn-primary w-full rounded-md py-2.5 text-sm font-medium text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border bg-surface-2/40 p-4">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
                <span>amount</span>
                <span>
                  balance {balance.toLocaleString("en-US", {
                    maximumFractionDigits: 6,
                  })}{" "}
                  {token.symbol}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => onAmountChange(e.target.value)}
                  disabled={busy}
                  className="flex-1 bg-transparent text-2xl font-mono tabular focus:outline-none disabled:opacity-60"
                  placeholder="0.0"
                />
                <button
                  type="button"
                  onClick={() => setAmount(String(balance))}
                  disabled={busy}
                  className="text-[10px] font-mono uppercase tracking-wider text-accent border border-accent/40 bg-accent/10 rounded px-2 py-1 disabled:opacity-40"
                >
                  max
                </button>
              </div>
              <div className="text-[11px] text-muted font-mono mt-1.5 h-4">
                {usd != null ? fmtUsd(usd) : ""}
                {amountNum > balance ? (
                  <span className="text-rose"> · exceeds balance</span>
                ) : null}
              </div>
            </div>

            {amountNum > 0 ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Projected yield</span>
                <span className="font-mono tabular text-mint">
                  +{fmtUsd(yearlyYield(amountNum, pool.apy))}/yr
                  <span className="text-muted">
                    {" "}· +{fmtUsd(monthlyYield(amountNum, pool.apy))}/mo
                  </span>
                </span>
              </div>
            ) : null}

            {preview ? (
              <div className="rounded-lg border border-gold/30 bg-gold/5 px-3 py-2.5 text-[11px] text-muted-strong">
                <span className="text-gold font-medium">Sample wallet</span> —
                preview only, signing is disabled. Connect your own wallet to
                deposit for real.
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSimulate((v) => !v)}
                disabled={busy}
                aria-pressed={simulate}
                className="flex items-center justify-between w-full text-left disabled:opacity-60"
              >
                <div>
                  <div className="text-sm">Simulate (dry-run)</div>
                  <div className="text-[11px] text-muted">
                    Walk the flow without sending a transaction.
                  </div>
                </div>
                <span
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors flex-shrink-0 ${
                    simulate ? "bg-accent" : "bg-border"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      simulate ? "translate-x-4" : ""
                    }`}
                  />
                </span>
              </button>
            )}

            {step !== "idle" ? (
              <div className="border-t border-border pt-1">
                {step === "switching" ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-muted-strong">
                    <Loader2 className="w-4 h-4 animate-spin text-gold" />
                    Switching network to Arbitrum…
                  </div>
                ) : null}
                <TxRow
                  label={`Approve ${token.symbol}`}
                  state={approveState(step, approveHash)}
                  hash={approveHash}
                />
                <TxRow
                  label="Supply to Aave V3"
                  state={supplyState(step)}
                  hash={supplyHash}
                />
              </div>
            ) : null}

            {error ? (
              <p className="text-sm text-rose">{error}</p>
            ) : null}

            <button
              type="button"
              onClick={onDeposit}
              disabled={invalid || busy}
              className="btn-primary w-full rounded-md py-2.5 text-sm font-medium text-white inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {step === "approving"
                    ? "Approving…"
                    : step === "supplying"
                      ? "Supplying…"
                      : "Working…"}
                </>
              ) : step === "error" ? (
                "Try again"
              ) : preview ? (
                "Preview deposit"
              ) : simulate ? (
                "Simulate deposit"
              ) : (
                `Deposit ${token.symbol}`
              )}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
