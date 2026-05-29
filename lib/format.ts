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
