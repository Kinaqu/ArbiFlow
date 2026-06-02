import { CHAINS, type ChainKey } from "@/lib/tokens";

// Small chain marker — the chain's real logo. The chain name is exposed on
// hover (title) so the marker itself stays compact and text-free.
export function ChainBadge({
  chain,
  className = "",
}: {
  chain: ChainKey;
  className?: string;
}) {
  const meta = CHAINS[chain];
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={meta.logo}
      alt={meta.label}
      title={`${meta.label} · chain ${meta.id}`}
      width={14}
      height={14}
      className={`w-3.5 h-3.5 object-contain flex-shrink-0 ${className}`}
    />
  );
}
