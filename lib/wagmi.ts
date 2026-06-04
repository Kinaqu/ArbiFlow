import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { arbitrum, base, optimism, arbitrumSepolia } from "@reown/appkit/networks";
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

// Arbitrum stays first/default — it's the home chain for yield. Base + Optimism
// are added as source chains so idle capital stranded on those L2s can be
// bridged back to Arbitrum. Arbitrum Sepolia powers the testnet vault demo.
export const networks = [arbitrum, base, optimism, arbitrumSepolia] as const;

// Map our optional per-chain RPC env vars to Reown's `eip155:<id>` keys. Only
// the chains with an override set are included; the rest fall back to public RPCs.
const customRpcUrls = Object.fromEntries(
  (
    [
      ["eip155:42161", process.env.ARBITRUM_RPC_URL],
      ["eip155:8453", process.env.BASE_RPC_URL],
      ["eip155:10", process.env.OPTIMISM_RPC_URL],
      ["eip155:421614", process.env.ARBITRUM_SEPOLIA_RPC_URL],
    ] as const
  )
    .filter(([, url]) => !!url)
    .map(([key, url]) => [key, [{ url: url as string }]]),
);

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks: [arbitrum, base, optimism, arbitrumSepolia],
  customRpcUrls:
    Object.keys(customRpcUrls).length > 0 ? customRpcUrls : undefined,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
