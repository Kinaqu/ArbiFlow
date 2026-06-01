const stats = [
  {
    v: "$2.4B",
    l: "estimated idle stablecoin balance on Arbitrum",
    src: "DeFiLlama, 2026",
  },
  {
    v: "4.1×",
    l: "spread between worst and best USDC yield this week",
    src: "ArbiFlow index",
  },
  {
    v: "27%",
    l: "of advertised APYs erode under realistic gas",
    src: "ArbiFlow scoring",
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
            The average Arbitrum wallet leaves{" "}
            <span className="text-foreground font-medium">60%+</span> of its
            balance earning nothing — because comparing protocols by hand is a
            full-time job.
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
