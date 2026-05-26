import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // wagmi's Tempo connector dynamically imports an optional "accounts"
      // module that doesn't exist as a real package. Without this alias
      // Turbopack treats the import().catch() as a hard module-not-found.
      accounts: "./lib/stubs/empty.js",
    },
  },
  // Also externalize from the server bundle so the dynamic import resolves
  // at runtime against the actual Node module system (where it'll fall back
  // to the .catch handler as wagmi intends).
  serverExternalPackages: ["@wagmi/core", "@reown/appkit-adapter-wagmi"],
};

export default nextConfig;
