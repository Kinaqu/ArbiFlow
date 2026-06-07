// Server-only keeper for the testnet vault demo. Holds the backend keys and is
// imported ONLY by the /api/keeper route handlers — never by client code.
//
//   • KEEPER_MNEMONIC seeds a POOL of keeper EOAs (m/44'/60'/0'/0/i for i in
//     0..KEEPER_POOL_SIZE-1, default 16). Each vault is sharded to one keeper, and
//     each keeper submits + fronts gas independently, then is reimbursed from that
//     vault's own ETH reserve — so the pool parallelises submission (no single
//     nonce bottleneck) and each key only needs a small ETH float. If KEEPER_MNEMONIC
//     is unset, a single-key pool is built from KEEPER_PK (back-compat).
//   • BACKEND_PK is the allocation signer (must equal the factory's backendSigner).
//     Defaults to the public demo key 0xA11CE; one signer authorises every pool
//     keeper (the Allocation signature is keeper-agnostic).
//   • GAS_FUNDER_PK (optional) auto-tops-up any pool keeper that dips below
//     KEEPER_MIN_FLOAT; DEPLOYER_PK is deploy-only and is NOT read here.
//
// Because the keepers are server keys (not the user), the user can deposit and
// withdraw but can never move funds between protocols — only the backend can.

import {
  createPublicClient,
  createWalletClient,
  erc20Abi,
  http,
  parseEther,
  type PublicClient,
  type WalletClient,
} from "viem";
import {
  mnemonicToAccount,
  privateKeyToAccount,
  type HDAccount,
  type PrivateKeyAccount,
} from "viem/accounts";
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

/** A pool keeper account — HD-derived from the mnemonic, or a single KEEPER_PK. */
export type KeeperAccount = HDAccount | PrivateKeyAccount;

