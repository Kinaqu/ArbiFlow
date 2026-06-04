"use client";

import { parseUnits } from "viem";
import { Coins, ExternalLink, Loader2 } from "lucide-react";
import { fmtUsdc } from "@/lib/format";
import {
  TESTNET_DEPLOYMENT as DEPLOYMENT,
  arbiscanSepolia,
} from "@/lib/testnet";
import type { VaultApi } from "./testnet-app";

const FAUCET_AMOUNT = parseUnits("1000", 6);

export function FaucetCard({ v }: { v: VaultApi }) {
  const busy = v.pending === "faucet";
  return (
    <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted">
          01 · faucet
        </div>
        <Coins className="w-4 h-4 text-gold" />
      </div>

      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
          afUSDC in wallet
        </div>
        <div className="font-mono tabular text-3xl font-semibold">
          {fmtUsdc(v.state.walletUsdc)}
        </div>
      </div>

      <button
        type="button"
        onClick={() => v.faucet(FAUCET_AMOUNT)}
        disabled={!!v.pending}
        className="btn-primary w-full rounded-md py-2.5 text-sm font-medium text-white inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {busy ? "Minting…" : "Get 1,000 afUSDC"}
      </button>

      <div className="flex items-center justify-between text-[11px] text-muted">
        <a
          href={arbiscanSepolia(DEPLOYMENT.usdc)}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground inline-flex items-center gap-1"
        >
          afUSDC token <ExternalLink className="w-3 h-3" />
        </a>
        <a
          href="https://www.alchemy.com/faucets/arbitrum-sepolia"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground inline-flex items-center gap-1"
        >
          need Sepolia ETH? <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
