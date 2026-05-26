import type { Metadata } from "next";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "API — ArbiFlow",
  description:
    "Read-only HTTP API for ArbiFlow scans, strategy rankings, and historical scores.",
};

const endpoints = [
  {
    method: "GET",
    path: "/api/scan",
    params: "?address=0x…",
    desc: "Top-20 token balances + idle classification for a single Arbitrum address.",
  },
  {
    method: "GET",
    path: "/api/strategies",
    params: "?token=USDC&size=2500",
    desc: "Ranked strategy list for a given token and wallet size (Phase 2+).",
  },
  {
    method: "GET",
    path: "/api/score",
    params: "?protocol=aave-v3&token=USDC",
    desc: "Full breakdown of a single protocol/token score: APY, risk, gas, IL (Phase 2+).",
  },
  {
    method: "GET",
    path: "/api/history",
    params: "?protocol=aave-v3&token=USDC&days=30",
    desc: "Time-series of net APY and risk score for the last N days (Phase 3+).",
  },
];

export default function ApiDocsPage() {
  return (
    <PageShell>
      <PageHeader
        section="[F] · API"
        title={
          <>
            Read-only HTTP, no auth,{" "}
            <span className="gradient-text-gold">no rate limits today.</span>
          </>
        }
        subtitle="Same endpoints the dashboard uses. JSON in, JSON out. Free while in beta — we will warn before introducing keys."
      />

      <Section number="01" label="Endpoints" title="What you can query.">
        <div className="lg:col-span-12">
          <div className="rounded-xl border border-border-strong overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-2 border-b border-border text-[10px] font-mono uppercase tracking-widest text-muted">
              <div className="col-span-1">method</div>
              <div className="col-span-3">path</div>
              <div className="col-span-3">params</div>
              <div className="col-span-5">description</div>
            </div>
            <ul className="divide-y hairline">
              {endpoints.map((e) => (
                <li key={e.path} className="grid md:grid-cols-12 gap-4 px-6 py-5 bg-surface">
                  <div className="md:col-span-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-mint border border-mint/30 rounded px-1.5 py-0.5">
                      {e.method}
                    </span>
                  </div>
                  <div className="md:col-span-3 font-mono text-sm">{e.path}</div>
                  <div className="md:col-span-3 font-mono text-xs text-muted">
                    {e.params}
                  </div>
                  <div className="md:col-span-5 text-sm text-muted-strong">{e.desc}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section number="02" label="Example" title="A scan in curl.">
        <div className="lg:col-span-12">
          <pre className="rounded-xl border border-border bg-surface-2 p-6 overflow-auto text-xs font-mono leading-relaxed">
{`$ curl -s "https://arbiflow.xyz/api/scan?address=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"

{
  "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
  "scannedAt": "2026-05-26T17:00:00.000Z",
  "totalUsd": 2340.18,
  "idleUsd": 1840.22,
  "tokens": [
    {
      "symbol": "USDC",
      "balance": "1840220000",
      "balanceFormatted": 1840.22,
      "usdPrice": 1.0,
      "usdValue": 1840.22,
      "idle": true
    },
    ...
  ]
}`}
          </pre>
        </div>
      </Section>
    </PageShell>
  );
}
