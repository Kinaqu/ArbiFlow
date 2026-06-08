// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IVaultConfig} from "./IVaultConfig.sol";

/// @title DelegationVault
/// @notice Per-user, non-custodial delegation vault. Funds it holds belong to
/// `owner`: only the owner can withdraw, and the owner can revoke the keeper at
/// any time. A keeper may only trigger guarded rebalances — every call must hit
/// an admin-whitelisted target, and the portfolio's USD value (summed over the
/// admin-priced asset set) may not drop by more than `maxSlippageBps` across the
/// batch. Combined with backend-signed allocations, that means: ArbiFlow curates
/// where funds may go and signs each move, but can never take the funds, and a
/// compromised keeper key still cannot route to a non-whitelisted target or
/// drain value.
contract DelegationVault is Initializable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice One executable step of a rebalance batch.
    /// @param target   Contract to call (must be an allowed target).
    /// @param sellToken Token `target` will pull from the vault; address(0) if none.
    /// @param sellAmount Approval granted to `target` for `sellToken` (reset to 0 after).
    /// @param value    Native value forwarded with the call.
    /// @param data     Calldata for `target`.
    struct Call {
        address target;
        address sellToken;
        uint256 sellAmount;
        uint256 value;
        bytes data;
    }

    /// @notice The user who owns the funds in this vault.
    address public owner;
    /// @notice Address allowed to call `rebalance`; settable/revocable by owner.
    address public keeper;
    /// @notice Monotonic nonce binding each backend signature to one rebalance.
    uint256 public nonce;
    /// @notice Shared config/whitelist/price source (the factory).
    IVaultConfig public config;

    bytes32 private constant _DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 private constant _ALLOCATION_TYPEHASH =
        keccak256("Allocation(bytes32 callsHash,uint256 nonce,uint256 deadline)");
    bytes32 private constant _NAME_HASH = keccak256(bytes("ArbiFlowDelegationVault"));
    bytes32 private constant _VERSION_HASH = keccak256(bytes("1"));

    /// @dev Gas added to the metered rebalance region (base tx + calldata + the
    /// reimburse path itself) so the keeper is reimbursed roughly whole, not just
    /// for the execution gas that `gasleft()` can see.
    uint256 private constant _GAS_OVERHEAD = 40_000;

    event Deposited(address indexed token, address indexed from, uint256 amount);
    event Withdrawn(address indexed token, address indexed to, uint256 amount);
    event KeeperSet(address indexed keeper);
    event Rebalanced(uint256 indexed nonce, uint256 preValue, uint256 postValue, uint256 callCount);
    event GasFunded(address indexed from, uint256 amount);
    event GasReimbursed(address indexed keeper, uint256 amount);
    event EthWithdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    /// @dev Locks the implementation so only clones can be initialized.
    constructor() {
        _disableInitializers();
    }

    function initialize(address owner_, address config_) external initializer {
        require(owner_ != address(0), "zero owner");
        owner = owner_;
        config = IVaultConfig(config_);
    }

    /// @notice Fund this vault's ETH gas reserve. The ETH belongs to the owner —
    /// withdrawable any time via `withdrawEth` / `emergencyWithdraw` — and is
    /// spent only to reimburse the keeper's gas on each rebalance. Held per-vault,
    /// so it is provably the owner's and never commingled.
    receive() external payable {
        emit GasFunded(msg.sender, msg.value);
    }

    /// @notice Set or revoke (set to address(0)) the keeper.
    function setKeeper(address keeper_) external onlyOwner {
        keeper = keeper_;
        emit KeeperSet(keeper_);
    }

    /// @notice Pull `amount` of a whitelisted `token` from the caller into the vault.
    function deposit(address token, uint256 amount) external nonReentrant {
        require(config.allowedAsset(token), "asset not allowed");
        require(amount > 0, "zero amount");
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(token, msg.sender, amount);
    }

    /// @notice Owner withdraws `amount` of `token` to `to`. Keeper cannot call this.
    function withdraw(address token, uint256 amount, address to) external onlyOwner nonReentrant {
        require(to != address(0), "zero to");
        IERC20(token).safeTransfer(to, amount);
        emit Withdrawn(token, to, amount);
    }

    /// @notice Owner reclaims `amount` of the vault's unused gas-reserve ETH to `to`.
    function withdrawEth(uint256 amount, address to) external onlyOwner nonReentrant {
        require(to != address(0), "zero to");
        (bool ok,) = payable(to).call{value: amount}("");
        require(ok, "eth send failed");
        emit EthWithdrawn(to, amount);
    }

    /// @notice Owner sweeps the full balance of each listed token to `to`. The
    /// non-custodial escape hatch: funds are never locked away from the owner,
    /// even if the keeper/backend is offline or misbehaving.
    function emergencyWithdraw(address[] calldata tokens, address to) external onlyOwner nonReentrant {
        require(to != address(0), "zero to");
        for (uint256 i; i < tokens.length; ++i) {
            uint256 bal = IERC20(tokens[i]).balanceOf(address(this));
            if (bal > 0) {
                IERC20(tokens[i]).safeTransfer(to, bal);
                emit Withdrawn(tokens[i], to, bal);
            }
        }
        // Also return any leftover gas-reserve ETH (best-effort, so a rejecting
        // `to` can't strand the swept tokens).
        uint256 ethBal = address(this).balance;
        if (ethBal > 0) {
            (bool ok,) = payable(to).call{value: ethBal}("");
            if (ok) emit EthWithdrawn(to, ethBal);
        }
    }

    /// @notice Keeper entrypoint. Executes a backend-signed batch of calls, each
    /// constrained to a whitelisted target, then enforces the value invariant.
    /// @param calls     Ordered execution steps (e.g. withdraw from pool A, supply to pool B).
    /// @param deadline  Unix time after which the signature is invalid.
    /// @param signature Backend EIP-712 signature over Allocation(callsHash, nonce, deadline).
    function rebalance(Call[] calldata calls, uint256 deadline, bytes calldata signature) external nonReentrant {
        uint256 startGas = gasleft();
        require(msg.sender == keeper && keeper != address(0), "not keeper");
        require(block.timestamp <= deadline, "expired");

        // Bind the signature to exactly these calls + this vault + this nonce.
        bytes32 callsHash = keccak256(abi.encode(calls));
        bytes32 structHash = keccak256(abi.encode(_ALLOCATION_TYPEHASH, callsHash, nonce, deadline));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", _domainSeparator(), structHash));
        require(ECDSA.recover(digest, signature) == config.backendSigner(), "bad signature");
        uint256 used = nonce++;

        uint256 preValue = _portfolioValue();

        for (uint256 i; i < calls.length; ++i) {
            Call calldata c = calls[i];
            require(config.allowedTarget(c.target), "target not allowed");
            if (c.sellToken != address(0)) {
                require(config.allowedAsset(c.sellToken), "sell asset not allowed");
                IERC20(c.sellToken).forceApprove(c.target, c.sellAmount);
            }
            (bool ok, bytes memory ret) = c.target.call{value: c.value}(c.data);
            if (!ok) _bubbleRevert(ret);
            if (c.sellToken != address(0)) {
                IERC20(c.sellToken).forceApprove(c.target, 0);
            }
        }

        // Value measured only over whitelisted, priced assets — so funds leaving
        // the whitelisted set show up as a value drop and trip this guard too.
        uint256 postValue = _portfolioValue();
        require(postValue >= preValue - (preValue * config.maxSlippageBps()) / 10_000, "value dropped");

        emit Rebalanced(used, preValue, postValue, calls.length);

        // Runs last, after every state change, still inside nonReentrant.
        _reimburse(startGas);
    }

    /// @dev Reimburse the keeper (msg.sender) for the gas this rebalance burned,
    /// paid from the vault's own ETH reserve and capped at it — so it can never
    /// overpay or revert for lack of ETH. ETH is not a priced asset, so this does
    /// not affect the USD value invariant above.
    function _reimburse(uint256 startGas) private {
        uint256 spent = (startGas - gasleft() + _GAS_OVERHEAD) * tx.gasprice;
        uint256 bal = address(this).balance;
        uint256 pay = spent > bal ? bal : spent;
        if (pay > 0) {
            (bool ok,) = payable(msg.sender).call{value: pay}("");
            if (ok) emit GasReimbursed(msg.sender, pay);
        }
    }

    /// @dev Sum of vault holdings across the admin-priced asset set, in 1e18 USD.
    function _portfolioValue() internal view returns (uint256 total) {
        address[] memory assets = config.pricedAssets();
        for (uint256 i; i < assets.length; ++i) {
            uint256 bal = IERC20(assets[i]).balanceOf(address(this));
            if (bal == 0) continue;
            uint256 price = config.priceE18(assets[i]);
            if (price == 0) continue;
            total += (bal * price) / (10 ** IERC20Metadata(assets[i]).decimals());
        }
    }

    function _domainSeparator() internal view returns (bytes32) {
        // Built from address(this) at call time, so it is correct per clone.
        return keccak256(abi.encode(_DOMAIN_TYPEHASH, _NAME_HASH, _VERSION_HASH, block.chainid, address(this)));
    }

    function _bubbleRevert(bytes memory ret) private pure {
        if (ret.length > 0) {
            assembly {
                revert(add(ret, 0x20), mload(ret))
            }
        }
        revert("call failed");
    }
}
