export const usd2 = (n: number): string =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const num = (n: number, dp = 2): string =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });

export const shortHash = (h: string): string => `${h.slice(0, 10)}…${h.slice(-6)}`;
export const shortAddr = (a: string): string => `${a.slice(0, 6)}…${a.slice(-4)}`;
