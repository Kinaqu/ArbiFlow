import { POOLS_SCORED } from "@/lib/constants";

const stats = [
  {
    v: `${POOLS_SCORED}+`,
    l: "Arbitrum yield pools to compare — lending, LPs, perps, fixed yield",
    src: "DeFiLlama",
  },
  {
    v: "3–14%",
    l: "the USDC yield range across them; the wrong pick leaves money idle",
    src: "DeFiLlama",
  },
  {
    v: "0%",
    l: "what stablecoins earn sitting untouched in your wallet",
    src: "",
  },
];

export function Problem() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 lg:py-16">
        <div className="max-w-3xl">
          <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-4">
            [01] · The problem
          </div>
          <h2 className="text-3xl lg:text-5xl tracking-[-0.03em] font-semibold leading-[1.05]">
            Most of your DeFi capital is{" "}
            <span className="text-muted">just sitting there.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-strong leading-relaxed">
            Too much capital sits in stablecoins earning nothing — not because
            users are careless, but because comparing every protocol by hand is
            a full-time job.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden">
          {stats.map((s) => (
            <div key={s.l} className="bg-surface p-7 lg:p-8">
              <div className="text-4xl lg:text-5xl font-mono tabular font-semibold gradient-text-gold">
                {s.v}
              </div>
              <div className="text-sm text-foreground mt-3 leading-snug">
                {s.l}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-3">
                {s.src}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
