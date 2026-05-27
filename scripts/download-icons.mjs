// One-shot logo fetch. Pulls protocol icons from DeFiLlama's CDN and writes
// them locally as PNG so the UI doesn't depend on a third-party CDN at runtime.
//   node scripts/download-icons.mjs

import { writeFile, mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const snapshotPath = resolve(repoRoot, "lib", "data", "arbitrum-pools-snapshot.json");
const outDir = resolve(repoRoot, "public", "icons", "protocols");

// Always pull these even if absent from the current snapshot — Portal tier
// + curated set are referenced by code.
const ALWAYS_FETCH = [
  "aave-v3",
  "radiant-v2",
  "gmx-v2-perps",
  "camelot-v3",
  "uniswap-v3",
  "pendle",
  "curve-dex",
  "compound-v3",
  "morpho-blue",
  "fluid-lending",
  "lido",
  "ether-fi",
];

const EXT_CANDIDATES = ["png", "jpg"];

async function tryFetch(slug) {
  for (const ext of EXT_CANDIDATES) {
    const url = `https://icons.llamao.fi/icons/protocols/${slug}.${ext}`;
    const res = await fetch(url);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      return { buf, sourceExt: ext };
    }
  }
  return null;
}

async function main() {
  await mkdir(outDir, { recursive: true });

  let snapshotSlugs = [];
  try {
    const snap = JSON.parse(await readFile(snapshotPath, "utf8"));
    snapshotSlugs = Array.from(
      new Set((snap.pools ?? []).map((p) => p.project).filter(Boolean)),
    );
  } catch {
    console.warn("snapshot not found, fetching ALWAYS_FETCH only");
  }

  const slugs = Array.from(new Set([...ALWAYS_FETCH, ...snapshotSlugs])).sort();
  console.log(`Fetching ${slugs.length} protocol icons…`);

  const misses = [];
  let hits = 0;
  for (const slug of slugs) {
    const result = await tryFetch(slug);
    if (!result) {
      misses.push(slug);
      continue;
    }
    const outPath = resolve(outDir, `${slug}.png`);
    await writeFile(outPath, result.buf);
    hits += 1;
  }

  console.log(`\nDone. ${hits} icons saved, ${misses.length} misses.`);
  if (misses.length > 0) {
    console.log("Misses (will fall back to lucide in UI):");
    for (const m of misses) console.log(`  ${m}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
