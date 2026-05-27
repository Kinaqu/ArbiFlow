// Reown AppKit internally calls https://rpc.walletconnect.org/v1/identity/{address}
// to resolve ENS / avatar. When no wallet is connected, AppKit's account state
// holds `undefined`, which JS coerces to the literal string "undefined" in the URL.
// The WalletConnect identity endpoint then rejects with 400 — visible as a red
// console error on every dashboard load. Reown exposes no flag to disable identity
// resolution, so we short-circuit the bad request at the fetch boundary.

const IDENTITY_UNDEFINED_PATTERN =
  "rpc.walletconnect.org/v1/identity/undefined";

const EMPTY_IDENTITY_BODY = JSON.stringify({ name: null, avatar: null });

function pickUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

export function installIdentityShim(): void {
  if (typeof window === "undefined") return;
  const w = window as typeof window & { __arbiflowIdentityShim?: boolean };
  if (w.__arbiflowIdentityShim) return;
  w.__arbiflowIdentityShim = true;

  const original = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = pickUrl(input);
    if (url.includes(IDENTITY_UNDEFINED_PATTERN)) {
      return Promise.resolve(
        new Response(EMPTY_IDENTITY_BODY, {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    }
    return original(input, init);
  };
}
