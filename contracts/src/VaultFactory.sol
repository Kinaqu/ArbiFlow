// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IVaultConfig} from "./IVaultConfig.sol";
import {DelegationVault} from "./DelegationVault.sol";

/// @title VaultFactory
/// @notice Deploys per-user DelegationVault clones and doubles as the shared,
/// admin-curated config hub: whitelist of targets/assets, backend signer, max
/// slippage, and the USD price set used for the rebalance value invariant. For
/// production the admin should be a timelock + multisig.
contract VaultFactory is Ownable, IVaultConfig {
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @notice DelegationVault implementation that clones delegate to.
    address public immutable implementation;

    /// @inheritdoc IVaultConfig
    mapping(address => bool) public override allowedTarget;
    /// @inheritdoc IVaultConfig
    mapping(address => bool) public override allowedAsset;
    /// @inheritdoc IVaultConfig
    address public override backendSigner;
    /// @inheritdoc IVaultConfig
    uint256 public override maxSlippageBps;
    /// @inheritdoc IVaultConfig
    mapping(address => uint256) public override priceE18;

    /// @dev Set of tokens with a price; valued by the vault's rebalance invariant.
    EnumerableSet.AddressSet private _pricedAssets;

    /// @notice user => their deterministic vault clone (address(0) if none yet).
    mapping(address => address) public vaultOf;

    event VaultCreated(address indexed owner, address vault);
    event TargetSet(address indexed target, bool allowed);
    event AssetSet(address indexed asset, bool allowed);
    event PriceSet(address indexed token, uint256 priceE18);
    event BackendSignerSet(address signer);
    event MaxSlippageSet(uint256 bps);

    constructor(address admin, address backendSigner_, uint256 maxSlippageBps_) Ownable(admin) {
        require(maxSlippageBps_ <= 2_000, "slippage too high");
        implementation = address(new DelegationVault());
        backendSigner = backendSigner_;
        maxSlippageBps = maxSlippageBps_;
        emit BackendSignerSet(backendSigner_);
        emit MaxSlippageSet(maxSlippageBps_);
    }

    /// @notice Deploy the caller's vault. One per user; address is deterministic.
    function createVault() external returns (address vault) {
        require(vaultOf[msg.sender] == address(0), "vault exists");
        vault = Clones.cloneDeterministic(implementation, _salt(msg.sender));
        DelegationVault(vault).initialize(msg.sender, address(this));
        vaultOf[msg.sender] = vault;
        emit VaultCreated(msg.sender, vault);
    }

    /// @notice Predict a user's vault address before it is created (for the UI).
    function predictVault(address user) external view returns (address) {
        return Clones.predictDeterministicAddress(implementation, _salt(user), address(this));
    }

    /// @inheritdoc IVaultConfig
    function pricedAssets() external view override returns (address[] memory) {
        return _pricedAssets.values();
    }

    function _salt(address user) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(user));
    }

    // --- admin config (production: gate behind a timelock) ---

    function setTarget(address target, bool allowed) external onlyOwner {
        allowedTarget[target] = allowed;
        emit TargetSet(target, allowed);
    }

    function setAsset(address asset, bool allowed) external onlyOwner {
        allowedAsset[asset] = allowed;
        emit AssetSet(asset, allowed);
    }

    /// @notice Set (price > 0) or unset (price == 0) a token's USD price (1e18 scale).
    function setPrice(address token, uint256 priceE18_) external onlyOwner {
        priceE18[token] = priceE18_;
        if (priceE18_ == 0) {
            _pricedAssets.remove(token);
        } else {
            _pricedAssets.add(token);
        }
        emit PriceSet(token, priceE18_);
    }

    function setBackendSigner(address signer) external onlyOwner {
        backendSigner = signer;
        emit BackendSignerSet(signer);
    }

    function setMaxSlippageBps(uint256 bps) external onlyOwner {
        require(bps <= 2_000, "slippage too high");
        maxSlippageBps = bps;
        emit MaxSlippageSet(bps);
    }
}
