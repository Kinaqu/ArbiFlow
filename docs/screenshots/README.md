# Screenshots

Generated for the root `README.md` and `DEMO.md`.

```bash
npm run build && npm start      # or: npm run dev
node scripts/shoot.mjs          # writes hero.png, app.png, architecture.png here
```

`scripts/shoot.mjs` drives Chromium via Puppeteer (reduced-motion for stable
frames). It needs a Chromium that can launch — on a bare Linux/WSL box install
the libs first:

```bash
sudo apt-get install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libgbm1 libxkbcommon0 libxcomposite1 libxdamage1 \
  libxfixes3 libxrandr2 libasound2 libpango-1.0-0 libcairo2
```

Or just run it on your host machine (macOS/Windows) where a browser is present.
Targets: `/` → `hero.png`, `/app` → `app.png`, `/architecture` → `architecture.png`.
