import { CHAINS, type ChainKey } from "@/lib/tokens";

// Small chain marker — a colored dot + label, matching the protocol-icon
// convention of "no remote asset, render a colored token". Avoids shipping
// chain logo PNGs and the attendant 404 risk.
export function ChainBadge({
  chain,
  className = "",
}: {
  chain: ChainKey;
  className?: string;
}) {
  const meta = CHAINS[chain];
  return (
    <span
      className={`text-[9px] font-mono uppercase tracking-wider text-muted-strong border border-border rounded px-1 py-0.5 inline-flex items-center gap-1 flex-shrink-0 ${className}`}
      title={`${meta.label} · chain ${meta.id}`}
    >
      <span
        className="w-1 h-1 rounded-full"
        style={{ background: meta.color }}
      />
      {meta.label}
    </span>
  );
}
