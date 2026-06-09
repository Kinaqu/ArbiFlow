# ArbiFlow — brand assets

PNG exports of the logo for hackathon hubs, press kits, and social. Regenerate
any time with `node scripts/logo-png.mjs` (renders from the canonical SVG via sharp).

| File | What | Best for |
|---|---|---|
| `icon-1024.png` / `icon-512.png` | Mark in the rounded dark badge | **Square logo / avatar** (Devpost, DoraHacks, GitHub org, Twitter) |
| `logomark-1024.png` / `-512.png` | Bare mark, **transparent** | Overlays on any dark background |
| `logomark-dark-1024.png` | Bare mark on brand near-black | Standalone mark on light pages |
| `wordmark-transparent.png` | Mark + “ArbiFlow”, transparent | Logo-with-name on dark themes |
| `wordmark-dark.png` | Mark + “ArbiFlow” on brand near-black | Logo-with-name anywhere (safe) |

Need a social/cover card? The 1200×630 OG image is generated at `/opengraph-image`.

Once deployed these are downloadable directly, e.g.
`https://arbiflow-one.vercel.app/brand/icon-1024.png`.

## Colors

| Token | Hex |
|---|---|
| Near-black (bg) | `#07080B` |
| Badge fill | `#0E1015` |
| Blue (streams) | `#1E5BD8` → `#4A8FFF` |
| Gold (yield) | `#F4B53F` |
| Text / muted | `#F2F2EE` / `#A8AEBC` |
