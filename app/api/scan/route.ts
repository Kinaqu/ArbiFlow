import { NextResponse } from "next/server";
import { scanWallet } from "@/lib/scan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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
}
