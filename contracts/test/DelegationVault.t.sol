// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {VaultFactory} from "../src/VaultFactory.sol";
import {DelegationVault} from "../src/DelegationVault.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract DelegationVaultTest is Test {
    VaultFactory factory;
    MockERC20 usdc;
    DelegationVault vault;

    address admin = address(0xA11CE);
    address user = address(0xB0B);
    address keeper = address(0xC0FFEE);
    address stranger = address(0xBAD);
    address backendSigner = address(0x5169);

    uint256 constant AMT = 1_000e6;

    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC", 6);
        factory = new VaultFactory(admin, backendSigner, 100); // 1% max slippage

        vm.prank(admin);
        factory.setAsset(address(usdc), true);

        vm.prank(user);
        vault = DelegationVault(factory.createVault());

        usdc.mint(user, AMT);
    }

    function _deposit(uint256 amt) internal {
        vm.startPrank(user);
        usdc.approve(address(vault), amt);
        vault.deposit(address(usdc), amt);
        vm.stopPrank();
    }

    function test_PredictMatchesCreated() public view {
        assertEq(factory.predictVault(user), address(vault));
    }

    function test_OwnerAndConfigSet() public view {
        assertEq(vault.owner(), user);
        assertEq(address(vault.config()), address(factory));
    }

    function test_DepositPullsTokens() public {
        _deposit(AMT);
        assertEq(usdc.balanceOf(address(vault)), AMT);
        assertEq(usdc.balanceOf(user), 0);
    }

    function test_DepositRevertsIfAssetNotAllowed() public {
        MockERC20 other = new MockERC20("Other", "OTH", 18);
        other.mint(user, 1e18);
        vm.startPrank(user);
        other.approve(address(vault), 1e18);
        vm.expectRevert(bytes("asset not allowed"));
        vault.deposit(address(other), 1e18);
        vm.stopPrank();
    }

    function test_OwnerWithdraw() public {
        _deposit(AMT);
        vm.prank(user);
        vault.withdraw(address(usdc), AMT, user);
        assertEq(usdc.balanceOf(user), AMT);
        assertEq(usdc.balanceOf(address(vault)), 0);
    }

    function test_StrangerCannotWithdraw() public {
        _deposit(AMT);
        vm.prank(stranger);
        vm.expectRevert(bytes("not owner"));
        vault.withdraw(address(usdc), AMT, stranger);
    }

    function test_KeeperCannotWithdraw() public {
        _deposit(AMT);
        vm.prank(user);
        vault.setKeeper(keeper);
        vm.prank(keeper);
        vm.expectRevert(bytes("not owner"));
        vault.withdraw(address(usdc), AMT, keeper);
    }

    function test_SetKeeperOnlyOwnerAndRevocable() public {
        vm.prank(stranger);
        vm.expectRevert(bytes("not owner"));
        vault.setKeeper(keeper);

        vm.prank(user);
        vault.setKeeper(keeper);
        assertEq(vault.keeper(), keeper);

        vm.prank(user);
        vault.setKeeper(address(0));
        assertEq(vault.keeper(), address(0));
    }

    function test_EmergencyWithdrawSweeps() public {
        _deposit(AMT);
        address[] memory toks = new address[](1);
        toks[0] = address(usdc);
        vm.prank(user);
        vault.emergencyWithdraw(toks, user);
        assertEq(usdc.balanceOf(user), AMT);
        assertEq(usdc.balanceOf(address(vault)), 0);
    }

    function test_CannotCreateTwice() public {
        vm.prank(user);
        vm.expectRevert(bytes("vault exists"));
        factory.createVault();
    }

    function test_CannotReinitializeClone() public {
        vm.expectRevert(); // OZ Initializable: InvalidInitialization()
        vault.initialize(stranger, address(factory));
    }
}
