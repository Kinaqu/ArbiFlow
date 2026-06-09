// Curated anchor protocols ArbiFlow scores on Arbitrum — kept in sync with
// CURATED_PROJECTS in lib/pool-select.ts. Used in landing copy as the headline
// "protocols" number so it can't drift between sections.
export const CURATED_PROTOCOL_COUNT = 8;

// Approximate size of the Arbitrum pool universe ArbiFlow ranks (DeFiLlama
// yields, curated + honorable). Conservative, rounded down — the bundled
// snapshot and the live feed both exceed this. Landing copy only.
export const POOLS_SCORED = 500;

// Conservative representative stablecoin APY used only for the pre-generation
// "foregone yield" framing on the idle banner (before live pool APYs load).
export const REFERENCE_STABLE_APY = 5;
