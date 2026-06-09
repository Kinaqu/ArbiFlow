import { Radar, Activity, ShieldCheck, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { POOLS_SCORED } from "@/lib/constants";
import {
  TESTNET_DEPLOYMENT as DEPLOYMENT,
  arbiscanSepolia,
} from "@/lib/testnet";

type Tone = "live" | "testnet" | "proof";

const toneClass: Record<Tone, string> = {
  live: "text-mint border-mint/40",
  testnet: "text-gold border-gold/40",
  proof: "text-accent border-accent/40",
};

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-2 self-start rounded-full border ${toneClass[tone]} bg-surface px-3 py-1 text-[10px] font-mono uppercase tracking-widest`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {children}
    </span>
  );
}

// A static condensation of the /architecture page: the one-glance answer to a
// judge's first question — "is any of this actually real?" No data fetching;
// the demo-vault link points at the live, auto-rebalancing vault on Arbiscan.
const demoVault = DEPLOYMENT.demoVault;

export function WhatsReal() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 lg:py-16">
        <div className="max-w-3xl">
          <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-4">
            Proof · What&apos;s real
          </div>
          <h2 className="text-3xl lg:text-5xl tracking-[-0.03em] font-semibold leading-[1.05]">
            Not a mockup.{" "}
            <span className="text-muted">It&apos;s already on-chain.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-strong leading-relaxed">
            ArbiFlow curates and cryptographically signs every move — and the
            contract guarantees it can <span className="text-foreground">never
            withdraw your funds</span>. Here&apos;s what&apos;s live today, what&apos;s proven
            on testnet, and where it&apos;s tested against the real thing.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {/* 01 — live mainnet intelligence */}
          <div className="flex flex-col gap-4 rounded-xl border border-border-strong bg-surface p-7">
            <Badge tone="live">Live · Arbitrum mainnet</Badge>
            <Radar className="w-5 h-5 text-mint" />
            <div className="font-medium text-foreground">Intelligence layer</div>
            <p className="text-sm text-muted leading-relaxed flex-1">
              Scans your wallet and ranks ~{POOLS_SCORED} Arbitrum pools by a
              0–100 risk-adjusted score, then deploys the top match in one
              signature. Real DeFiLlama + on-chain data, no mocks.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 text-sm font-mono text-accent hover:text-accent-hover transition-colors"
            >
              open dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 02 — testnet delegation vault, auto-rebalancing now */}
          <div className="flex flex-col gap-4 rounded-xl border border-border-strong bg-surface p-7">
            <Badge tone="testnet">Testnet · Arbitrum Sepolia</Badge>
            <Activity className="w-5 h-5 text-gold" />
            <div className="font-medium text-foreground">
              Delegation vault, auto-rebalancing
            </div>
            <p className="text-sm text-muted leading-relaxed flex-1">
              A non-custodial per-user vault a keeper rebalances every ~35s —
              backend-signed, whitelist-guarded, with a portfolio-value floor on
              every move. Only the owner can withdraw.
            </p>
            {demoVault ? (
              <a
                href={arbiscanSepolia(demoVault)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-mono text-accent hover:text-accent-hover transition-colors"
              >
                live demo vault <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            ) : (
              <Link
                href="/architecture"
                className="inline-flex items-center gap-1.5 text-sm font-mono text-accent hover:text-accent-hover transition-colors"
              >
                see architecture <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* 03 — proven against the real Aave V3 */}
          <div className="flex flex-col gap-4 rounded-xl border border-border-strong bg-surface p-7">
            <Badge tone="proof">Foundry · mainnet fork</Badge>
            <ShieldCheck className="w-5 h-5 text-accent" />
            <div className="font-medium text-foreground">
              Proven vs. real Aave V3
            </div>
            <p className="text-sm text-muted leading-relaxed flex-1">
              The same guarded rebalance, executed against the real Aave V3 pool
              on an Arbitrum One fork — supply and full round-trip, with the
              value floor holding. Zero real capital at risk.
            </p>
            <span className="font-mono text-[11px] text-muted">
              test/RebalanceForkAave.t.sol ✓
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
