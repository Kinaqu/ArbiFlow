"use client";

import { ExternalLink } from "lucide-react";
import { useAccount } from "wagmi";
import {
  TESTNET_DEPLOYMENT as DEPLOYMENT,
  isDeployed,
  arbiscanSepolia,
} from "@/lib/testnet";
import { useVault } from "@/hooks/use-vault";
import { ConnectButton } from "@/components/wallet/connect-button";
import { FaucetCard } from "./faucet-card";
import { VaultCard } from "./vault-card";
import { GasCard } from "./gas-card";
import { AllocationBoard } from "./allocation-board";

export type VaultApi = ReturnType<typeof useVault>;

export function TestnetApp() {
  const { isConnected } = useAccount();
  const v = useVault();

  if (!isDeployed()) return <PendingDeploy />;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-8 lg:py-12 space-y-8">
        <Header />

        {!isConnected ? (
          <ConnectPrompt />
        ) : (
          <>
            {v.error ? (
              <div className="rounded-xl border border-rose/30 bg-rose/5 p-4 text-sm text-rose">
                {v.error}
              </div>
            ) : null}

            <div className="grid lg:grid-cols-2 gap-5">
              <FaucetCard v={v} />
              <VaultCard v={v} />
            </div>

            {v.state.vault ? <GasCard v={v} /> : null}

            <AllocationBoard v={v} />

            <ActivityLog txs={v.txs} />
          </>
        )}

        <SignerNote />
      </div>
    </main>
  );
}

function Header() {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-gold mb-2 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        testnet · arbitrum sepolia
      </div>
      <h1 className="text-2xl lg:text-3xl tracking-[-0.03em] font-semibold leading-[1.1] mb-3">
        The non-custodial{" "}
        <span className="gradient-text-gold">delegation vault</span>, live
      </h1>
      <p className="text-muted-strong max-w-2xl">
        Mint test afUSDC, deposit it into your own vault, and approve the
        protocols you trust — then ArbiFlow&apos;s backend scores them every ~35s
        and moves, or deliberately holds, your funds. Each move&apos;s gas is paid
        from a small ETH reserve you fund in your own vault. You can never move
        funds yourself, only withdraw; every rebalance is a real transaction on
        Arbitrum Sepolia.
      </p>
    </div>
  );
}

function ConnectPrompt() {
  return (
    <div className="rounded-xl border border-border bg-surface p-8 flex flex-col items-center text-center gap-4">
      <p className="text-muted-strong max-w-sm">
        Connect a wallet to try the vault on Arbitrum Sepolia. You&apos;ll need a
        little Sepolia ETH for gas — grab some from a{" "}
        <a
          href="https://www.alchemy.com/faucets/arbitrum-sepolia"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent-hover inline-flex items-center gap-1"
        >
          faucet <ExternalLink className="w-3 h-3" />
        </a>
        .
      </p>
      <ConnectButton size="lg">Connect wallet</ConnectButton>
    </div>
  );
}

function ActivityLog({ txs }: { txs: VaultApi["txs"] }) {
  if (txs.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-4">
        on-chain activity
      </div>
      <ul className="space-y-2">
        {txs.map((t) => (
          <li
            key={t.hash}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="text-foreground">{t.label}</span>
            <a
              href={arbiscanSepolia(t.hash, "tx")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-accent hover:text-foreground inline-flex items-center gap-1"
            >
              {t.hash.slice(0, 10)}…{t.hash.slice(-6)}{" "}
              <ExternalLink className="w-3 h-3" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SignerNote() {
  return (
    <p className="text-[11px] text-muted leading-relaxed border-t border-border pt-4">
      Rebalances are decided and signed by ArbiFlow&apos;s backend — the keeper
      key never reaches your browser — and submitted by the backend keeper, which
      fronts the gas and is reimbursed from the small ETH reserve you fund in your
      own vault. It authorizes <em>where</em> funds may move, but the chain still
      enforces that only whitelisted protocols are touched and value can&apos;t
      drop, and only you can withdraw.
    </p>
  );
}

function PendingDeploy() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-5 py-20 text-center space-y-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-gold">
          testnet · deployment pending
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          The vault demo isn&apos;t deployed yet
        </h1>
        <p className="text-muted-strong">
          Run{" "}
          <code className="font-mono text-muted-strong">
            contracts/script/DeployDemo.s.sol
          </code>{" "}
          against {DEPLOYMENT.chain}, then paste the printed addresses into{" "}
          <code className="font-mono text-muted-strong">lib/testnet.ts</code>.
          The faucet → vault → rebalance flow lights up here automatically.
        </p>
      </div>
    </main>
  );
}
