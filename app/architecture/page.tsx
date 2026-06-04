import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";
import {
  TESTNET_DEPLOYMENT as DEPLOYMENT,
  isDeployed,
  arbiscanSepolia,
} from "@/lib/testnet";

export const metadata: Metadata = {
  title: "Architecture — ArbiFlow",
  description:
    "How ArbiFlow ships: a live mainnet intelligence layer today, plus a non-custodial execution vault proven on Arbitrum Sepolia and against the real Aave V3 pool.",
};

type Tone = "live" | "testnet" | "proof";

function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  const color =
    tone === "live"
      ? "text-mint border-mint/40"
      : tone === "testnet"
        ? "text-gold border-gold/40"
        : "text-accent border-accent/40";
  return (
    <span
      className={`inline-flex items-center gap-2 self-start rounded-full border ${color} bg-surface px-3 py-1 text-[10px] font-mono uppercase tracking-widest`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {children}
    </span>
  );
}

const mainnetLayer = [
  {
    name: "Live protocol data",
    detail:
      "DeFiLlama feed — 42 Arbitrum protocols, APY + TVL, refreshed every 5 min with a snapshot fallback.",
    src: "lib/llama.ts",
  },
  {
    name: "On-chain wallet scan",
    detail:
      "viem multicall reads real balances across Arbitrum, Base & Optimism.",
    src: "lib/scan.ts",
  },
  {
    name: "Risk-adjusted scoring",
    detail:
      "Gas-aware net APY ranking over APY, TVL, protocol trust, stability & price forecast.",
    src: "lib/score.ts",
  },
  {
    name: "One-signature execution",
    detail: "Aave V3 direct supply, Enso routing, and Relay cross-chain bridge.",
    src: "lib/aave.ts · lib/enso.ts · lib/relay.ts",
  },
];

const flow: { step: "deposit" | "rebalance" | "withdraw"; detail: string }[] = [
  {
    step: "deposit",
    detail:
      "Idle USDC moves into your own vault clone. Non-custodial from block one.",
  },
  {
    step: "rebalance",
    detail:
      "A keeper submits a backend-signed batch into a whitelisted protocol. The vault enforces a portfolio-value floor on every move.",
  },
  {
    step: "withdraw",
    detail:
      "Only the owner can pull funds out; emergencyWithdraw is the always-open escape hatch, even if the keeper goes dark.",
  },
];

const contractRows: { label: string; addr: string }[] = [
  { label: "VaultFactory", addr: DEPLOYMENT.factory },
  { label: "Demo USDC (afUSDC)", addr: DEPLOYMENT.usdc },
  ...(DEPLOYMENT.demoVault
    ? [{ label: "Demo vault", addr: DEPLOYMENT.demoVault }]
    : []),
  ...DEPLOYMENT.protocols.map((p) => ({ label: p.label, addr: p.address })),
];

const forkTests = [
  {
    name: "test_RebalanceSuppliesToRealAave",
    detail: "USDC → Aave V3 supply, aUSDC received 1:1, value floor holds.",
  },
  {
    name: "test_RoundTripThroughRealAave",
    detail: "supply then withdraw — a full round-trip back to USDC.",
  },
];

const mainnetSteps = [
  {
    head: "Swap the target",
    detail:
      "Replace the demo mock with the real protocol adapters — Aave, Compound, Morpho — already indexed in layer one.",
  },
  {
    head: "Harden the admin",
    detail:
      "Move factory ownership to a timelock + multisig; the signer becomes the production backend key.",
  },
  {
    head: "Audit & ship",
    detail:
      "External audit of the vault, then flip the dashboard's one-click deploy onto mainnet.",
  },
];

