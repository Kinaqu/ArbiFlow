import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { buildMove, type FundLocation } from "@/lib/vault-calls";
import { ensureFloat, keeperByAddress, readVault, signAndSubmit, withVaultLock } from "@/lib/keeper-signer";

// Backs the user's withdraw: the keeper redeems any deployed position back to
// idle USDC so the owner can then withdraw it (the owner is no longer keeper, so
// they can't redeem themselves). The owner can always force-exit on-chain too.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type RedeemResponse = {
  redeemed: boolean;
  hash?: `0x${string}`;
  from?: FundLocation;
  location: FundLocation;
  reason: "redeemed" | "already_idle" | "not_delegated";
};

export async function POST(request: Request) {
  let body: { vault?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const vault = body.vault;
  if (!vault || !isAddress(vault)) {
    return NextResponse.json({ error: "bad_vault" }, { status: 400 });
  }

  try {
    const result = await withVaultLock(vault, async (): Promise<RedeemResponse> => {
      const snap = await readVault(vault);
      const keeper = keeperByAddress(snap.keeper);

      if (!keeper) {
        return { redeemed: false, location: snap.location, reason: "not_delegated" };
      }
      if (snap.location === "idle" || snap.location === "empty" || snap.activeAmount === BigInt(0)) {
        return { redeemed: false, location: snap.location, reason: "already_idle" };
      }

      const calls = buildMove(vault, snap.location, "idle", snap.activeAmount);
      await ensureFloat(keeper.address);
      const hash = await signAndSubmit(vault, calls, keeper);
      return { redeemed: true, hash, from: snap.location, location: "idle", reason: "redeemed" };
    });

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "keeper_failed";
    return NextResponse.json({ error: "keeper_failed", message }, { status: 500 });
  }
}
