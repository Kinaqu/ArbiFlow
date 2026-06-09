// Screenshot the key views for the README / DEMO.md.
//
//   npm run dev            # in another terminal (or set BASE_URL)
//   node scripts/shoot.mjs
//
// Output: docs/screenshots/{hero,app,architecture}.png
// Reduced-motion is forced so animated sections capture a stable frame.

import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "..", "docs", "screenshots");

const shots = [
  { name: "hero", path: "/" },
  { name: "app", path: "/app" },
  { name: "architecture", path: "/architecture" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);

    for (const { name, path } of shots) {
      const url = `${BASE}${path}`;
      console.log(`→ ${url}`);
      await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });
      await sleep(1200); // let fonts settle + entrance frames land
      const file = resolve(outDir, `${name}.png`);
      await page.screenshot({ path: file });
      console.log(`  saved ${file}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("\nScreenshot run failed:", err.message);
  console.error(
    "If chromium can't launch in this environment, capture the same views manually:",
  );
  console.error("  /, /app, /architecture → docs/screenshots/{hero,app,architecture}.png");
  process.exit(1);
});
