"use client";

import Link from "next/link";
import { ArrowRight, Trash2 } from "lucide-react";
import { usePositions, clearPositions } from "@/lib/positions";
import { fmtUsd, fmtApy } from "@/lib/format";
import { yearlyYield } from "@/lib/earnings";
import { EarningsTicker } from "@/components/app/earnings-ticker";

export default function PortfolioPage() {
  const positions = usePositions();

  if (positions.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center px-5 py-24">
        <div className="max-w-md text-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-4">
            portfolio · empty
          </div>
          <h1 className="text-3xl lg:text-4xl tracking-[-0.03em] font-semibold leading-[1.1] mb-5">
            No <span className="gradient-text-gold">deployed positions</span> yet
          </h1>
          <p className="text-muted-strong mb-8">
            Deposit idle capital from a strategy and it will show up here with
            live projected earnings.
          </p>
          <Link
            href="/app"
            className="btn-primary inline-flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium text-white"
          >
            Scan your wallet
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  const totalDeployed = positions.reduce((s, p) => s + p.amountUsd, 0);
  const totalYearly = positions.reduce(
    (s, p) => s + yearlyYield(p.amountUsd, p.apy),
    0,
  );
  const blendedApy = totalDeployed > 0 ? (totalYearly / totalDeployed) * 100 : 0;
  const since = Math.min(...positions.map((p) => p.ts));
  const anySimulated = positions.some((p) => p.simulated);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-10 lg:py-14 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2 flex items-center gap-2">
              your portfolio
              {anySimulated ? (
                <span className="text-[9px] text-gold border border-gold/40 bg-gold/10 rounded px-1.5 py-0.5">
                  demo positions
                </span>
              ) : null}
            </div>
            <h1 className="text-2xl lg:text-3xl tracking-tight font-medium">
              <span className="gradient-text-gold">{fmtUsd(totalDeployed)}</span>{" "}
              deployed
            </h1>
          </div>
          <button
            type="button"
            onClick={() => clearPositions()}
            className="btn-ghost inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium text-foreground self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
              projected / yr
            </div>
            <div className="font-mono tabular text-2xl font-semibold text-mint">
              +{fmtUsd(totalYearly)}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
              blended APY
            </div>
            <div className="font-mono tabular text-2xl font-semibold">
              {fmtApy(blendedApy)}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
              earned since deploy · live
            </div>
            <div className="text-2xl">
              <EarningsTicker
                amountUsd={totalDeployed}
                apy={blendedApy}
                since={since}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface">
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-surface-2 rounded-t-xl text-[10px] font-mono uppercase tracking-widest text-muted">
            <div className="col-span-5">position</div>
            <div className="col-span-2 text-right">amount</div>
            <div className="col-span-2 text-right">APY</div>
            <div className="col-span-3 text-right">earning now</div>
          </div>
          <ul className="divide-y hairline">
            {positions.map((p) => (
              <li
                key={p.id}
                className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center"
              >
                <div className="col-span-6 md:col-span-5 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {p.projectLabel}{" "}
                    <span className="font-mono text-muted">/ {p.symbol}</span>
                  </div>
                  <div className="text-[11px] text-muted font-mono">
                    {p.simulated ? "simulated" : "on-chain"} ·{" "}
                    {new Date(p.ts).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="col-span-3 md:col-span-2 text-right font-mono tabular text-sm">
                  {fmtUsd(p.amountUsd)}
                </div>
                <div className="hidden md:block col-span-2 text-right font-mono tabular text-sm">
                  {fmtApy(p.apy)}
                </div>
                <div className="col-span-3 text-right text-sm">
                  <EarningsTicker
                    amountUsd={p.amountUsd}
                    apy={p.apy}
                    since={p.ts}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
