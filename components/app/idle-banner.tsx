"use client";

import { ArrowDown, Sparkles } from "lucide-react";
import { fmtUsd } from "@/lib/format";
import { yearlyYield } from "@/lib/earnings";
import { REFERENCE_STABLE_APY } from "@/lib/constants";

export function IdleBanner({
  idleUsd,
  totalUsd,
  tokenCount,
  generated,
  onGenerate,
  refApy = REFERENCE_STABLE_APY,
}: {
  idleUsd: number;
  totalUsd: number;
  tokenCount: number;
  generated: boolean;
  onGenerate: () => void;
  refApy?: number;
}) {
  const pct = totalUsd > 0 ? Math.round((idleUsd / totalUsd) * 100) : 0;

  const handleClick = () => {
    if (!generated) {
      onGenerate();
      // Defer scroll to next frame so the section mounts first.
      requestAnimationFrame(() => {
        document
          .getElementById("opportunities")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    document
      .getElementById("opportunities")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border-strong bg-surface p-6 lg:p-8">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 500px 240px at 80% 0%, rgba(244, 181, 63, 0.10), transparent 60%)",
        }}
      />
      <div className="relative grid lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-7">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">
            idle capital detected
          </div>
          <div className="font-mono tabular text-5xl lg:text-6xl tracking-tight font-semibold gradient-text-gold leading-none">
            {fmtUsd(idleUsd)}
          </div>
          <div className="mt-3 text-sm text-muted-strong">
            {pct}% of your {fmtUsd(totalUsd, 0)} total · {tokenCount} {tokenCount === 1 ? "asset" : "assets"} earning nothing
          </div>
          {idleUsd > 0 ? (
            <div className="mt-2 text-sm text-gold">
              ≈ {fmtUsd(yearlyYield(idleUsd, refApy))}/yr left on the table
              <span className="text-muted"> · at ~{refApy}% APY</span>
            </div>
          ) : null}
        </div>
        <div className="lg:col-span-5 flex lg:justify-end">
          <button
            type="button"
            onClick={handleClick}
            className={
              generated
                ? "btn-ghost inline-flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium text-foreground"
                : "btn-primary inline-flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium text-white"
            }
            title={
              generated
                ? "Scroll to your ranked opportunities"
                : "Score live Arbitrum yield opportunities for your idle capital"
            }
          >
            {generated ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generated ? "View strategies" : "Generate strategies"}
          </button>
        </div>
      </div>
    </div>
  );
}
