"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { usePoolChart } from "@/hooks/use-pool-chart";
import { fmtApy } from "@/lib/format";

const W = 100;
const H = 30;
const PAD = 3;

export function PoolChart({ poolId }: { poolId: string }) {
  const gradId = useId();
  const { data, isLoading, isError } = usePoolChart(poolId, true);
  const points = data?.points ?? [];

  if (isLoading) {
    return (
      <div className="h-14 flex items-center text-[10px] font-mono uppercase tracking-widest text-muted">
        loading APY history…
      </div>
    );
  }
  // Degrade gracefully — no chart, no crash — when data is unavailable.
  if (isError || points.length < 2) return null;

  const apys = points.map((p) => p.apy);
  const min = Math.min(...apys);
  const max = Math.max(...apys);
  const range = max - min || 1;
  const x = (i: number) => (i / (points.length - 1)) * W;
  const y = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2);

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)},${y(p.apy).toFixed(2)}`)
    .join(" ");
  const area = `${line} L ${W},${H} L 0,${H} Z`;
  const latest = points[points.length - 1].apy;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted">
        <span>APY · last {points.length}d</span>
        <span className="text-foreground">{fmtApy(latest)} now</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full h-14"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34E0A1" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#34E0A1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradId})`} />
        <motion.path
          d={line}
          fill="none"
          stroke="#34E0A1"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </svg>
      <div className="flex items-center justify-between text-[10px] font-mono text-muted">
        <span>lo {fmtApy(min)}</span>
        <span>hi {fmtApy(max)}</span>
      </div>
    </div>
  );
}
