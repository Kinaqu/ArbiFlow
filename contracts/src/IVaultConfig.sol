// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice Config surface a DelegationVault reads from its factory. Keeping it
/// an interface breaks the factory<->vault import cycle and lets every vault
/// share one admin-curated whitelist + signer + price set.
interface IVaultConfig {
    /// @dev Routers / protocol contracts the keeper is allowed to call during a rebalance.
    function allowedTarget(address target) external view returns (bool);

    /// @dev Tokens / position tokens the vault is allowed to deposit and hold.
    function allowedAsset(address asset) external view returns (bool);

    /// @dev Address whose EIP-712 signature authorizes a rebalance allocation.
    function backendSigner() external view returns (address);

    /// @dev Max portfolio value drop (bps) tolerated across a single rebalance.
    function maxSlippageBps() external view returns (uint256);

    /// @dev USD price of `token` scaled to 1e18 (0 = not priced / unknown).
    function priceE18(address token) external view returns (uint256);

    /// @dev Every token that has a price set — the set valued for the rebalance invariant.
    function pricedAssets() external view returns (address[] memory);
}
