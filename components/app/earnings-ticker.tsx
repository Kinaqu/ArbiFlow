"use client";

import { useEffect, useState } from "react";
import { perSecondYield } from "@/lib/earnings";

/**
 * Live-counting earnings since `since` (defaults to mount). Pure visual flourish
 * for the deposit receipt + portfolio — linear accrual at the pool's APY.
 */
export function EarningsTicker({
  amountUsd,
  apy,
  since,
  className = "",
}: {
  amountUsd: number;
  apy: number;
  since?: number;
  className?: string;
}) {
  const [start] = useState(() => since ?? Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 400);
    return () => clearInterval(id);
  }, []);

  const elapsedSec = Math.max(0, (now - start) / 1000);
  const earned = perSecondYield(amountUsd, apy) * elapsedSec;

  return (
    <span className={`font-mono tabular text-mint ${className}`}>
      +${earned.toFixed(6)}
    </span>
  );
}
