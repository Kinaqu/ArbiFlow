import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { defaultKeeperAddress, poolKeeperAddressFor } from "@/lib/keeper-signer";

// The keeper/relayer address a vault delegates to. With a keeper pool the
// assignment is per-vault (sharded), so the client passes ?vault=0x… and gets the
// keeper its vault should `setKeeper` to. Public — it's just an address.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const vault = new URL(request.url).searchParams.get("vault");
    const address =
      vault && isAddress(vault) ? poolKeeperAddressFor(vault) : defaultKeeperAddress();
    return NextResponse.json({ address });
  } catch {
    return NextResponse.json({ error: "keeper_unconfigured" }, { status: 503 });
  }
}
