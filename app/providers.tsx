"use client";

import { ReactNode, useEffect, useState } from "react";
import { WagmiProvider, type State } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { arbitrum, base, optimism } from "@reown/appkit/networks";
import { projectId, wagmiAdapter, wagmiConfig } from "@/lib/wagmi";
import { installIdentityShim } from "@/lib/identity-shim";

const metadata = {
  name: "ArbiFlow",
  description:
    "Deploy idle capital into optimized DeFi yield on Arbitrum — in one click.",
  url: "https://arbiflow.xyz",
  icons: ["https://arbiflow.xyz/icon.svg"],
};

createAppKit({
  adapters: [wagmiAdapter],
  networks: [arbitrum, base, optimism],
  defaultNetwork: arbitrum,
  projectId,
  metadata,
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#2F7BFF",
    "--w3m-color-mix": "#0B0D12",
    "--w3m-color-mix-strength": 12,
    "--w3m-border-radius-master": "2px",
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
});

export function Providers({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    installIdentityShim();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
