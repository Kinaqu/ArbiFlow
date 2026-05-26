import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { arbitrum } from "@reown/appkit/networks";
import { cookieStorage, createStorage } from "wagmi";

export const projectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "MISSING_PROJECT_ID";

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
