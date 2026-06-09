import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Developer API — ArbiFlow",
  description:
    "Open HTTP API for ArbiFlow's analytics layer: wallet scans, scored Arbitrum pools, and historical APY/TVL. API-keyed, rate-limited, CORS-enabled.",
};

const BASE = "https://arbiflow-one.vercel.app";

const readEndpoints = [
  {
    method: "GET",
    path: "/api/opportunities",
    params: "—",
    desc: "Every curated + honorable Arbitrum pool, each scored 0–100 and ranked.",
    returns: "{ pools: ScoredPool[], generatedAt, source }",
  },
  {
    method: "GET",
    path: "/api/scan",
    params: "?address=0x…",
    desc: "Token balances + idle-capital classification for any wallet.",
    returns: "{ address, totalUsd, idleUsd, tokens: TokenBalance[] }",
  },
  {
    method: "GET",
    path: "/api/pool-chart",
    params: "?id=<pool-uuid>",
    desc: "Up to 90 days of APY & TVL history for one DeFiLlama pool.",
    returns: "{ points: { t, apy, tvlUsd }[] }",
  },
  {
    method: "GET",
    path: "/api/keeper/address",
    params: "?vault=0x…",
    desc: "The testnet keeper a vault should delegate to (sharded per vault).",
    returns: "{ address }",
  },
];

const errors = [
  ["400", "Bad request — a required param is missing or malformed."],
  ["401", "Missing or invalid API key (read API), or missing owner signature (write API)."],
  ["403", "Authenticated, but the signer does not own the target vault."],
  ["429", "Rate limit exceeded — back off until the X-RateLimit-Reset time."],
  ["502 / 503", "Upstream data source or keeper backend unavailable."],
];

