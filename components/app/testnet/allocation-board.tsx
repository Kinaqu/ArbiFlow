"use client";

import { useEffect, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { Check } from "lucide-react";
import { fmtUsdc } from "@/lib/format";
import { TESTNET_DEPLOYMENT as DEPLOYMENT, type ProtocolKey } from "@/lib/testnet";
import {
  FACTORS,
  allScoresAt,
  msUntilNextTick,
  tickFor,
  type ProtocolScore,
} from "@/lib/demo-score";
import type { VaultApi } from "./testnet-app";

// Our own monogram + brand color per protocol — deliberately NOT the official
// logos. These are mock stand-ins; the "demo" tag makes that unmistakable.
const CHIP: Record<ProtocolKey, { mono: string; tone: string }> = {
  aave: { mono: "A", tone: "text-accent border-accent/40 bg-accent/10" },
  compound: { mono: "C", tone: "text-mint border-mint/40 bg-mint/10" },
  morpho: { mono: "M", tone: "text-gold border-gold/40 bg-gold/10" },
};

const labelOf = (key: ProtocolKey) =>
  DEPLOYMENT.protocols.find((p) => p.key === key)?.label ?? key;

export function AllocationBoard({ v }: { v: VaultApi }) {
  const { state, approved, decision } = v;
  const hasFunds = state.activeAmount > BigInt(0);

  // A 1s clock drives the countdown and advances the displayed scores at each
  // tick boundary. Scores are deterministic per tick, so this matches the
  // server's decision basis.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const tick = tickFor(now);
  const scores: ProtocolScore[] =
    decision && decision.tick === tick ? decision.scores : allScoresAt(tick);
  const byKey = new Map(scores.map((s) => [s.key, s]));
  const leaderApproved = scores.find((s) => approved.includes(s.key));
  const secondsLeft = Math.ceil(msUntilNextTick(now) / 1000);

  const status = statusLine(v, leaderApproved?.key);

  return (
    <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
            03 · allow-list · ArbiFlow rebalances across what you approve
          </div>
          <p className="text-sm text-muted-strong">{status}</p>
        </div>
        {v.delegated && hasFunds && approved.length > 0 ? (
          <div className="text-right">
            <div className="font-mono tabular text-2xl font-semibold text-gold leading-none">
              {secondsLeft}s
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-1">
              next decision
            </div>
          </div>
        ) : null}
      </div>

      <p className="text-[11px] text-muted leading-relaxed">
        Demo protocols — mock stand-ins on Arbitrum Sepolia, <em>not</em> the real
        Aave / Compound / Morpho and not affiliated with them. Approve the ones
        you trust; ArbiFlow only ever routes funds into your allow-list.
      </p>

      <LayoutGroup>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEPLOYMENT.protocols.map((p) => {
            const key = p.key;
            const s = byKey.get(key)!;
            const holding = state.location === key;
            const isApproved = approved.includes(key);
            const isLeader = leaderApproved?.key === key && isApproved;
            const chip = CHIP[key];

            return (
              <div
                key={key}
                className={`relative rounded-lg border p-4 flex flex-col gap-3 transition-colors ${
                  holding
                    ? "border-gold/60 bg-gold/5"
                    : isApproved
                      ? "border-border-strong bg-surface-2/40"
                      : "border-border bg-surface-2/20 opacity-60"
                }`}
              >
                {isLeader ? (
                  <span className="absolute -top-2 left-3 text-[9px] font-mono uppercase tracking-widest text-gold bg-surface border border-gold/40 rounded-full px-2 py-0.5">
                    leader
                  </span>
                ) : null}

                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-8 h-8 shrink-0 rounded-full border grid place-items-center font-mono text-sm font-semibold ${chip.tone}`}
                  >
                    {chip.mono}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium leading-tight truncate">
                      {labelOf(key)}
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-muted border border-border rounded px-1 py-px">
                      demo · unofficial
                    </span>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="font-mono tabular text-lg font-semibold leading-none">
                      {s.score.toFixed(1)}
                    </div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-muted">
                      score
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {FACTORS.map((f) => {
                    const val = s.breakdown[f.key];
                    const ratio = Math.min(1, Math.max(0, val / f.max));
                    return (
                      <div key={f.key} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[9px] font-mono text-muted">
                          <span className="uppercase tracking-wider truncate">{f.label}</span>
                          <span className="tabular text-muted-strong">
                            {f.unit ? `${val}${f.unit}` : val}
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-border overflow-hidden">
                          <div
                            className={`h-full rounded-full ${f.betterHigh ? "bg-mint/70" : "bg-rose/60"}`}
                            style={{ width: `${ratio * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="h-6 flex items-center">
                    {holding ? (
                      <motion.div
                        layoutId="funds"
                        transition={{ type: "spring", stiffness: 220, damping: 26 }}
                        className="font-mono tabular text-sm font-semibold text-gold"
                      >
                        ${fmtUsdc(state.activeAmount)}
                      </motion.div>
                    ) : (
                      <span className="text-muted text-xs">—</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => (isApproved ? v.revoke(key) : v.approve(key))}
                    disabled={!!v.pending}
                    aria-pressed={isApproved}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      isApproved
                        ? "text-mint border border-mint/40 bg-mint/10 hover:bg-mint/15"
                        : "btn-ghost text-muted-strong"
                    }`}
                  >
                    {isApproved ? <Check className="w-3 h-3" /> : null}
                    {isApproved ? "Approved" : "Approve"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}

function statusLine(v: VaultApi, leaderKey?: ProtocolKey): string {
  const { state, approved, delegated, decision } = v;
  if (!delegated) return "Delegate your vault to ArbiFlow to start auto-rebalancing.";
  if (state.activeAmount <= BigInt(0)) return "Deposit afUSDC, then approve protocols to begin.";
  if (approved.length === 0) return "Approve at least one protocol — ArbiFlow won't move funds until you do.";
  if (decision?.reason === "moved" && decision.to)
    return `ArbiFlow moved your funds into ${labelOf(decision.to)}.`;
  if (state.location !== "idle" && state.location !== "empty")
    return leaderKey && leaderKey === state.location
      ? `Holding in ${labelOf(state.location as ProtocolKey)} — still your best approved score.`
      : `Holding in ${labelOf(state.location as ProtocolKey)}.`;
  return "Evaluating your approved protocols every ~25s…";
}
