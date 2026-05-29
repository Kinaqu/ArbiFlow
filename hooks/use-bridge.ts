"use client";

import { useCallback, useState } from "react";
import { useAccount, useConfig } from "wagmi";
import { getPublicClient, getWalletClient, switchChain } from "wagmi/actions";
import { getQuote, mockQuote, pollStatus, type RelayQuote } from "@/lib/relay";

export type BridgeStep =
  | "idle"
  | "quoting"
  | "quoted"
  | "switching"
  | "approving"
  | "bridging"
  | "done"
  | "error";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const fakeHash = () =>
  ("0x" +
    Array.from({ length: 64 }, () =>
      "0123456789abcdef".charAt(Math.floor(Math.random() * 16)),
    ).join("")) as `0x${string}`;

const short = (e: unknown) =>
  (e instanceof Error ? e.message : "Bridge failed").split("\n")[0];

export type QuoteArgs = {
  originChainId: number;
  originCurrency: string; // token address, or RELAY_NATIVE
  amountWei: string;
  symbol: string;
  amountUsd: number; // only used to shape the simulated quote
  simulate: boolean;
};

export type ExecuteArgs = {
  originChainId: number;
  simulate: boolean;
};

export function useBridge() {
  const { address } = useAccount();
  const config = useConfig();

  const [step, setStep] = useState<BridgeStep>("idle");
  const [quote, setQuote] = useState<RelayQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hashes, setHashes] = useState<`0x${string}`[]>([]);

  const reset = useCallback(() => {
    setStep("idle");
    setQuote(null);
    setError(null);
    setHashes([]);
  }, []);

  const requestQuote = useCallback(
    async (a: QuoteArgs): Promise<RelayQuote | null> => {
      setError(null);
      setStep("quoting");
      try {
        let q: RelayQuote;
        if (a.simulate) {
          q = mockQuote(a.symbol, a.amountUsd);
        } else {
          if (!address) throw new Error("Connect your wallet to bridge");
          q = await getQuote({
            user: address,
            originChainId: a.originChainId,
            originCurrency: a.originCurrency,
            amountWei: a.amountWei,
            symbol: a.symbol,
          });
        }
        setQuote(q);
        setStep("quoted");
        return q;
      } catch (e) {
        setError(short(e));
        setStep("error");
        return null;
      }
    },
    [address],
  );

  const execute = useCallback(
    async (a: ExecuteArgs) => {
      setError(null);
      setHashes([]);
      try {
        // Dry-run: walk the same UX with fake hashes, no wallet popup.
        if (a.simulate) {
          setStep("switching");
          await sleep(600);
          setStep("approving");
          await sleep(900);
          setHashes([fakeHash()]);
          setStep("bridging");
          await sleep(1200);
          setHashes((h) => [...h, fakeHash()]);
          setStep("done");
          return;
        }

        if (!quote) throw new Error("Request a quote first");
        if (quote.steps.length === 0)
          throw new Error("Quote has no executable steps");

        setStep("switching");
        await switchChain(config, { chainId: a.originChainId });
        const wallet = await getWalletClient(config, {
          chainId: a.originChainId,
        });
        if (!wallet) throw new Error("Wallet unavailable on origin chain");
        const pc = getPublicClient(config, { chainId: a.originChainId });

        // Relay returns the deposit as an ordered set of transaction steps —
        // a leading ERC-20 approval (when needed) followed by the bridge send.
        for (const s of quote.steps) {
          const isApprove = /approv/i.test(`${s.id} ${s.action}`);
          setStep(isApprove ? "approving" : "bridging");
          for (const item of s.items) {
            const hash = await wallet.sendTransaction({
              to: item.to,
              value: item.value,
              data: item.data,
            });
            setHashes((h) => [...h, hash]);
            if (pc) await pc.waitForTransactionReceipt({ hash });
          }
        }

        // Origin txs are in — wait for Relay to fill on Arbitrum.
        setStep("bridging");
        if (quote.requestId) await pollStatus(quote.requestId);
        setStep("done");
      } catch (e) {
        setError(short(e));
        setStep("error");
      }
    },
    [config, quote],
  );

  return { step, quote, error, hashes, requestQuote, execute, reset };
}
