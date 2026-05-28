// One-shot snapshot generator. Re-run before demo for fresh data:
//   npm run snapshot
//
// Output: lib/data/arbitrum-pools-snapshot.json
// Shape: { pools: NormalizedPool[], generatedAt: string }
//
// Selection/normalization logic is shared with the runtime via
// lib/pool-select.ts — there is no duplicate filter logic to keep in sync.

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CURATED_PROJECTS,
  selectPools,
  type LlamaResponse,
  type RawPool,
} from "../lib/pool-select";

async function main() {
  console.log("Fetching DeFiLlama yields…");
  const res = await fetch("https://yields.llama.fi/pools");
  if (!res.ok) {
    throw new Error(`DeFiLlama responded ${res.status}`);
  }
  const json = (await res.json()) as LlamaResponse;
  const data: RawPool[] = Array.isArray(json.data) ? json.data : [];
  console.log(
    `Got ${data.length} pools, filtering to Arbitrum curated + honorable…`,
  );

  const arb = data.filter((p) => p.chain === "Arbitrum");
  const projectCounts = arb.reduce<Record<string, number>>((acc, p) => {
    acc[p.project] = (acc[p.project] ?? 0) + 1;
    return acc;
  }, {});
  const topProjects = Object.entries(projectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25);
  console.log("Top Arbitrum projects by pool count:");
  for (const [p, n] of topProjects) {
    const mark = CURATED_PROJECTS.has(p) ? " ✓ curated" : "";
    console.log(`  ${n.toString().padStart(4)}  ${p}${mark}`);
  }

  const pools = selectPools(data);

  const here = dirname(fileURLToPath(import.meta.url));
  const outPath = resolve(
    here,
    "..",
    "lib",
    "data",
    "arbitrum-pools-snapshot.json",
  );
  await mkdir(dirname(outPath), { recursive: true });
  const payload = { pools, generatedAt: new Date().toISOString() };
  await writeFile(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");

  const coreCount = pools.filter((p) => p.tier === "core").length;
  const honorableCount = pools.filter((p) => p.tier === "honorable").length;
  console.log(
    `\nWrote ${pools.length} pools (${coreCount} core, ${honorableCount} honorable) to ${outPath}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
