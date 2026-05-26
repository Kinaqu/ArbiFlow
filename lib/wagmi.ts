import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { arbitrum } from "@reown/appkit/networks";
import { cookieStorage, createStorage } from "wagmi";

// Fail loudly on Vercel deploys when the env var is missing, so a silent
// "MISSING_PROJECT_ID" string never reaches the Reown adapter. Local builds
// fall back to a dev placeholder so contributors can build the project
// before configuring their own Reown project at https://cloud.reown.com.
const rawProjectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!rawProjectId && process.env.VERCEL) {
  throw new Error(
    "NEXT_PUBLIC_REOWN_PROJECT_ID is not set. Add it under Vercel → " +
      "Settings → Environment Variables (Production scope) and re-deploy.",
  );
}

export const projectId = rawProjectId ?? "dev-placeholder-no-modal";

export const networks = [arbitrum] as const;

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks: [arbitrum],
  customRpcUrls: process.env.ARBITRUM_RPC_URL
    ? { "eip155:42161": [{ url: process.env.ARBITRUM_RPC_URL }] }
    : undefined,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
