"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { ChevronDown, Loader2 } from "lucide-react";
import { useScan } from "@/hooks/use-scan";
import { ConnectButton } from "@/components/wallet/connect-button";
import { IdleBanner } from "@/components/app/idle-banner";
import { BalanceTable } from "@/components/app/balance-table";
import { Opportunities } from "@/components/app/opportunities";

export default function AppPage() {
  const searchParams = useSearchParams();
  const demoAddress = searchParams.get("address");
  const { address: connectedAddress, isConnected } = useAccount();

  const activeAddress = (demoAddress ?? connectedAddress) as
    | `0x${string}`
    | undefined;
  const isDemo = !!demoAddress && !isConnected;

  const { data, isLoading, isError, error } = useScan(activeAddress);
  const [generated, setGenerated] = useState(false);
  const [showBalances, setShowBalances] = useState(false);

  if (!activeAddress) {
    return (
      <main className="flex-1 flex items-center justify-center px-5 py-24">
        <div className="max-w-md text-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-4">
            [01] · connect to scan
          </div>
          <h1 className="text-3xl lg:text-4xl tracking-[-0.03em] font-semibold leading-[1.1] mb-5">
            Plug in your{" "}
            <span className="gradient-text-gold">Arbitrum wallet</span>
          </h1>
          <p className="text-muted-strong mb-8">
            We&apos;ll pull your balances, identify idle capital, and surface
            ranked yield opportunities. Non-custodial — you sign every action.
          </p>
          <div className="flex justify-center">
            <ConnectButton size="lg">Connect wallet</ConnectButton>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-10 lg:py-14 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
              {isDemo ? "demo wallet · read-only" : "your wallet"}
            </div>
            <div className="font-mono tabular text-lg">{activeAddress}</div>
          </div>
          {data && (
            <div className="flex items-center gap-6 text-xs">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
                  total
                </div>
                <div className="font-mono tabular text-base">
                  ${data.totalUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">
                  assets
                </div>
                <div className="font-mono tabular text-base">
                  {data.tokens.length}
                </div>
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="rounded-xl border border-border bg-surface p-10 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <div className="text-sm text-muted">
              Scanning wallet · multicall in progress…
            </div>
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-rose/30 bg-rose/5 p-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-rose mb-2">
              scan failed
            </div>
            <p className="text-sm text-muted-strong">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        )}

        {data && (
          <>
            <IdleBanner
              idleUsd={data.idleUsd}
              totalUsd={data.totalUsd}
              tokenCount={data.tokens.filter((t) => t.idle).length}
              generated={generated}
              onGenerate={() => setGenerated(true)}
            />
            <section className="space-y-4">
              <button
                type="button"
                onClick={() => setShowBalances((v) => !v)}
                aria-expanded={showBalances}
                className="w-full flex items-center justify-between gap-3 text-left group"
              >
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted group-hover:text-foreground transition-colors">
                  balance breakdown · {data.tokens.length} assets
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-muted transition-transform ${
                    showBalances ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showBalances && <BalanceTable tokens={data.tokens} />}
            </section>
            {generated && <Opportunities scan={data} />}
          </>
        )}
      </div>
    </main>
  );
}
