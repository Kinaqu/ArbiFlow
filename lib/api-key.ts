// Publishable (non-secret) API key for first-party calls and the docs examples.
// Like a Stripe pk_ key: safe to ship in the client bundle. Rate limits — not
// secrecy — protect the open endpoints; integrators may use this key or set their
// own server-side keys (ARBIFLOW_API_KEYS) for higher limits and attribution.
//
// Framework-neutral (no imports) so both client hooks and server routes can use
// it. NEXT_PUBLIC_ is inlined into the client build by Next.
export const PUBLISHABLE_API_KEY =
  process.env.NEXT_PUBLIC_ARBIFLOW_API_KEY || "af_pub_demo";

/** Header to attach the publishable key to first-party fetches. */
export function publishableApiHeaders(): Record<string, string> {
  return { "x-api-key": PUBLISHABLE_API_KEY };
}
