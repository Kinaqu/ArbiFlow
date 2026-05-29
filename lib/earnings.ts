// Simple yield projections shared across the idle banner, cards, deposit modal,
// and portfolio. Linear (non-compounding) — enough for a clear "what you'd earn".

const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

export const yearlyYield = (usd: number, apyPct: number) => (usd * apyPct) / 100;

export const monthlyYield = (usd: number, apyPct: number) =>
  yearlyYield(usd, apyPct) / 12;

export const perSecondYield = (usd: number, apyPct: number) =>
  yearlyYield(usd, apyPct) / SECONDS_PER_YEAR;
