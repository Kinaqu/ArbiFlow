import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { TESTNET_DEPLOYMENT as DEPLOYMENT, type ProtocolKey } from "@/lib/testnet";
import { allScoresAt, decideTarget, tickFor, type KeeperTickResult } from "@/lib/demo-score";
import { buildMove } from "@/lib/vault-calls";
import { readVault, relayerAddress, signAndSubmit, withVaultLock } from "@/lib/keeper-signer";

// Holds the backend keys + submits a real tx — must run on Node, never cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEYS = new Set<string>(DEPLOYMENT.protocols.map((p) => p.key));

export async function POST(request: Request) {
  let body: { vault?: string; approved?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const vault = body.vault;
  if (!vault || !isAddress(vault)) {
    return NextResponse.json({ error: "bad_vault" }, { status: 400 });
  }
  const approved = (Array.isArray(body.approved) ? body.approved : []).filter(
    (k): k is ProtocolKey => typeof k === "string" && KEYS.has(k),
  );

  try {
    const result = await withVaultLock(vault, async (): Promise<KeeperTickResult> => {
      const relayer = relayerAddress();
      const snap = await readVault(vault);
      const tick = tickFor();
      const scores = allScoresAt(tick);

      if (snap.keeper.toLowerCase() !== relayer.toLowerCase()) {
        return { moved: false, location: snap.location, tick, scores, reason: "not_delegated" };
      }
      if (snap.activeAmount === BigInt(0)) {
        return { moved: false, location: snap.location, tick, scores, reason: "no_funds" };
      }

      const target = decideTarget(snap.location, approved, tick);
      if (!target || target === snap.location) {
        return {
          moved: false,
          location: snap.location,
          tick,
          scores,
          reason: approved.length === 0 ? "no_approvals" : "stay",
        };
      }

      const calls = buildMove(vault, snap.location, target, snap.activeAmount);
      const hash = await signAndSubmit(vault, calls);
      return {
        moved: true,
        location: target,
        from: snap.location,
        to: target,
        hash,
        tick,
        scores,
        reason: "moved",
      };
    });

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "keeper_failed";
    return NextResponse.json({ error: "keeper_failed", message }, { status: 500 });
  }
}
