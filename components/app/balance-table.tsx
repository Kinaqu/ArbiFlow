import type { ScannedToken } from "@/lib/scan";
import { fmtUsdN } from "@/lib/format";
import { ChainBadge } from "@/components/app/chain-badge";

const fmtBalance = (n: number) => {
  if (n === 0) return "0";
  if (n < 0.0001) return n.toExponential(2);
  if (n < 1) return n.toFixed(4);
  if (n < 1000) return n.toFixed(3);
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
};

export function BalanceTable({ tokens }: { tokens: ScannedToken[] }) {
  if (tokens.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface/40 p-10 text-center">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">
          empty wallet
        </div>
        <p className="text-muted-strong">
          No tokens detected in the Top-20 Arbitrum index for this address.
          Bridge or fund the wallet to see balances here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-surface-2 text-[10px] font-mono uppercase tracking-widest text-muted">
        <div className="col-span-4">asset</div>
        <div className="col-span-3 text-right">balance</div>
        <div className="col-span-2 text-right">price</div>
        <div className="col-span-2 text-right">value</div>
        <div className="col-span-1 text-right">status</div>
      </div>
      <ul className="divide-y hairline">
        {tokens.map((t) => (
          <li
            key={`${t.chain}-${t.symbol}`}
            className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-surface-2/60 transition-colors"
          >
            <div className="col-span-7 md:col-span-4 flex items-center gap-3 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: t.color }}
              />
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate flex items-center gap-1.5">
                  <span className="truncate">{t.symbol}</span>
                  <ChainBadge chain={t.chain} />
                </div>
                <div className="text-[11px] text-muted truncate font-mono">
                  {t.name}
                </div>
              </div>
            </div>
            <div className="col-span-5 md:col-span-3 text-right font-mono tabular text-sm">
              {fmtBalance(t.balanceFormatted)}
            </div>
            <div className="hidden md:block col-span-2 text-right font-mono tabular text-sm text-muted">
              {fmtUsdN(t.usdPrice)}
            </div>
            <div className="hidden md:block col-span-2 text-right font-mono tabular text-sm font-medium">
              {fmtUsdN(t.usdValue)}
            </div>
            <div className="hidden md:flex col-span-1 justify-end">
              {t.idle ? (
                <span className="text-[10px] font-mono uppercase tracking-wider text-gold border border-gold/40 bg-gold/10 rounded px-1.5 py-0.5">
                  idle
                </span>
              ) : (
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
                  —
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
