// Minimal hand-written ABIs for the testnet vault demo — only the functions the
// in-app flow touches. ERC-20 reads/approve reuse viem's `erc20Abi`; the faucet
// mint and the vault/factory/protocol entrypoints live here.

export const FACTORY_ABI = [
  {
    type: "function",
    name: "createVault",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [{ name: "vault", type: "address" }],
  },
  {
    type: "function",
    name: "vaultOf",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "predictVault",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "address" }],
  },
] as const;

export const VAULT_ABI = [
  {
    type: "function",
    name: "deposit",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "to", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "emergencyWithdraw",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokens", type: "address[]" },
      { name: "to", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "setKeeper",
    stateMutability: "nonpayable",
    inputs: [{ name: "keeper", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "keeper",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "nonce",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "rebalance",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "calls",
        type: "tuple[]",
        components: [
          { name: "target", type: "address" },
          { name: "sellToken", type: "address" },
          { name: "sellAmount", type: "uint256" },
          { name: "value", type: "uint256" },
          { name: "data", type: "bytes" },
        ],
      },
      { name: "deadline", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
  // Owner reclaims unused gas-reserve ETH.
  {
    type: "function",
    name: "withdrawEth",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "to", type: "address" },
    ],
    outputs: [],
  },
  // Plain ETH transfers fund the gas reserve.
  { type: "receive", stateMutability: "payable" },
] as const;

/** afUSDC faucet — MockERC20.mint is public on testnet. */
export const MINT_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

/** MockProtocol — used only to encode rebalance-leg calldata. */
export const PROTOCOL_ABI = [
  {
    type: "function",
    name: "supply",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "onBehalf", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "to", type: "address" },
    ],
    outputs: [],
  },
] as const;
