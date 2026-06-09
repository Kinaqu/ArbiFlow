import { NextResponse } from "next/server";
import { scanWallet } from "@/lib/scan";
import { withPublicApi, corsPreflight } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withPublicApi(async (request: Request) => {
  const url = new URL(request.url);
  const address = url.searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "address query param required" },
      { status: 400 },
    );
  }

  try {
    const result = await scanWallet(address);
    return NextResponse.json(result, {
      headers: { "cache-control": "s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "scan_failed";
    const status = message === "invalid_address" ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
});

export function OPTIONS() {
  return corsPreflight();
}
