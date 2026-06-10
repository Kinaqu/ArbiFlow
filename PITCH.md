# ArbiFlow — Pitch video script & storyboard

**Format:** ~2-minute voiceover film (no on-camera presenter) · **1920×1080 · 30 fps**
**Style:** animated title cards + app/Arbiscan footage + reused [demo-video](video/) b-roll
**Audience:** hackathon judges

> **Logline** — *ArbiFlow scans your Arbitrum wallet, ranks every yield by a transparent
> 0–100 score, and — through a non-custodial delegation vault — auto-rebalances your capital
> while the chain guarantees it can never take it.*

**Accuracy guardrails:** the **intelligence layer is live on Arbitrum mainnet**; the
**delegation vault is testnet-only (Arbitrum Sepolia)** — a mainnet vault is *future*. Every
number below traces to the shipped product (see [Sources](#sources)).

---

## At a glance

| Time | Beat | What we say (gist) | What's on screen |
|---|---|---|---|
| 0:00–0:19 | **Problem** | Capital sits idle; comparing 500 pools is a full-time job | Idle wallet → `500+ · 3–14% · 0%` stat cards |
| 0:19–0:35 | **Solution** | Scan, score, deploy — in one signature | Logo sting → ranked board, **78/100** top match |
| 0:35–0:51 | **Transparent score** | The same 5-factor math, no black box | Composite bars fill → 1-signature deploy |
| 0:51–1:18 | **The moat** | Curate + sign, **never drain** | Allow-list → funds rebalance → 3 guarantees |
| 1:18–1:44 | **Proof** | Mainnet-live + testnet vault + fork-tested | "What's real" cards → Arbiscan → `forge test` ✓ |
| 1:44–2:00 | **Vision + CTA** | Today smart yield → tomorrow DeFi autopilot | Roadmap → logo + `arbiflow-one.vercel.app` |

---

## Beat-by-beat

### Beat 1 · The problem — 0:00–0:19
- **VO:** "Most of your DeFi capital is just sitting there. Stablecoins, parked in your wallet, earning zero percent. Across Arbitrum there are over five hundred pools paying anywhere from three to fourteen percent — but finding the right one, and keeping your money there, is a full-time job most people never sign up for."
- **On screen:** Black → one wallet row `USDC · 0% APY` with a slow gold pulse → three stat cards animate in: **500+ pools · 3–14% · 0% idle**.
- **Source:** build 3 stat title-cards mirroring `components/landing/problem.tsx`; optional 2 s wallet shot from demo *Scan* (`video/out/arbiflow-demo.mp4` ~13–20 s).

### Beat 2 · The solution — 0:19–0:35
- **VO:** "ArbiFlow does that job in seconds. It scans your wallet, ranks every yield by a transparent zero-to-one-hundred score, and deploys your capital into the best match — in a single signature."
- **On screen:** ArbiFlow logo sting → ranked-opportunities board with the **78/100** top match (Aave v3).
- **Source:** demo *Bumper* (~0–5 s) + *Score* (~23–33 s).

### Beat 3 · Transparent scoring — 0:35–0:51
- **VO:** "Every pool gets the same math: APY, liquidity, trust, stability, and forecast — weighted into one number. No black box, no guessing. You see exactly why the top match won, then sign once."
- **On screen:** composite bars fill — **APY 40 · TVL 20 · Trust 15 · Stability 15 · Forecast 10** → one-signature *Deploy* → Aave v3.
- **Source:** demo *Score* score-bars (~30–36 s) + *Deploy* (~36–45 s).

### Beat 4 · The moat *(the heart)* — 0:51–1:18
- **VO:** "Here's what makes it different. Most robo-advisors for DeFi make you hand over your funds. ArbiFlow never does. Your money stays in your own vault. A keeper rebalances it every thirty-five seconds — but it can only touch protocols you approved, it can't drop your value, and only you can withdraw. Curate and sign — never drain. Even a stolen keeper key can't move a cent."
- **On screen:** approve allow-list cards → funds fly between protocols + leader badge + on-chain activity log → 3 guarantee cards → punch line *"a stolen keeper key still can't move your funds."*
- **Lower-third:** `Whitelisted targets only · Value floor ~1% · Owner-only withdrawals`
- **Source:** demo *AllowList* (~45–56 s) + *Rebalance* (~56–75 s) + *Security* (~75–84 s) — richest reuse.

### Beat 5 · Proof — it's real — 1:18–1:44
- **VO:** "And none of this is a mockup. The intelligence layer is live on Arbitrum mainnet today, scoring real DeFiLlama data. The vault is already auto-rebalancing on testnet — a public demo vault you can watch move real transactions on Arbiscan, right now. And the exact same guarded rebalance passes a Foundry fork test against the real Aave V3 pool. The hard part is already on-chain."
- **On screen:** three "what's real" cards (Live mainnet / Testnet vault / Foundry fork) → **screen-rec of the live demo vault on Sepolia Arbiscan** (stream of `rebalance` txns) → **screen-rec of `forge test` passing green**.
- **Lower-thirds:** vault `0xB2AA…d56E` · Aave V3 `0x794a…14aD` · `test/RebalanceForkAave.t.sol ✓`
- **Source:** `components/landing/whats-real.tsx` (or `/architecture`), captured Arbiscan + forge recordings, demo *Outro* proof chips (~84–90 s).

### Beat 6 · Vision + CTA — 1:44–2:00
- **VO:** "Today, smarter yield. Tomorrow, a non-custodial autopilot for all of DeFi — on mainnet, across every protocol you trust. ArbiFlow. Deploy idle capital into the best DeFi yield. Try it now at arbiflow-one dot vercel dot app."
- **On screen:** today → testnet → future timeline → ArbiFlow logo + tagline + URL pill **arbiflow-one.vercel.app**.
- **Source:** demo *Outro* (~84–90 s).

---

## Voiceover — continuous script
*One narrator · ~276 words · ~2:00 at ~145 wpm. Paste straight into TTS or a teleprompter.*

> Most of your DeFi capital is just sitting there. Stablecoins, parked in your wallet, earning zero percent. Across Arbitrum there are over five hundred pools paying anywhere from three to fourteen percent — but finding the right one, and keeping your money there, is a full-time job most people never sign up for.
>
> ArbiFlow does that job in seconds. It scans your wallet, ranks every yield by a transparent zero-to-one-hundred score, and deploys your capital into the best match — in a single signature.
>
> Every pool gets the same math: APY, liquidity, trust, stability, and forecast — weighted into one number. No black box, no guessing. You see exactly why the top match won, then sign once.
>
> Here's what makes it different. Most robo-advisors for DeFi make you hand over your funds. ArbiFlow never does. Your money stays in your own vault. A keeper rebalances it every thirty-five seconds — but it can only touch protocols you approved, it can't drop your value, and only you can withdraw. Curate and sign — never drain. Even a stolen keeper key can't move a cent.
>
> And none of this is a mockup. The intelligence layer is live on Arbitrum mainnet today, scoring real DeFiLlama data. The vault is already auto-rebalancing on testnet — a public demo vault you can watch move real transactions on Arbiscan, right now. And the exact same guarded rebalance passes a Foundry fork test against the real Aave V3 pool. The hard part is already on-chain.
>
> Today, smarter yield. Tomorrow, a non-custodial autopilot for all of DeFi — on mainnet, across every protocol you trust. ArbiFlow. Deploy idle capital into the best DeFi yield. Try it now at arbiflow-one dot vercel dot app.

---

## Production notes
- **Cuts:** hard cuts on beat changes; reuse the demo's fade/slide transition language.
- **Voice:** confident, calm, technical-but-human, ~145 wpm. AI TTS (e.g. ElevenLabs) or self-recorded — **VO audio is supplied by you**.
- **Music:** reuse the demo bed (`video/public/music.mp3`) or a calmer ambient; duck ~−12 dB under VO; small swell on the Beat 2 reveal and the Beat 6 logo.
- **Captions:** burn-in the key phrase + every address/URL as lower-thirds (for sound-off viewers).

## Shot list — to capture *(beyond reusing the demo MP4)*
1. **Arbiscan** — open the [demo vault](https://sepolia.arbiscan.io/address/0xB2AA9601b085350fD0eE12697C829BBa51f4d56E) on Sepolia, scroll the `rebalance` tx stream (~6–8 s).
2. **`forge test`** — `cd contracts && forge test --match-path test/RebalanceForkAave.t.sol` green pass (~4 s).
3. **(optional) `/app`** — live scoring board (~5 s); *Score* b-roll may suffice.
4. **VO audio** — record/generate from the continuous script above.

## Asset checklist
- **Have:** demo MP4 b-roll (`video/out/arbiflow-demo.mp4`) · brand (`public/brand/`) · screenshots (`docs/screenshots/{hero,app,architecture}.png`) · music bed.
- **Need:** VO audio · Arbiscan screen-rec · `forge test` screen-rec · final music mix · *(optional)* `/app` screen-rec.

## Judging-criteria map
- **Innovation** → Beat 4 (curate + sign, never drain)
- **Technical execution** → Beats 3–5 (score engine, EIP-712 keeper, fork test)
- **Completeness / proof** → Beat 5 (mainnet-live + testnet vault + fork test)
- **UX / design** → Beats 2–3 (one signature, transparent score)
- **Impact** → Beats 1 & 6 (idle capital → DeFi autopilot)
- **Communication** → the tight 2-minute arc

## Sources
Claims trace to: `README.md` (moat, 3-layer proof, score weights) · `components/landing/problem.tsx`
(500+ pools · 3–14% · 0%) · `DEMO.md` (one-liner, on-chain proof links) ·
`components/landing/whats-real.tsx` (proof cards) · `lib/score.ts` & `lib/constants.ts`
(`POOLS_SCORED = 500`; APY 40 · TVL 20 · Trust 15 · Stability 15 · Forecast 10 = 100).
