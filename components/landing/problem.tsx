export function Problem() {
  return (
    <section className="relative border-y border-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-4">
              [01] · The problem
            </div>
            <h2 className="text-3xl lg:text-5xl tracking-[-0.03em] font-semibold leading-[1.05]">
              Most of your DeFi capital is{" "}
              <span className="text-muted">just sitting there.</span>
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pl-12 lg:border-l hairline">
            <p className="text-lg text-muted-strong leading-relaxed">
              The average Arbitrum wallet holds{" "}
              <span className="text-foreground font-medium">over 60%</span> of
              its balance in tokens earning nothing. Not because the user is
              lazy — because comparing protocols is a full‑time job. APYs lie.
              Gas eats returns. Risk is impossible to price without a model.
            </p>
            <div className="mt-10 grid sm:grid-cols-3 gap-px bg-border">
              {[
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
              ].map((s) => (
                <div key={s.l} className="bg-background p-6">
                  <div className="text-3xl lg:text-4xl font-mono tabular font-semibold gradient-text-gold">
                    {s.v}
                  </div>
                  <div className="text-sm text-foreground mt-2 leading-snug">
                    {s.l}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted mt-3">
                    {s.src}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
