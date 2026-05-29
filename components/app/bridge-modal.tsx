"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Loader2,
  TriangleAlert,
  X,
} from "lucide-react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import type { ScoredPool } from "@/lib/score";
import type { ScannedToken } from "@/lib/scan";
import { useBridge } from "@/hooks/use-bridge";
import { CHAINS } from "@/lib/tokens";
import { RELAY_NATIVE, formatEta } from "@/lib/relay";
import { fmtUsd } from "@/lib/format";
import { DepositModal } from "@/components/app/deposit-modal";

// Below this much native ETH on the origin chain, the user likely can't pay for
// the bridge deposit transaction itself (Relay covers destination gas, not origin).
const MIN_ORIGIN_ETH = 0.0003;

function FeeRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted">
        {label}
        {hint ? <span className="text-muted/60"> · {hint}</span> : null}
      </span>
      <span className="font-mono tabular">{value}</span>
    </div>
  );
}

export function BridgeModal({
  pool,
  source,
  preview,
  onClose,
}: {
  pool: ScoredPool;
  source: ScannedToken;
  preview: boolean;
  onClose: () => void;
}) {
  const { address } = useAccount();
  const { step, quote, error, hashes, requestQuote, execute } = useBridge();
  const [amount, setAmount] = useState(String(source.balanceFormatted));
  const [simulate, setSimulate] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);

  // Sample-wallet preview can never sign — it always runs the dry-run.
  const effectiveSimulate = preview || simulate;
  const chainMeta = CHAINS[source.chain];

  const busy =
    step === "switching" || step === "approving" || step === "bridging";
  const done = step === "done";
  const quoting = step === "quoting";

  const balance = source.balanceFormatted;
  const amountNum = Number(amount) || 0;
  const usdValue = source.usdPrice != null ? amountNum * source.usdPrice : amountNum;

  let parsed = BigInt(0);
  try {
    parsed = amount ? parseUnits(amount, source.decimals) : BigInt(0);
  } catch {
    parsed = BigInt(0);
  }
  const invalid = parsed <= BigInt(0) || amountNum > balance;

  // Native gas on the origin chain — needed to submit the bridge tx ourselves.
  const { data: nativeBal } = useBalance({
    address,
    chainId: source.chainId,
    query: { enabled: !preview && !!address },
  });
  const originEth = nativeBal
    ? Number(formatUnits(nativeBal.value, nativeBal.decimals))
    : null;
  const lowOriginGas =
    !preview && originEth !== null && originEth < MIN_ORIGIN_ETH;

  const originCurrency =
    source.address === "native" ? RELAY_NATIVE : source.address;

  // Debounced auto-quote whenever the amount (or sim mode) changes and we're
  // not mid-execution. Keeps the fee breakdown live as the user types.
  useEffect(() => {
    if (busy || done) return;
    if (invalid) return;
    const id = setTimeout(() => {
      requestQuote({
        originChainId: source.chainId,
        originCurrency,
        amountWei: parsed.toString(),
        symbol: source.symbol,
        amountUsd: usdValue,
        simulate: effectiveSimulate,
      });
    }, 600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, effectiveSimulate, invalid]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  function onAmountChange(raw: string) {
    let v = raw.replace(/[^0-9.]/g, "");
    const [int, frac] = v.split(".");
    if (frac !== undefined) v = `${int}.${frac.slice(0, source.decimals)}`;
    setAmount(v);
  }

  async function onBridge() {
    if (invalid) return;
    await execute({ originChainId: source.chainId, simulate: effectiveSimulate });
  }

  // On arrival, hand the now-on-Arbitrum funds to the existing Aave deposit
  // flow. We synthesize the destination token from the quote's expected output.
  const arrived: ScannedToken | null = useMemo(() => {
    if (!quote || quote.destToken.address === "native") return null;
    const recv = quote.fees.minReceived;
    return {
      symbol: quote.destToken.symbol,
      name: quote.destToken.name,
      address: quote.destToken.address,
      decimals: quote.destToken.decimals,
      color: quote.destToken.color,
      chain: "arbitrum",
      chainId: CHAINS.arbitrum.id,
      balance: parseUnits(
        recv ? recv.toFixed(quote.destToken.decimals) : "0",
        quote.destToken.decimals,
      ).toString(),
      balanceFormatted: recv,
      usdPrice: recv > 0 ? quote.fees.minReceivedUsd / recv : null,
      usdValue: quote.fees.minReceivedUsd,
      idle: true,
    };
  }, [quote]);

  const fees = quote?.fees;

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
              bring to arbitrum · via Relay
            </div>
            <div className="text-lg font-medium inline-flex items-center gap-2">
              {source.symbol}
              <span className="text-muted font-mono text-sm">
                {chainMeta.label}
              </span>
              <ArrowRight className="w-4 h-4 text-muted" />
              <span className="text-muted font-mono text-sm">Arbitrum</span>
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

        {done ? (
          <div className="rounded-lg border border-mint/30 bg-mint/5 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-mint text-sm font-medium">
                <Check className="w-4 h-4" />
                {effectiveSimulate ? "Simulated bridge complete" : "Bridged to Arbitrum"}
              </div>
              {effectiveSimulate ? (
                <span className="text-[9px] font-mono uppercase tracking-wider text-gold border border-gold/40 bg-gold/10 rounded px-1.5 py-0.5">
                  simulated
                </span>
              ) : null}
            </div>
            <p className="text-sm text-muted-strong">
              {fees ? (
                <>
                  ~{fmtUsd(fees.minReceivedUsd)} of {quote?.destToken.symbol} is
                  now on Arbitrum, ready to earn yield.
                </>
              ) : (
                "Your funds are on Arbitrum, ready to earn yield."
              )}
            </p>
            <button
              type="button"
              onClick={() => setDepositOpen(true)}
              disabled={!arrived}
              className="btn-primary w-full rounded-md py-2.5 text-sm font-medium text-white inline-flex items-center justify-center gap-2 disabled:opacity-40"
            >
              Deposit on Arbitrum
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border bg-surface-2/40 p-4">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
                <span>amount</span>
                <span>
                  balance{" "}
                  {balance.toLocaleString("en-US", { maximumFractionDigits: 6 })}{" "}
                  {source.symbol}
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
                {fmtUsd(usdValue)}
                {amountNum > balance ? (
                  <span className="text-rose"> · exceeds balance</span>
                ) : null}
              </div>
            </div>

            {/* Fee breakdown — every cost up front, no surprises. */}
            <div className="rounded-lg border border-border bg-surface-2/40 p-4 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted">
                <span>quote</span>
                {quoting ? (
                  <span className="inline-flex items-center gap-1 text-muted">
                    <Loader2 className="w-3 h-3 animate-spin" /> pricing…
                  </span>
                ) : fees ? (
                  <span className="text-mint">ETA {formatEta(fees.etaSeconds)}</span>
                ) : null}
              </div>
              {fees ? (
                <>
                  <FeeRow label="Relayer fee" value={fmtUsd(fees.relayerFeeUsd)} />
                  <FeeRow
                    label="Origin gas"
                    value={fmtUsd(fees.originGasUsd)}
                    hint={chainMeta.label}
                  />
                  <FeeRow
                    label="Destination gas"
                    value={fmtUsd(fees.destinationGasUsd)}
                    hint="Arbitrum"
                  />
                  {fees.appFeeUsd > 0 ? (
                    <FeeRow label="App fee" value={fmtUsd(fees.appFeeUsd)} />
                  ) : null}
                  <FeeRow
                    label="Price impact"
                    value={`${fees.priceImpactPct.toFixed(2)}%`}
                  />
                  <div className="border-t border-border pt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-strong">Min received</span>
                    <span className="font-mono tabular text-mint">
                      {fees.minReceived.toLocaleString("en-US", {
                        maximumFractionDigits: 4,
                      })}{" "}
                      {quote?.destToken.symbol}
                      <span className="text-muted">
                        {" "}· {fmtUsd(fees.minReceivedUsd)}
                      </span>
                    </span>
                  </div>
                </>
              ) : !quoting ? (
                <div className="text-[11px] text-muted">
                  Enter an amount to fetch a live Relay quote.
                </div>
              ) : null}
            </div>

            {/* Pitfall warnings */}
            {lowOriginGas ? (
              <div className="rounded-lg border border-gold/30 bg-gold/5 px-3 py-2.5 text-[11px] text-muted-strong inline-flex items-start gap-2">
                <TriangleAlert className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                <span>
                  Low ETH on {chainMeta.label} ({originEth?.toFixed(5)} ETH). You
                  need a little native ETH there to submit the bridge transaction.
                </span>
              </div>
            ) : null}

            {preview ? (
              <div className="rounded-lg border border-gold/30 bg-gold/5 px-3 py-2.5 text-[11px] text-muted-strong">
                <span className="text-gold font-medium">Sample wallet</span> —
                preview only, signing is disabled. Connect your own wallet to
                bridge for real.
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

            {step !== "idle" && step !== "quoted" && step !== "quoting" ? (
              <div className="border-t border-border pt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-strong">
                  {busy ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  ) : null}
                  {step === "switching"
                    ? `Switching to ${chainMeta.label}…`
                    : step === "approving"
                      ? `Approving ${source.symbol}…`
                      : step === "bridging"
                        ? "Bridging to Arbitrum…"
                        : null}
                </div>
                {hashes.map((h, i) => (
                  <a
                    key={h}
                    href={`${chainMeta.explorer}/tx/${h}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono uppercase tracking-wider text-accent hover:text-foreground inline-flex items-center gap-1"
                  >
                    tx {i + 1} <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            ) : null}

            {error ? <p className="text-sm text-rose">{error}</p> : null}

            <button
              type="button"
              onClick={onBridge}
              disabled={invalid || busy || quoting || !quote}
              className="btn-primary w-full rounded-md py-2.5 text-sm font-medium text-white inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Working…
                </>
              ) : step === "error" ? (
                "Try again"
              ) : preview ? (
                "Preview bridge"
              ) : simulate ? (
                "Simulate bridge"
              ) : (
                `Bring ${source.symbol} to Arbitrum`
              )}
            </button>
          </>
        )}
      </motion.div>

      {depositOpen && arrived ? (
        <DepositModal
          pool={pool}
          token={arrived}
          preview={effectiveSimulate}
          onClose={() => {
            setDepositOpen(false);
            onClose();
          }}
        />
      ) : null}
    </div>
  );
}
