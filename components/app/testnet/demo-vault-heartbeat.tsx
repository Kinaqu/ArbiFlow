"use client";

import { useEffect, useRef } from "react";
import { TESTNET_DEPLOYMENT as DEPLOYMENT } from "@/lib/testnet";
import { DECISION_MS, msUntilNextDecision } from "@/lib/demo-score";

// All demo protocols are approved for the public showcase vault, so the keeper
// always has somewhere to move when a new leader emerges.
const APPROVED = DEPLOYMENT.protocols.map((p) => p.key);

/**
 * Drives the public /architecture demo vault: posts a keeper tick on the demo
 * cadence (~35s) so the showcase vault auto-rebalances live on-chain, the same
 * way a connected user's vault does. Renders nothing — the backend signs and
 * submits; the browser only nudges the heartbeat. No-op until the demo is deployed.
 */
export function DemoVaultHeartbeat() {
  const vault = DEPLOYMENT.demoVault;
  const busy = useRef(false);

  useEffect(() => {
    if (!vault) return;
    const tick = async () => {
      if (busy.current) return;
      busy.current = true;
      try {
        await fetch("/api/keeper/tick", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ vault, approved: APPROVED }),
        });
      } catch {
        /* transient — the next tick retries */
      } finally {
        busy.current = false;
      }
    };
    // Fire once now, then align to the shared decision boundary.
    tick();
    let interval: ReturnType<typeof setInterval> | undefined;
    const align = setTimeout(() => {
      tick();
      interval = setInterval(tick, DECISION_MS);
    }, msUntilNextDecision());
    return () => {
      clearTimeout(align);
      if (interval) clearInterval(interval);
    };
  }, [vault]);

  return null;
}
