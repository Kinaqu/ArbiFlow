# ArbiFlow — 2-minute demo

**Live app:** https://arbiflow-one.vercel.app
**Demo video:** _add link (Loom / YouTube)_

> One-liner: *ArbiFlow scans your Arbitrum wallet, ranks every yield by a 0–100 risk-adjusted score, and — through a non-custodial delegation vault — auto-rebalances your capital while the chain guarantees it can never take it.*

---

## Track 1 — no wallet needed (~45s) · "this isn't vaporware"

Best for judges. Proves the hard part is already on-chain, zero setup.

1. **Open** [`/architecture`](https://arbiflow-one.vercel.app/architecture).
   - Point at the **two layers**: live mainnet intelligence + the testnet delegation vault.
   - This page keeps the **public demo vault rebalancing live** while it's open.
2. **Click the live demo vault** → [Arbiscan ↗](https://sepolia.arbiscan.io/address/0xB2AA9601b085350fD0eE12697C829BBa51f4d56E).
   - Show the stream of `rebalance` transactions — a keeper moving funds **on-chain, every ~35s**, on its own.
   - Sample on-chain proof (deposit / rebalance / withdraw):
     - [deposit ↗](https://sepolia.arbiscan.io/tx/0x2112658d20d8671fdbf0287783aa09d589c7903374a2e3b0544996617285ff07)
     - [rebalance ↗](https://sepolia.arbiscan.io/tx/0x49de94facec1e9704437fa5de349e5b05e110a929b13b9c5b2fe37a708da3d02)
     - [withdraw ↗](https://sepolia.arbiscan.io/tx/0x1532325cb5b26a849f1b1b9e379a4bc3b2173ece092c8e7ab7b0a815f0369208)
3. **Open** [`/app`](https://arbiflow-one.vercel.app/app) (mainnet dashboard).
   - Live DeFiLlama data → ranked strategies, each with the **0–100 score breakdown** (APY / TVL / trust / stability / forecast).

**Say:** *"The intelligence layer is live on Arbitrum mainnet. The vault that acts on it is non-custodial and already auto-rebalancing on testnet — you're watching it move real on-chain transactions right now."*

---

## Track 2 — full flow with a wallet (~90s)

Needs a wallet on **Arbitrum Sepolia** + a little Sepolia ETH ([faucet](https://www.alchemy.com/faucets/arbitrum-sepolia)).

1. Open [`/app`](https://arbiflow-one.vercel.app/app), switch to the testnet vault view, **connect**.
2. **Mint afUSDC** from the faucet card (the demo stable).
3. **Deposit** afUSDC → it moves into *your own* vault clone. → *non-custodial from block one.*
4. **Approve** the protocols you trust (Aave / Compound / Morpho demo targets). → *you choose the allow-list.*
5. **Watch it rebalance** (~every 35s): the Activity log fills with on-chain txs; the allocation board shows funds moving to the top-scoring approved protocol.
6. **Withdraw** → only you can. Try it from the owner account; note the keeper never can.

### Where each on-chain guarantee shows up

| Moment | Guarantee enforced by the contract |
|---|---|
| Deposit | Funds live in **your** vault clone, not ArbiFlow's |
| Approve protocols | Keeper can only ever touch **whitelisted targets** |
| Rebalance | Backend-signed (EIP-712) + **portfolio value can't drop >~1%** per batch |
| Withdraw | **Owner-only**; `emergencyWithdraw` works even if the keeper goes dark |

---

## Talking points (the moat)

- **Curate + sign, never drain.** The backend signs *where* funds may go; the chain enforces *only-whitelisted, value-preserving, owner-withdrawable*. A stolen keeper key still can't move value out.
- **Proven against the real thing.** The same guarded rebalance passes a Foundry **fork test against the real Aave V3 pool** — see [`contracts/README.md`](contracts/README.md).
- **Transparent scoring.** Not a black box: APY 40 · TVL 20 · Trust 15 · Stability 15 · Forecast 10 = 100 (`lib/score.ts`).
