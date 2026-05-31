"use client";

type Brand = { name: string; src: string };

// Real, official logomarks (transparent) live in /public/icons/infra.
const brands: Brand[] = [
  { name: "Arbitrum", src: "/icons/infra/arbitrum.svg" },
  { name: "DeFiLlama", src: "/icons/infra/defillama.png" },
  { name: "Reown", src: "/icons/infra/reown.svg" },
  { name: "Relay", src: "/icons/infra/relay.png" },
  { name: "Enso", src: "/icons/infra/enso.svg" },
  { name: "Aave", src: "/icons/infra/aave.svg" },
];

// Two copies fill wide viewports; the rendered list duplicates this once more so
// the -50% scroll (app/globals.css .animate-scroll-x) loops seamlessly.
const row = [...brands, ...brands];

export function PoweredBy() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-20 lg:pt-24 text-center">
        <div className="text-[11px] font-mono uppercase tracking-widest text-muted">
          Powered by · infrastructure we build on
        </div>
      </div>
      <div className="relative overflow-hidden py-10 lg:py-12">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <div className="flex animate-scroll-x whitespace-nowrap">
          {[...row, ...row].map((b, i) => (
            <div
              key={i}
              className="group flex items-center gap-3 px-7 shrink-0 opacity-80 transition-opacity duration-300 hover:opacity-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.src}
                alt={b.name}
                width={28}
                height={28}
                className="w-7 h-7 object-contain shrink-0 drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]"
              />
              <span className="text-[15px] font-medium tracking-tight text-muted-strong transition-colors duration-300 group-hover:text-foreground">
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