export default function ArchitecturePage() {
  const deployed = isDeployed(DEPLOYMENT);

  return (
    <PageShell>
      <PageHeader
        section="[A] · Architecture"
        title={
          <>
            Mainnet-ready today.{" "}
            <span className="text-mint">Testnet-proven</span> execution.
          </>
        }
        subtitle="Two layers. The intelligence layer is live on mainnet right now. The non-custodial execution vault is being proven on Arbitrum Sepolia — and against the real Aave V3 pool — before it ever touches mainnet funds."
      />

      {/* 01 — Mainnet intelligence layer */}
      <Section
        number="01"
        label="Layer one · live on mainnet"
        title="Real data, already shipping."
      >
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Badge tone="live">Live · Arbitrum mainnet</Badge>
          <p className="text-muted-strong leading-relaxed">
            Everything in the dashboard runs on real protocol data today — no
            mocks, no seed data. This is the part that goes to mainnet as-is.
          </p>
          <div className="flex gap-4 text-sm font-mono">
            <Link
              href="/app"
              className="text-accent hover:text-accent-hover transition-colors"
            >
              open dashboard →
            </Link>
            <Link
              href="/status"
              className="text-muted hover:text-foreground transition-colors"
            >
              status →
            </Link>
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-border-strong overflow-hidden">
            <ul className="divide-y hairline">
              {mainnetLayer.map((r) => (
                <li key={r.name} className="px-6 py-5 bg-surface">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-[10px] font-mono text-muted shrink-0">
                      {r.src}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed">
                    {r.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 02 — Testnet execution vault */}
      <Section
        number="02"
        label="Layer two · proving on testnet"
        title="The non-custodial execution vault."
      >
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Badge tone="testnet">Testnet · Arbitrum Sepolia</Badge>
          <p className="text-muted-strong leading-relaxed">
            A per-user vault that ArbiFlow can rebalance but never drain. The
            backend signs <em>where</em> funds may go; the chain enforces that
            only whitelisted targets are touched and portfolio value can&apos;t
            drop more than 1% per move.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            On testnet a labelled mock protocol stands in for the real markets —
            the same code path that hits Aave on mainnet, proven below.
          </p>
        </div>
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="rounded-xl border border-border-strong overflow-hidden">
            <ul className="divide-y hairline">
              {flow.map((f, i) => {
                const tx = DEPLOYMENT.txs?.[f.step];
                return (
                  <li
                    key={f.step}
                    className="grid grid-cols-12 gap-4 px-6 py-5 items-baseline bg-surface"
                  >
                    <div className="col-span-12 sm:col-span-3 flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-muted tabular">
                          0{i + 1}
                        </span>
                        <span className="font-mono text-mint">{f.step}()</span>
                      </div>
                      {tx && (
                        <a
                          href={arbiscanSepolia(tx, "tx")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono text-accent hover:text-accent-hover transition-colors"
                        >
                          view tx ↗
                        </a>
                      )}
                    </div>
                    <p className="col-span-12 sm:col-span-9 text-sm text-muted leading-relaxed">
                      {f.detail}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-surface/40 p-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-4">
              deployed · {DEPLOYMENT.chain}
            </div>
            {deployed ? (
              <ul className="space-y-2.5">
                {contractRows.map((c) => {
                  const addr = c.addr;
                  if (!addr) return null;
                  return (
                    <li
                      key={c.label}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="text-muted-strong">{c.label}</span>
                      <a
                        href={arbiscanSepolia(addr)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-accent hover:text-accent-hover transition-colors"
                      >
                        {addr.slice(0, 10)}…{addr.slice(-8)} ↗
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted leading-relaxed">
                Run{" "}
                <code className="font-mono text-muted-strong">
                  contracts/script/DeployDemo.s.sol
                </code>{" "}
                against Arbitrum Sepolia, then paste the addresses into{" "}
                <code className="font-mono text-muted-strong">
                  lib/testnet.ts
                </code>{" "}
                — the live Arbiscan links appear here.
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* 03 — Real protocol proof */}
      <Section number="03" label="Proof" title="Run against the real Aave V3.">
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Badge tone="proof">Foundry · mainnet fork</Badge>
          <p className="text-muted-strong leading-relaxed">
            The same guarded rebalance, executed against the real Aave V3 pool on
            a fork of Arbitrum One. This is how the vault will move funds into
            production protocols — exercised with zero real capital.
          </p>
        </div>
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-border-strong overflow-hidden">
            <ul className="divide-y hairline">
              {forkTests.map((x) => (
                <li
                  key={x.name}
                  className="px-6 py-5 bg-surface flex items-start gap-4"
                >
                  <span className="text-mint font-mono text-sm shrink-0 mt-0.5">
                    ✓ pass
                  </span>
                  <div>
                    <div className="font-mono text-sm text-foreground">
                      {x.name}
                    </div>
                    <p className="mt-1 text-sm text-muted leading-relaxed">
                      {x.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-[11px] font-mono text-muted">
            test/RebalanceForkAave.t.sol · real Aave V3 Pool 0x794a…14aD
          </p>
        </div>
      </Section>

      {/* 04 — Path to mainnet */}
      <Section number="04" label="Path to mainnet" title="What flips the switch.">
        <div className="lg:col-span-12">
          <div className="grid sm:grid-cols-3 gap-px rounded-xl overflow-hidden border border-border-strong bg-border-strong">
            {mainnetSteps.map((x) => (
              <div key={x.head} className="bg-surface p-6">
                <div className="text-foreground font-medium mb-2">{x.head}</div>
                <p className="text-sm text-muted leading-relaxed">{x.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
