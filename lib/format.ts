// Shared display formatters — single source of truth so component copies can't drift.

export const fmtUsd = (n: number, maxFrac = 2) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: maxFrac })}`;

/** USD with a null fallback ("—") — used for prices/values that may be missing. */
export const fmtUsdN = (n: number | null) => (n === null ? "—" : fmtUsd(n));

export const fmtApy = (apy: number) => `${apy.toFixed(2)}%`;

export const fmtTvl = (n: number) => {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

export const formatAddress = (addr: string) =>
  `${addr.slice(0, 6)}…${addr.slice(-4)}`;

/** Format a 6-decimal token amount (afUSDC) for display. */
export const fmtUsdc = (x: bigint) =>
  (Number(x) / 1e6).toLocaleString("en-US", { maximumFractionDigits: 2 });

/** Compact relative time like "just now" / "3m ago" / "2h ago". */
export const relativeTime = (iso: string) => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const secs = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (secs < 45) return "just now";
  if (secs < 90) return "1m ago";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};