export default function ApiDocsPage() {
  return (
    <PageShell>
      <PageHeader
        section="[F] · Developer API"
        title={
          <>
            Plug ArbiFlow&apos;s analytics layer{" "}
            <span className="gradient-text-gold">into anything.</span>
          </>
        }
        subtitle="An open, API-keyed HTTP layer over the same data the dashboard runs on: wallet scans, scored Arbitrum pools, and APY/TVL history. JSON in, JSON out, CORS everywhere. Looking for how to use the app itself? See the user docs."
      />

      <Section number="01" label="Getting started" title="Base URL, keys & limits.">
        <div className="lg:col-span-7 space-y-5 text-muted-strong leading-relaxed">
          <p>
            All endpoints live under{" "}
            <span className="font-mono text-foreground">{BASE}</span>. The read API
            requires an API key — send it as an{" "}
            <span className="font-mono">Authorization: Bearer &lt;key&gt;</span>{" "}
            header or an <span className="font-mono">x-api-key</span> header.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              A <span className="text-foreground">publishable demo key</span> ships
              with the app, so the examples below work out of the box. Like a Stripe{" "}
              <span className="font-mono">pk_</span> key it is not secret — rate
              limits, not secrecy, protect the endpoints.
            </li>
            <li>
              Want higher limits or usage attribution? Run your own deployment and
              set <span className="font-mono">ARBIFLOW_API_KEYS</span> (server-side,
              comma-separated).
            </li>
            <li>
              <span className="text-foreground">Rate limits:</span> 60 requests /
              minute per key by default. Over the limit returns{" "}
              <span className="font-mono">429</span>; every response carries{" "}
              <span className="font-mono">X-RateLimit-Limit/Remaining/Reset</span>.
            </li>
            <li>
              <span className="text-foreground">CORS:</span> open (
              <span className="font-mono">*</span>) — call it from a browser or a
              server.
            </li>
          </ul>
        </div>
        <div className="lg:col-span-5">
          <pre className="rounded-xl border border-border bg-surface-2 p-6 overflow-auto text-xs font-mono leading-relaxed">
{`# header auth, either form
Authorization: Bearer af_pub_demo
x-api-key: af_pub_demo`}
          </pre>
        </div>
      </Section>

      <Section number="02" label="Read endpoints" title="The open analytics surface.">
        <div className="lg:col-span-12">
          <div className="rounded-xl border border-border-strong overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-2 border-b border-border text-[10px] font-mono uppercase tracking-widest text-muted">
              <div className="col-span-1">method</div>
              <div className="col-span-3">path</div>
              <div className="col-span-2">params</div>
              <div className="col-span-6">returns</div>
            </div>
            <ul className="divide-y hairline">
              {readEndpoints.map((e) => (
                <li key={e.path} className="grid md:grid-cols-12 gap-2 md:gap-4 px-6 py-5 bg-surface">
                  <div className="md:col-span-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-mint border border-mint/30 rounded px-1.5 py-0.5">
                      {e.method}
                    </span>
                  </div>
                  <div className="md:col-span-3 font-mono text-sm">{e.path}</div>
                  <div className="md:col-span-2 font-mono text-xs text-muted">{e.params}</div>
                  <div className="md:col-span-6 text-sm text-muted-strong">
                    <div>{e.desc}</div>
                    <div className="mt-1 font-mono text-xs text-muted">{e.returns}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section number="03" label="Example" title="A scan in curl.">
        <div className="lg:col-span-12">
          <pre className="rounded-xl border border-border bg-surface-2 p-6 overflow-auto text-xs font-mono leading-relaxed">
{`$ curl -s "${BASE}/api/scan?address=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" \\
    -H "x-api-key: af_pub_demo"

{
  "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
  "scannedAt": "2026-05-26T17:00:00.000Z",
  "totalUsd": 2340.18,
  "idleUsd": 1840.22,
  "tokens": [
    { "symbol": "USDC", "balanceFormatted": 1840.22, "usdValue": 1840.22, "idle": true },
    ...
  ]
}`}
          </pre>
        </div>
      </Section>

      <Section
        number="04"
        label="Authenticated · not open"
        title="The fund-moving endpoints, and why they're locked."
      >
        <div className="lg:col-span-7 space-y-4 text-muted-strong leading-relaxed">
          <p>
            <span className="font-mono">POST /api/keeper/tick</span>,{" "}
            <span className="font-mono">/api/keeper/redeem</span> and{" "}
            <span className="font-mono">POST /api/execute-route</span> are{" "}
            <span className="text-foreground">not</span> part of the open API. The
            keeper endpoints move a vault&apos;s funds (auto-rebalance / redeem to
            idle), so they require the vault owner&apos;s authorization:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              The caller signs a <span className="text-foreground">SIWE</span>{" "}
              (Sign-In With Ethereum) message once; the server re-verifies it on
              every call and requires the recovered signer to equal the
              vault&apos;s on-chain <span className="font-mono">owner()</span>.
            </li>
            <li>
              So <span className="text-foreground">no one can move another
              user&apos;s funds</span> — a request for someone else&apos;s vault is
              rejected with <span className="font-mono">401/403</span>.
            </li>
            <li>
              Even the owner&apos;s moves are constrained on-chain: funds only ever
              shift between admin-whitelisted pools, value-preserving, and only the
              owner can ever <span className="font-mono">withdraw</span>. See the{" "}
              <Link href="/docs" className="text-accent hover:underline">
                non-custodial safety model
              </Link>
              .
            </li>
          </ul>
        </div>
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-border bg-surface p-6 text-sm">
            <div className="text-[10px] uppercase tracking-widest text-muted mb-3 font-mono">
              errors
            </div>
            <dl className="divide-y hairline">
              {errors.map(([code, defn]) => (
                <div key={code} className="grid grid-cols-12 gap-3 py-3">
                  <dt className="col-span-3 font-mono text-xs text-foreground">{code}</dt>
                  <dd className="col-span-9 text-xs text-muted-strong leading-relaxed">{defn}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      <Section>
        <div className="lg:col-span-12">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Using the app instead? Read the user docs
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
