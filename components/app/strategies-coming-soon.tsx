import { ArrowUpRight, Lock } from "lucide-react";

const placeholderStrategies = [
  { protocol: "Aave v3", asset: "USDC", apy: "4.31", risk: "Low" },
  { protocol: "Radiant", asset: "USDC", apy: "6.84", risk: "Med" },
  { protocol: "GMX v2", asset: "GLP", apy: "14.22", risk: "High" },
];

export function StrategiesComingSoon() {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
            ranked strategies
          </div>
          <h2 className="text-xl lg:text-2xl tracking-tight font-medium">
            Available in <span className="text-muted">Phase 2 · scoring engine</span>
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted">
          <Lock className="w-3 h-3" />
          locked
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 relative">
        <div
          aria-hidden
          className="absolute inset-0 z-10 backdrop-blur-[1px] bg-background/40 rounded-xl flex items-center justify-center pointer-events-none"
        >
          <div className="text-center px-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
              Phase 2 · day 6–10
            </div>
            <p className="text-sm text-muted-strong max-w-xs">
              Once your wallet is scanned, the scoring engine will rank every
              opportunity by risk-adjusted, gas-aware net APY.
            </p>
          </div>
        </div>
        {placeholderStrategies.map((s, i) => (
          <div
            key={s.protocol}
            className="rounded-xl border border-border bg-surface p-4 opacity-50"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">
                {s.protocol}{" "}
                <span className="font-mono text-muted">/ {s.asset}</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
                {s.risk}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div
                  className={`font-mono tabular text-2xl font-semibold ${
                    i === 0 ? "gradient-text-gold" : "text-foreground"
                  }`}
                >
                  {s.apy}%
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted">
                  net APY
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
