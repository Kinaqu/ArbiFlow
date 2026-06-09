// Render the ArbiFlow logo to PNG (for hackathon hubs / press).
//
//   node scripts/logo-png.mjs
//
// Output: public/brand/*.png — bare mark (transparent), rounded icon badge,
// and the wordmark (transparent + on brand-dark). Vector-exact via sharp.

import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "..", "public", "brand");

const BG = "#07080B"; // brand near-black
const GRAD = `<linearGradient id="g" x1="16" y1="30" x2="16" y2="2" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1E5BD8"/><stop offset="1" stop-color="#4A8FFF"/></linearGradient>`;

// The five strokes of the mark, in the 0..32 design space (centered).
const MARK_PATHS = `
  <path d="M6 26.5C8.5 20 12 16.5 16 13.5" fill="none" stroke="url(#g)" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M16 27V13.5" fill="none" stroke="url(#g)" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M26 26.5C23.5 20 20 16.5 16 13.5" fill="none" stroke="url(#g)" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M16 13.5V6.5" fill="none" stroke="#F4B53F" stroke-width="3" stroke-linecap="round"/>
  <path d="M11.8 10L16 5.6L20.2 10" fill="none" stroke="#F4B53F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;

// Bare mark on transparent, with uniform padding (viewBox -4..40 around the 0..32 art).
function markSvg(size, bg) {
  const back = bg ? `<rect x="-4" y="-4" width="40" height="40" fill="${bg}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-4 -4 40 40"><defs>${GRAD}</defs>${back}${MARK_PATHS}</svg>`;
}

// Rounded dark badge (matches app/icon.svg), mark scaled 0.74 and centered.
function iconSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><defs>${GRAD}</defs>
    <rect width="32" height="32" rx="7" fill="#0E1015"/>
    <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" fill="none" stroke="#1E222C"/>
    <g transform="translate(16 16) scale(0.74) translate(-16 -16.5)">${MARK_PATHS}</g>
  </svg>`;
}

// Wordmark: mark + "ArbiFlow". H=256 canvas; trailing space is fine for a logo asset.
function wordmarkSvg({ bg }) {
  const W = 880;
  const H = 256;
  const M = 188; // mark box
  const my = (H - M) / 2;
  const back = bg ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : "";
  const arbi = bg ? "#F2F2EE" : "#F2F2EE";
  const flow = "#A8AEBC";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${GRAD}</defs>${back}
    <svg x="28" y="${my}" width="${M}" height="${M}" viewBox="-4 -4 40 40">${MARK_PATHS}</svg>
    <text x="232" y="${H / 2}" dominant-baseline="central" font-family="Arial, 'Liberation Sans', 'Helvetica Neue', sans-serif" font-weight="700" font-size="118" letter-spacing="-4"><tspan fill="${arbi}">Arbi</tspan><tspan fill="${flow}">Flow</tspan></text>
  </svg>`;
}

const png = (svg, file) =>
  sharp(Buffer.from(svg)).png().toFile(resolve(outDir, file));

async function main() {
  await mkdir(outDir, { recursive: true });
  const jobs = [
    [markSvg(1024), "logomark-1024.png"],
    [markSvg(512), "logomark-512.png"],
    [markSvg(1024, BG), "logomark-dark-1024.png"],
    [iconSvg(1024), "icon-1024.png"],
    [iconSvg(512), "icon-512.png"],
    [wordmarkSvg({ bg: null }), "wordmark-transparent.png"],
    [wordmarkSvg({ bg: BG }), "wordmark-dark.png"],
  ];
  for (const [svg, file] of jobs) {
    await png(svg, file);
    console.log(`  ${file}`);
  }
  console.log(`\nWrote ${jobs.length} files to public/brand/`);
}

main().catch((e) => {
  console.error("logo-png failed:", e.message);
  process.exit(1);
});