function normPk(raw: string | undefined): `0x${string}` | null {
  if (!raw) return null;
  const t = raw.trim().replace(/^["']|["']$/g, "");
  if (!t) return null;
  return (t.startsWith("0x") ? t : `0x${t}`) as `0x${string}`;
}

function poolSize(): number {
  const n = Number.parseInt(process.env.KEEPER_POOL_SIZE ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 16;
}

/** Derive the keeper pool: N accounts from KEEPER_MNEMONIC, or one from KEEPER_PK. */
function buildPool(): KeeperAccount[] {
  const mnemonic = process.env.KEEPER_MNEMONIC?.trim().replace(/^["']|["']$/g, "");
  if (mnemonic) {
    const n = poolSize();
    return Array.from({ length: n }, (_, i) => mnemonicToAccount(mnemonic, { addressIndex: i }));
  }
  const pk = normPk(process.env.KEEPER_PK);
  if (pk) return [privateKeyToAccount(pk)];
  throw new Error("No keeper configured — set KEEPER_MNEMONIC (or KEEPER_PK) on the server.");
}

type Ctx = {
  publicClient: PublicClient;
  walletClient: WalletClient;
  signer: PrivateKeyAccount;
  keepers: KeeperAccount[];
  funder: PrivateKeyAccount | null;
};

let _ctx: Ctx | null = null;

/** Lazily build the clients so an unset key fails at request time, not at build. */
function ctx(): Ctx {
  if (_ctx) return _ctx;
  const keepers = buildPool();
  const signerPk = normPk(process.env.BACKEND_PK) ?? DEMO_BACKEND_PK;
  const funderPk = normPk(process.env.GAS_FUNDER_PK);
  const rpc = process.env.ARBITRUM_SEPOLIA_RPC_URL?.trim() || undefined;
  _ctx = {
    publicClient: createPublicClient({ chain: arbitrumSepolia, transport: http(rpc) }),
    // No bound account — each send passes its own `account` (keeper or funder).
    walletClient: createWalletClient({ chain: arbitrumSepolia, transport: http(rpc) }),
    signer: privateKeyToAccount(signerPk),
    keepers,
    funder: funderPk ? privateKeyToAccount(funderPk) : null,
  };
  return _ctx;
}

// --- pool assignment + resolution ----------------------------------------------

/** Deterministic, even keeper assignment for a vault (the sharding hint). */
export function keeperFor(vault: `0x${string}`): KeeperAccount {
  const { keepers } = ctx();
  const idx = Number(BigInt(vault) % BigInt(keepers.length));
  return keepers[idx];
}

/** Address the vault should delegate to — what `setKeeper` is pointed at. */
export function poolKeeperAddressFor(vault: `0x${string}`): `0x${string}` {
  return keeperFor(vault).address;
}

/** First pool keeper — the no-vault default for the address route. */
export function defaultKeeperAddress(): `0x${string}` {
  return ctx().keepers[0].address;
}

/** The pool account matching an on-chain keeper, or null if it isn't ours. */
export function keeperByAddress(addr: `0x${string}`): KeeperAccount | null {
  const a = addr.toLowerCase();
  return ctx().keepers.find((k) => k.address.toLowerCase() === a) ?? null;
}

/** Current Arbitrum Sepolia gas price (wei) — used to size the per-rebalance cost. */
export function gasPrice(): Promise<bigint> {
  return ctx().publicClient.getGasPrice();
}

/** A keeper EOA's ETH float (wei) — checked before it fronts a rebalance's gas. */
export function keeperBalance(addr: `0x${string}`): Promise<bigint> {
  return ctx().publicClient.getBalance({ address: addr });
}

export type VaultSnapshot = {
  keeper: `0x${string}`;
  nonce: bigint;
  idleUsdc: bigint;
  /** The vault's own ETH gas reserve (wei), reimbursed to the keeper per move. */
  vaultEth: bigint;
  positions: Record<ProtocolKey, bigint>;
  location: FundLocation;
  activeAmount: bigint;
};

/** Read the on-chain state the keeper needs to make a decision. */
export async function readVault(vault: `0x${string}`): Promise<VaultSnapshot> {
  const pc = ctx().publicClient;
  const [keeper, nonce, idleUsdc, vaultEth, ...posBalances] = await Promise.all([
    pc.readContract({ address: vault, abi: VAULT_ABI, functionName: "keeper" }) as Promise<`0x${string}`>,
    pc.readContract({ address: vault, abi: VAULT_ABI, functionName: "nonce" }) as Promise<bigint>,
    pc.readContract({ address: USDC, abi: erc20Abi, functionName: "balanceOf", args: [vault] }) as Promise<bigint>,
    pc.getBalance({ address: vault }) as Promise<bigint>,
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

  return { keeper, nonce, idleUsdc, vaultEth, positions, location, activeAmount };
}

// --- per-vault lock + per-EOA serialized sends ---------------------------------

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

// One send queue per EOA (keeper or funder): broadcasts serialise within an EOA
// so its tx nonce can't race, but different EOAs send in parallel — that's the
// pool's throughput win over a single shared queue.
const sendQueues = new Map<string, Promise<unknown>>();

function serializeSendFor<T>(eoa: `0x${string}`, fn: () => Promise<T>): Promise<T> {
  const key = eoa.toLowerCase();
  const prev = sendQueues.get(key) ?? Promise.resolve();
  const run = prev.then(fn, fn);
  sendQueues.set(
    key,
    run.then(
      () => {},
      () => {},
    ),
  );
  return run;
}

/** Read an ETH-denominated env threshold (wei), falling back on absence/parse error. */
function ethEnv(name: string, fallback: string): bigint {
  const raw = process.env[name]?.trim();
  try {
    return parseEther(raw || fallback);
  } catch {
    return parseEther(fallback);
  }
}

/**
 * Gas-station: if a pool keeper's float dips below KEEPER_MIN_FLOAT, top it up
 * with KEEPER_TOPUP from the funder (no-op when no GAS_FUNDER_PK is set). Also
 * self-seeds a fresh keeper on first use. Cheap and rare — per-vault reimbursement
 * keeps floats roughly constant.
 */
export async function ensureFloat(keeperAddr: `0x${string}`): Promise<void> {
  const { publicClient, walletClient, funder } = ctx();
  if (!funder) return;
  const minFloat = ethEnv("KEEPER_MIN_FLOAT", "0.02");
  const bal = await publicClient.getBalance({ address: keeperAddr });
  if (bal >= minFloat) return;
  const topup = ethEnv("KEEPER_TOPUP", "0.05");
  const hash = await serializeSendFor(funder.address, () =>
    walletClient.sendTransaction({
      account: funder,
      chain: arbitrumSepolia,
      to: keeperAddr,
      value: topup,
    }),
  );
  await publicClient.waitForTransactionReceipt({ hash });
}

/**
 * Sign a backend allocation for `calls` and submit the rebalance from `keeper`'s
 * EOA. Reads the vault nonce fresh, so call this inside `withVaultLock`. Returns
 * the mined tx hash.
 */
export async function signAndSubmit(
  vault: `0x${string}`,
  calls: VaultCall[],
  keeper: KeeperAccount,
): Promise<`0x${string}`> {
  const { publicClient, walletClient, signer } = ctx();
  const nonce = (await publicClient.readContract({
    address: vault,
    abi: VAULT_ABI,
    functionName: "nonce",
  })) as bigint;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
  const signature = await signer.signTypedData(
    allocationTypedData({ vault, chainId: arbitrumSepolia.id, calls, nonce, deadline }),
  );
  const hash = await serializeSendFor(keeper.address, () =>
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
