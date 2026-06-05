// Server-only keeper for the testnet vault demo. Holds the backend keys and is
// imported ONLY by the /api/keeper route handlers — never by client code.
//
//   • DEPLOYER_PK is the on-chain `keeper` (set on every vault at creation) and
//     the relayer that submits + pays gas for each rebalance. The vault never
//     needs ETH itself; the keeper is `msg.sender` and pays.
//   • BACKEND_PK is the allocation signer (must equal the factory's
//     backendSigner). Defaults to the public demo key 0xA11CE, matching
//     DeployDemo.s.sol, so the demo runs with zero on-chain setup.
//
// Because the keeper is this server key (not the user), the user can deposit and
// withdraw but can never move funds between protocols — only the backend can.

import {
  createPublicClient,
  createWalletClient,
  erc20Abi,
  http,
  type PublicClient,
  type WalletClient,
} from "viem";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { TESTNET_DEPLOYMENT as DEPLOYMENT, type ProtocolKey } from "./testnet";
import { VAULT_ABI } from "./testnet-abi";
import { allocationTypedData, type VaultCall } from "./testnet-sign";
import type { FundLocation } from "./vault-calls";

const USDC = DEPLOYMENT.usdc as `0x${string}`;
const ZERO = BigInt(0);
// 0xA11CE padded to 32 bytes — the demo backendSigner from DeployDemo.s.sol.
const DEMO_BACKEND_PK =
  "0x00000000000000000000000000000000000000000000000000000000000a11ce" as const;

function normPk(raw: string | undefined): `0x${string}` | null {
  if (!raw) return null;
  const t = raw.trim().replace(/^["']|["']$/g, "");
  if (!t) return null;
  return (t.startsWith("0x") ? t : `0x${t}`) as `0x${string}`;
}

type Ctx = {
  publicClient: PublicClient;
  walletClient: WalletClient;
  keeper: PrivateKeyAccount;
  signer: PrivateKeyAccount;
};

let _ctx: Ctx | null = null;

/** Lazily build the clients so an unset key fails at request time, not at build. */
function ctx(): Ctx {
  if (_ctx) return _ctx;
  const keeperPk = normPk(process.env.DEPLOYER_PK);
  if (!keeperPk) {
    throw new Error("DEPLOYER_PK is not set — the testnet keeper is disabled.");
  }
  const signerPk = normPk(process.env.BACKEND_PK) ?? DEMO_BACKEND_PK;
  const rpc = process.env.ARBITRUM_SEPOLIA_RPC_URL?.trim() || undefined;
  const keeper = privateKeyToAccount(keeperPk);
  const signer = privateKeyToAccount(signerPk);
  _ctx = {
    publicClient: createPublicClient({ chain: arbitrumSepolia, transport: http(rpc) }),
    walletClient: createWalletClient({ account: keeper, chain: arbitrumSepolia, transport: http(rpc) }),
    keeper,
    signer,
  };
  return _ctx;
}

/** Public address of the keeper/relayer — safe to expose; vaults delegate to it. */
export function relayerAddress(): `0x${string}` {
  return ctx().keeper.address;
}

export type VaultSnapshot = {
  keeper: `0x${string}`;
  nonce: bigint;
  idleUsdc: bigint;
  positions: Record<ProtocolKey, bigint>;
  location: FundLocation;
  activeAmount: bigint;
};

/** Read the on-chain state the keeper needs to make a decision. */
export async function readVault(vault: `0x${string}`): Promise<VaultSnapshot> {
  const pc = ctx().publicClient;
  const [keeper, nonce, idleUsdc, ...posBalances] = await Promise.all([
    pc.readContract({ address: vault, abi: VAULT_ABI, functionName: "keeper" }) as Promise<`0x${string}`>,
    pc.readContract({ address: vault, abi: VAULT_ABI, functionName: "nonce" }) as Promise<bigint>,
    pc.readContract({ address: USDC, abi: erc20Abi, functionName: "balanceOf", args: [vault] }) as Promise<bigint>,
    ...DEPLOYMENT.protocols.map(
      (p) =>
        pc.readContract({
          address: p.posToken as `0x${string}`,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [vault],
        }) as Promise<bigint>,
    ),
  ]);

  const positions = Object.fromEntries(
    DEPLOYMENT.protocols.map((p, i) => [p.key, posBalances[i]]),
  ) as Record<ProtocolKey, bigint>;

  let location: FundLocation = "empty";
  let activeAmount = ZERO;
  const inProto = DEPLOYMENT.protocols.find((p) => positions[p.key] > ZERO);
  if (inProto) {
    location = inProto.key;
    activeAmount = positions[inProto.key];
  } else if (idleUsdc > ZERO) {
    location = "idle";
    activeAmount = idleUsdc;
  }

  return { keeper, nonce, idleUsdc, positions, location, activeAmount };
}

// --- per-vault lock + serialized relayer sends ---------------------------------

const vaultLocks = new Map<string, Promise<unknown>>();

/** Run `fn` with exclusive access to one vault, so concurrent ticks can't race
 *  the vault's allocation nonce (read nonce → sign → submit stays atomic). */
export function withVaultLock<T>(vault: `0x${string}`, fn: () => Promise<T>): Promise<T> {
  const key = vault.toLowerCase();
  const prev = vaultLocks.get(key) ?? Promise.resolve();
  const run = prev.then(fn, fn);
  vaultLocks.set(
    key,
    run.then(
      () => {},
      () => {},
    ),
  );
  return run;
}

let sendQueue: Promise<unknown> = Promise.resolve();

/** Serialize broadcasts from the single relayer EOA so its tx nonce can't race. */
function serializeSend<T>(fn: () => Promise<T>): Promise<T> {
  const run = sendQueue.then(fn, fn);
  sendQueue = run.then(
    () => {},
    () => {},
  );
  return run;
}

/**
 * Sign a backend allocation for `calls` and submit the rebalance from the
 * keeper EOA. Reads the vault nonce fresh, so call this inside `withVaultLock`.
 * Returns the mined tx hash.
 */
export async function signAndSubmit(
  vault: `0x${string}`,
  calls: VaultCall[],
): Promise<`0x${string}`> {
  const { publicClient, walletClient, signer, keeper } = ctx();
  const nonce = (await publicClient.readContract({
    address: vault,
    abi: VAULT_ABI,
    functionName: "nonce",
  })) as bigint;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
  const signature = await signer.signTypedData(
    allocationTypedData({ vault, chainId: arbitrumSepolia.id, calls, nonce, deadline }),
  );
  const hash = await serializeSend(() =>
    walletClient.writeContract({
      account: keeper,
      chain: arbitrumSepolia,
      address: vault,
      abi: VAULT_ABI,
      functionName: "rebalance",
      args: [calls, deadline, signature],
    }),
  );
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}
