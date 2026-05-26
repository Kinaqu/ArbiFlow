import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // wagmi's Tempo connector does `import('accounts').catch(...)` against
      // an optional peer. The `overrides` block in package.json points the
      // `accounts` name at a local stub package so this resolves to {} at
      // build *and* runtime, on every resolver.
      accounts: "./lib/stubs/empty.js",
    },
  },
  // Intentionally NOT using `serverExternalPackages` for the wagmi/Reown
  // stack. Externalizing pushes module loading to Vercel's ESM runtime,
  // which is strict about named exports — and @reown/appkit-adapter-wagmi
  // imports a symbol from @walletconnect/logger that the installed version
  // no longer exports, killing every SSR render with a SyntaxError. Letting
  // Next bundle them inline avoids the runtime mismatch.
};

export default nextConfig;
