// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {VaultFactory} from "../src/VaultFactory.sol";
import {DelegationVault} from "../src/DelegationVault.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {MockProtocol} from "./mocks/MockProtocol.sol";

contract RebalanceTest is Test {
    bytes32 constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 constant ALLOCATION_TYPEHASH =
        keccak256("Allocation(bytes32 callsHash,uint256 nonce,uint256 deadline)");
    bytes32 constant NAME_HASH = keccak256(bytes("ArbiFlowDelegationVault"));
    bytes32 constant VERSION_HASH = keccak256(bytes("1"));

    VaultFactory factory;
    MockERC20 usdc;
    MockERC20 pos;
    MockProtocol proto;
    DelegationVault vault;

    uint256 signerPk = 0xA11CE;
    address backendSigner;
    address admin = address(0xAD11);
    address user = address(0xB0B);
    address keeper = address(0xCAFE);

    uint256 constant FUND = 1_000e6;

    function setUp() public {
        backendSigner = vm.addr(signerPk);
        usdc = new MockERC20("USD Coin", "USDC", 6);
        pos = new MockERC20("Mock aUSDC", "maUSDC", 6);
        factory = new VaultFactory(admin, backendSigner, 100); // 1% max slippage
        proto = new MockProtocol(IERC20(address(usdc)), pos);

        vm.startPrank(admin);
        factory.setAsset(address(usdc), true);
        factory.setAsset(address(pos), true);
        factory.setTarget(address(proto), true);
        factory.setPrice(address(usdc), 1e18);
        factory.setPrice(address(pos), 1e18);
        vm.stopPrank();

        vm.prank(user);
        vault = DelegationVault(factory.createVault());
        vm.prank(user);
        vault.setKeeper(keeper);

        usdc.mint(address(vault), FUND);
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

    function _supplyCall(uint256 amount) internal view returns (DelegationVault.Call[] memory calls) {
        calls = new DelegationVault.Call[](1);
        calls[0] = DelegationVault.Call({
            target: address(proto),
            sellToken: address(usdc),
            sellAmount: amount,
            value: 0,
            data: abi.encodeCall(MockProtocol.supply, (amount, address(vault)))
        });
    }

    function test_RebalanceSupplyPreservesValue() public {
        DelegationVault.Call[] memory calls = _supplyCall(FUND);
        bytes memory sig = _sign(calls, 0, block.timestamp + 1 hours);

        vm.prank(keeper);
        vault.rebalance(calls, block.timestamp + 1 hours, sig);

        assertEq(usdc.balanceOf(address(vault)), 0);
        assertEq(pos.balanceOf(address(vault)), FUND);
        assertEq(vault.nonce(), 1);
    }

    function test_NotKeeperReverts() public {
        DelegationVault.Call[] memory calls = _supplyCall(FUND);
        bytes memory sig = _sign(calls, 0, block.timestamp + 1 hours);
        vm.prank(user); // owner is not the keeper
        vm.expectRevert(bytes("not keeper"));
        vault.rebalance(calls, block.timestamp + 1 hours, sig);
    }

    function test_ExpiredReverts() public {
        DelegationVault.Call[] memory calls = _supplyCall(FUND);
        bytes memory sig = _sign(calls, 0, 0);
        vm.prank(keeper);
        vm.expectRevert(bytes("expired"));
        vault.rebalance(calls, 0, sig);
    }

    function test_BadSignatureReverts() public {
        DelegationVault.Call[] memory calls = _supplyCall(FUND);
        uint256 deadline = block.timestamp + 1 hours;
        // Sign with the wrong key.
        bytes32 callsHash = keccak256(abi.encode(calls));
        bytes32 structHash = keccak256(abi.encode(ALLOCATION_TYPEHASH, callsHash, uint256(0), deadline));
        bytes32 domain =
            keccak256(abi.encode(DOMAIN_TYPEHASH, NAME_HASH, VERSION_HASH, block.chainid, address(vault)));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domain, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(0xBEEF, digest);
        bytes memory sig = abi.encodePacked(r, s, v);

        vm.prank(keeper);
        vm.expectRevert(bytes("bad signature"));
        vault.rebalance(calls, deadline, sig);
    }

    function test_NonWhitelistedTargetReverts() public {
        DelegationVault.Call[] memory calls = new DelegationVault.Call[](1);
        calls[0] = DelegationVault.Call({
            target: address(0xDEAD),
            sellToken: address(0),
            sellAmount: 0,
            value: 0,
            data: ""
        });
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(calls, 0, deadline);

        vm.prank(keeper);
        vm.expectRevert(bytes("target not allowed"));
        vault.rebalance(calls, deadline, sig);
    }

    function test_ValueDropReverts() public {
        proto.setOutBps(9_000); // 10% loss — beyond the 1% tolerance
        DelegationVault.Call[] memory calls = _supplyCall(FUND);
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(calls, 0, deadline);

        vm.prank(keeper);
        vm.expectRevert(bytes("value dropped"));
        vault.rebalance(calls, deadline, sig);
    }

    function test_ReplayReverts() public {
        DelegationVault.Call[] memory calls = _supplyCall(FUND);
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(calls, 0, deadline);

        vm.prank(keeper);
        vault.rebalance(calls, deadline, sig);

        // Same signature again: nonce has advanced, so the digest no longer matches.
        vm.prank(keeper);
        vm.expectRevert(bytes("bad signature"));
        vault.rebalance(calls, deadline, sig);
    }
}
