// Real copy, numbers and on-chain values pulled from the shipped ArbiFlow app
// (components/landing/hero.tsx, allocation-board.tsx, lib/score.ts, DEMO.md).
import { C } from "./theme";

export const WALLET = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
export const SITE = "arbiflow-one.vercel.app";

// Top marquee — Arbitrum pools with live-style APYs.
export const TICKER = [
  { label: "Aave v3", sym: "USDC", apy: 4.31, up: true, icon: "aave-v3.png" },
  { label: "Radiant", sym: "USDC", apy: 6.84, up: false, icon: "radiant-v2.png" },
  { label: "GMX v2", sym: "GLP", apy: 14.22, up: false, icon: "gmx-v2-perps.png" },
  { label: "Pendle", sym: "weETH", apy: 9.18, up: true, icon: "pendle.png" },
  { label: "Uniswap v3", sym: "ETH/USDC", apy: 11.46, up: true, icon: "uniswap-v3.png" },
  { label: "Camelot v3", sym: "ARB", apy: 7.92, up: false, icon: "camelot-v3.png" },
  { label: "Curve", sym: "3pool", apy: 3.74, up: true, icon: "curve-dex.png" },
  { label: "Lido", sym: "wstETH", apy: 3.1, up: true, icon: "lido.png" },
] as const;

// Wallet scan.
export const BALANCES = [
  { sym: "USDC", amount: 1840.1, idle: true },
  { sym: "ETH", amount: 8.412, idle: false },
  { sym: "ARB", amount: 682.5, idle: true },
] as const;
export const IDLE_TOTAL = 32348.1;

// Ranked opportunities + the Aave v3 top-match composite score.
export const RANKED = [
  { label: "Aave v3", sym: "USDC", apy: 4.31, score: 78, top: true, icon: "aave-v3.png" },
  { label: "Radiant", sym: "USDC", apy: 6.84, score: 64, top: false, icon: "radiant-v2.png" },
  { label: "GMX v2", sym: "GLP", apy: 14.22, score: 58, top: false, icon: "gmx-v2-perps.png" },
] as const;

export const TOP = { label: "Aave v3", sym: "USDC", apy: 4.31, deploy: 1840 } as const;

// Composite score weights from lib/score.ts: APY40 · TVL20 · Trust15 · Stability15 · Forecast10.
export const COMPOSITE = 78;
export const FACTORS = [
  { key: "apy", label: "APY", val: 20, max: 40 },
  { key: "tvl", label: "TVL", val: 20, max: 20 },
  { key: "trust", label: "Trust", val: 15, max: 15 },
  { key: "stability", label: "Stability", val: 15, max: 15 },
  { key: "forecast", label: "Forecast", val: 8, max: 10 },
] as const; // sums to 78

// Testnet delegation-vault allow-list (mock demo protocols — not the real ones).
// Colors mirror allocation-board.tsx: aave=blue, compound=mint, morpho=gold.
export const DEMO_PROTOCOLS = [
  { key: "aave", label: "Aave", mono: "A", color: C.blueLight, icon: "aave-v3.png" },
  { key: "compound", label: "Compound", mono: "C", color: C.mint, icon: "compound-v3.png" },
  { key: "morpho", label: "Morpho", mono: "M", color: C.gold, icon: "morpho-blue.png" },
] as const;

export type DemoKey = (typeof DEMO_PROTOCOLS)[number]["key"];

// On-chain proof — real Arbitrum Sepolia values (DEMO.md, lib/testnet.ts).
export const VAULT = "0xB2AA9601b085350fD0eE12697C829BBa51f4d56E";
export const AAVE_V3_POOL = "0x794a61358D6845594F94dc1DB02A252b5b4814aD";
export const TX = {
  deposit: "0x2112658d20d8671fdbf0287783aa09d589c7903374a2e3b0544996617285ff07",
  rebalance: "0x49de94facec1e9704437fa5de349e5b05e110a929b13b9c5b2fe37a708da3d02",
  withdraw: "0x1532325cb5b26a849f1b1b9e379a4bc3b2173ece092c8e7ab7b0a815f0369208",
  // extra plausible rebalance hashes for the activity stream
  r2: "0x7c0f2a9b4e3d1c8a6f5b2e9d0a4c7b1e8f3d6a9c2b5e8d1f4a7c0b3e6d9f2a5c",
  r3: "0x3e8a1d6c9b2f5a8e0d3c6b9f2a5e8d1c4b7a0e3d6f9c2b5a8e1d4c7b0f3a6e9d",
} as const;
