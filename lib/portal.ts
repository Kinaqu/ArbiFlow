// Arbitrum Portal's Earn surface (portal.arbitrum.io/earn/market) curates a
// small set of foundation-endorsed protocols into three categories. The Portal
// itself is a Cloudflare-protected SPA backed by DeFiLlama, so we encode the
// curation locally and tag pools as they flow through normalize().
//
// On Arbitrum, Lido and Ether.fi themselves don't run pools — LSTs surface
// through lending markets that accept wstETH/weETH/rsETH/ezETH as collateral.
// So "liquid-staking" is computed dynamically when a pool's symbol matches a
// known LST token, regardless of host protocol.

export type PortalCategory = "lending" | "liquid-staking" | "fixed-yield";

export const PORTAL_CATEGORY_LABELS: Record<PortalCategory, string> = {
  lending: "Lending",
  "liquid-staking": "Liquid Staking",
  "fixed-yield": "Fixed Yield",
};

const BASE_CATEGORY: Record<string, PortalCategory> = {
  "aave-v3": "lending",
  "morpho-blue": "lending",
  "fluid-lending": "lending",
  "compound-v3": "lending",
  pendle: "fixed-yield",
};

const LST_SYMBOLS = new Set([
  "WSTETH",
  "WEETH",
  "RSETH",
  "EZETH",
  "STETH",
  "RETH",
  "CBETH",
  "ETH+",
]);

export const PORTAL_PROJECTS = new Set(Object.keys(BASE_CATEGORY));

export type PortalMeta = {
  portalFeatured: boolean;
  portalCategory: PortalCategory | null;
};

export function portalMetaFor(
  project: string,
  symbols: readonly string[],
): PortalMeta {
  if (!PORTAL_PROJECTS.has(project)) {
    return { portalFeatured: false, portalCategory: null };
  }
  const isLst = symbols.some((s) => LST_SYMBOLS.has(s));
  const category: PortalCategory = isLst
    ? "liquid-staking"
    : BASE_CATEGORY[project];
  return { portalFeatured: true, portalCategory: category };
}
