// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {VaultFactory} from "../src/VaultFactory.sol";
import {DelegationVault} from "../src/DelegationVault.sol";

interface IAavePool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

/// @notice Proves the guarded rebalance interacts correctly with the REAL Aave
/// V3 pool on a fork of Arbitrum One — the exact path the testnet demo runs
/// against a mock. This is how the vault will move funds into real protocols on
/// mainnet, exercised without spending real funds.
///
/// Needs an Arbitrum One RPC: ARBITRUM_RPC_URL=... forge test --match-contract RebalanceForkAave
/// If ARBITRUM_RPC_URL is unset the tests skip (so a plain `forge test` stays green).
contract RebalanceForkAaveTest is Test {
    bytes32 constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 constant ALLOCATION_TYPEHASH =
        keccak256("Allocation(bytes32 callsHash,uint256 nonce,uint256 deadline)");
    bytes32 constant NAME_HASH = keccak256(bytes("ArbiFlowDelegationVault"));
    bytes32 constant VERSION_HASH = keccak256(bytes("1"));

    // Arbitrum One mainnet addresses.
    address constant AAVE_POOL = 0x794a61358D6845594F94dc1DB02A252b5b4814aD; // Aave V3 Pool
    address constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831; // native USDC, 6 decimals
    address constant AUSDC = 0x724dc807b04555b71ed48a6896b6F41593b8C637; // aArbUSDCn (Aave aToken)

    VaultFactory factory;
    DelegationVault vault;

    uint256 signerPk = 0xA11CE;
    address backendSigner;
    address admin = address(0xAD11);
    address user = address(0xB0B);
    address keeper = address(0xCAFE);

    uint256 constant FUND = 1_000e6;
    bool internal _skip;

    function setUp() public {
        string memory rpc = vm.envOr("ARBITRUM_RPC_URL", string(""));
        if (bytes(rpc).length == 0) {
            _skip = true;
            return;
        }
        vm.createSelectFork(rpc);
        require(AAVE_POOL.code.length > 0, "no Aave pool on fork");
        require(AUSDC.code.length > 0, "wrong aToken address");

        backendSigner = vm.addr(signerPk);
        factory = new VaultFactory(admin, backendSigner, 100); // 1% max slippage

        vm.startPrank(admin);
        factory.setAsset(USDC, true);
        factory.setAsset(AUSDC, true);
        factory.setTarget(AAVE_POOL, true);
        factory.setPrice(USDC, 1e18);
        factory.setPrice(AUSDC, 1e18);
        vm.stopPrank();

        vm.prank(user);
        vault = DelegationVault(factory.createVault());
        vm.prank(user);
        vault.setKeeper(keeper);

        deal(USDC, address(vault), FUND);
    }

    function test_RebalanceSuppliesToRealAave() public {
        if (_skip) {
            vm.skip(true);
            return;
        }
        DelegationVault.Call[] memory calls = _supply(FUND);
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(calls, vault.nonce(), deadline);

        vm.prank(keeper);
        vault.rebalance(calls, deadline, sig);

        assertEq(IERC20(USDC).balanceOf(address(vault)), 0, "usdc should be supplied");
        assertApproxEqAbs(IERC20(AUSDC).balanceOf(address(vault)), FUND, 10, "aToken not received 1:1");
    }

    function test_RoundTripThroughRealAave() public {
        if (_skip) {
            vm.skip(true);
            return;
        }
        // Supply USDC -> aUSDC. Sign (which reads nonce()) before pranking, so
        // the prank lands on rebalance and not on the nonce() staticcall.
        DelegationVault.Call[] memory supplyCalls = _supply(FUND);
        uint256 d1 = block.timestamp + 1 hours;
        bytes memory sig1 = _sign(supplyCalls, vault.nonce(), d1);
        vm.prank(keeper);
        vault.rebalance(supplyCalls, d1, sig1);

        // Withdraw aUSDC -> USDC, back to the vault.
        DelegationVault.Call[] memory wCalls = new DelegationVault.Call[](1);
        wCalls[0] = DelegationVault.Call({
            target: AAVE_POOL,
            sellToken: AUSDC,
            sellAmount: type(uint256).max,
            value: 0,
            data: abi.encodeCall(IAavePool.withdraw, (USDC, type(uint256).max, address(vault)))
        });
        uint256 d2 = block.timestamp + 1 hours;
        bytes memory sig2 = _sign(wCalls, vault.nonce(), d2);
        vm.prank(keeper);
        vault.rebalance(wCalls, d2, sig2);

        assertApproxEqAbs(IERC20(USDC).balanceOf(address(vault)), FUND, 10, "usdc not returned");
        assertEq(IERC20(AUSDC).balanceOf(address(vault)), 0, "aUSDC should be redeemed");
    }

    function _supply(uint256 amount) internal view returns (DelegationVault.Call[] memory calls) {
        calls = new DelegationVault.Call[](1);
        calls[0] = DelegationVault.Call({
            target: AAVE_POOL,
            sellToken: USDC,
            sellAmount: amount,
            value: 0,
            data: abi.encodeCall(IAavePool.supply, (USDC, amount, address(vault), 0))
        });
    }

    function _sign(DelegationVault.Call[] memory calls, uint256 nonce_, uint256 deadline)
        internal
        view
        returns (bytes memory)
    {
        bytes32 callsHash = keccak256(abi.encode(calls));
        bytes32 structHash = keccak256(abi.encode(ALLOCATION_TYPEHASH, callsHash, nonce_, deadline));
        bytes32 domain =
            keccak256(abi.encode(DOMAIN_TYPEHASH, NAME_HASH, VERSION_HASH, block.chainid, address(vault)));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domain, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, digest);
        return abi.encodePacked(r, s, v);
    }
}
