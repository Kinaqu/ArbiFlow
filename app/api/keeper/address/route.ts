import { NextResponse } from "next/server";
import { relayerAddress } from "@/lib/keeper-signer";

// The keeper/relayer address new vaults delegate to. Public (it's just an
// address); the client fetches it once to wire `setKeeper` at vault creation.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ address: relayerAddress() });
  } catch {
    return NextResponse.json({ error: "keeper_unconfigured" }, { status: 503 });
  }
}
