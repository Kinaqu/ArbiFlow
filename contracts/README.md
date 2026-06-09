# ArbiFlow contracts

The on-chain half of ArbiFlow: a **non-custodial delegation vault** that a backend-signed keeper can rebalance across whitelisted protocols, but **can never drain**. Built with [Foundry](https://book.getfoundry.sh) (Solidity 0.8.28, OpenZeppelin).

## Contracts

| Contract | Role |
|---|---|
| `src/DelegationVault.sol` | Per-user, non-custodial vault. Holds the owner's funds; a keeper may only trigger **guarded** rebalances. EIP-712 allocations, owner-only withdrawals, gas reimbursement. |
| `src/VaultFactory.sol` | Deploys deterministic vault clones (`Clones`) and doubles as the shared config hub: target/asset whitelist, `backendSigner`, `maxSlippageBps`, and the USD price set used by the value invariant. `Ownable` (a timelock + multisig in production). |
| `src/IVaultConfig.sol` | The config interface the vault reads from the factory. |

## Security guarantees

These hold **on-chain**, regardless of what the backend or keeper does:

- **Non-custodial** — only `owner` can `withdraw`; the keeper never can.
- **Curate + sign, never drain** — each rebalance carries an EIP-712 `Allocation` signed by `backendSigner`, bound to the vault's `nonce` + a `deadline`.
- **Whitelisted targets only** — every call in a rebalance batch must hit a `config.allowedTarget`.
- **Value floor on every move** — total portfolio USD value (summed over the admin-priced asset set) may not drop more than `maxSlippageBps` across the batch.
- **Always-open escape hatch** — `emergencyWithdraw` lets the owner exit even if the keeper goes dark.
- **Compromised keeper ≠ loss** — a stolen keeper key still cannot route to a non-whitelisted target or move value out.
- **Keeper made whole** — gas spent on a rebalance is reimbursed from the vault's own ETH reserve (`GasReimbursed`), so keepers only need a small float.

## Deployed — Arbitrum Sepolia

| Contract | Address |
|---|---|
| VaultFactory | [`0xAd84Cd0C…59892B78`](https://sepolia.arbiscan.io/address/0xAd84Cd0C4aA9D85D2B8D877C742F3feB59892B78) |
| afUSDC (demo stable) | [`0x3AE930B0…3eDE08e5`](https://sepolia.arbiscan.io/address/0x3AE930B0960d1d883fDBa4F7Bb9D6Fe03eDE08e5) |
| **Demo vault** (auto-rebalancing) | [`0xB2AA9601…51f4d56E`](https://sepolia.arbiscan.io/address/0xB2AA9601b085350fD0eE12697C829BBa51f4d56E) |
| Aave (demo target) | [`0x6908ec48…fdB81667`](https://sepolia.arbiscan.io/address/0x6908ec486B1591aA983D590301407188fdB81667) |
| Compound (demo target) | [`0xd009eFd4…54FB5A2d`](https://sepolia.arbiscan.io/address/0xd009eFd44546b74AB4D14433FaAeFd9854FB5A2d) |
| Morpho (demo target) | [`0xD5AA7198…Fb1FC838`](https://sepolia.arbiscan.io/address/0xD5AA7198C36fA8342FcAa4Df0ae67d44Fb1FC838) |

The frontend reads these from [`../lib/testnet.ts`](../lib/testnet.ts).

## Build & test

```bash
forge build
forge test                 # unit + gas suite (DelegationVault, Rebalance, gas)
```

**Fork test against the real Aave V3** (Arbitrum One pool `0x794a…14aD`) — needs an `arb1` RPC:

```bash
ARBITRUM_RPC_URL=<arb1-rpc> forge test --match-path test/RebalanceForkAave.t.sol -vv
```

It exercises `test_RebalanceSuppliesToRealAave` (USDC → aUSDC 1:1, value floor holds) and `test_RoundTripThroughRealAave` (supply then withdraw, back to USDC) — the same guarded path the vault uses on mainnet, with zero real capital.

## Deploy

```bash
DEPLOYER_PK=<funded-sepolia-key> \
ARBITRUM_SEPOLIA_RPC_URL=<sepolia-rpc> \
forge script script/DeployDemo.s.sol --rpc-url arbitrum_sepolia --broadcast
```

Copy the printed addresses into [`../lib/testnet.ts`](../lib/testnet.ts) (`TESTNET_DEPLOYMENT`) — the `/architecture` page and in-app testnet view light up automatically once they're filled in.
