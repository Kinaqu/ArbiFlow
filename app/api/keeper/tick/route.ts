import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { TESTNET_DEPLOYMENT as DEPLOYMENT, type ProtocolKey } from "@/lib/testnet";
import {
  decideTarget,
  MOVE_GAS_ESTIMATE,
  type DecisionOverride,
  type KeeperTickResult,
} from "@/lib/demo-score";
import { buildMove } from "@/lib/vault-calls";
import { requireVaultOwner, type AuthToken } from "@/lib/api-auth";
import {
  ensureFloat,
  gasPrice,
  keeperBalance,
  keeperByAddress,
  readVault,
  signAndSubmit,
  withVaultLock,
} from "@/lib/keeper-signer";

// Holds the backend keys + submits a real tx — must run on Node, never cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEYS = new Set<string>(DEPLOYMENT.protocols.map((p) => p.key));

/** Validate the optional presenter override (demo controls) from the body. */
function parseOverride(raw: unknown): DecisionOverride | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as { kind?: unknown; key?: unknown };
  if (o.kind === "hold") return { kind: "hold" };
  if (o.kind === "boost" && typeof o.key === "string" && KEYS.has(o.key)) {
    return { kind: "boost", key: o.key as ProtocolKey };
  }
  return undefined;
}

export async function POST(request: Request) {
  let body: { vault?: string; approved?: unknown; override?: unknown; auth?: AuthToken };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const vault = body.vault;
  if (!vault || !isAddress(vault)) {
    return NextResponse.json({ error: "bad_vault" }, { status: 400 });
  }

  // Only the vault's owner may move its funds (the public demo vault is exempt).
  const auth = await requireVaultOwner(vault, body.auth, request.headers.get("host"));
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const approved = (Array.isArray(body.approved) ? body.approved : []).filter(
    (k): k is ProtocolKey => typeof k === "string" && KEYS.has(k),
  );
  const override = parseOverride(body.override);

  try {
    const result = await withVaultLock(vault, async (): Promise<KeeperTickResult> => {
      const snap = await readVault(vault);
      // Resolve which pool keeper this vault is delegated to (its on-chain keeper
      // must be one of ours), and submit from that key.
      const keeper = keeperByAddress(snap.keeper);

      if (!keeper) {
        return { moved: false, location: snap.location, reason: "not_delegated" };
      }
      if (snap.activeAmount === BigInt(0)) {
        return { moved: false, location: snap.location, reason: "no_funds" };
      }

      const target = decideTarget(snap.location, approved, Date.now(), override);
      if (!target || target === snap.location) {
        const reason =
          override?.kind === "hold"
            ? "demo_hold"
            : approved.length === 0
              ? "no_approvals"
              : "stay";
        return { moved: false, location: snap.location, reason };
      }

      // Gas gate: the keeper never fronts uncovered gas. If the vault's own ETH
      // reserve can't cover one move, skip submitting — the budget runs out
      // gracefully and the UI prompts a top-up.
      const cost = MOVE_GAS_ESTIMATE * (await gasPrice());
      if (snap.vaultEth < cost) {
        return { moved: false, location: snap.location, reason: "needs_gas" };
      }
      // Keeper-float gate: the keeper EOA fronts the tx's gas, then the vault
      // reimburses it. If its float can't cover one move, don't submit (it would
      // just revert for lack of funds) — surface a reason so the UI prompts a gas
      // top-up, whose skim refills the keeper. (ensureFloat below is a no-op while
      // the protocol funder is off; the float is sustained by users.)
      if ((await keeperBalance(keeper.address)) < cost) {
        return { moved: false, location: snap.location, reason: "needs_keeper_float" };
      }

      const calls = buildMove(vault, snap.location, target, snap.activeAmount);
      // Keep this keeper's float topped up (gas-station) before it fronts the tx.
      await ensureFloat(keeper.address);
      const hash = await signAndSubmit(vault, calls, keeper);
      return {
        moved: true,
        location: target,
        from: snap.location,
        to: target,
        hash,
        reason: override?.kind === "boost" ? "demo_boost" : "moved",
      };
    });

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "keeper_failed";
    return NextResponse.json({ error: "keeper_failed", message }, { status: 500 });
  }
}
