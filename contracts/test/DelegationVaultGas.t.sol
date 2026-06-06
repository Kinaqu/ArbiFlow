// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {VaultFactory} from "../src/VaultFactory.sol";
import {DelegationVault} from "../src/DelegationVault.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {MockProtocol} from "./mocks/MockProtocol.sol";

/// @notice The per-vault ETH gas reserve: funding via receive(), the keeper being
/// reimbursed (capped at the reserve, never reverting) on each rebalance, and the
/// owner reclaiming unused ETH via withdrawEth / emergencyWithdraw.
contract DelegationVaultGasTest is Test {
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
    address stranger = address(0xBAD);

    uint256 constant FUND = 1_000e6;

    event GasFunded(address indexed from, uint256 amount);

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
        vault = DelegationVault(payable(factory.createVault()));
        vm.prank(user);
        vault.setKeeper(keeper);

        usdc.mint(address(vault), FUND);
        vm.deal(address(this), 10 ether); // bankroll the gas-reserve transfers
    }

    function _fundReserve(uint256 amount) internal {
        (bool ok,) = address(vault).call{value: amount}("");
        require(ok, "fund failed");
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

    /// Keeper-signed supply of the vault's USDC into the demo protocol.
    function _rebalanceSupply() internal {
        DelegationVault.Call[] memory calls = _supplyCall(FUND);
        vm.prank(keeper);
        vault.rebalance(calls, block.timestamp + 1 hours, _sign(calls, 0, block.timestamp + 1 hours));
    }

    function test_ReceiveFundsReserveAndEmits() public {
        vm.expectEmit(true, false, false, true, address(vault));
        emit GasFunded(address(this), 0.02 ether);
        _fundReserve(0.02 ether);
        assertEq(address(vault).balance, 0.02 ether);
    }

    function test_RebalanceReimbursesKeeperFromReserve() public {
        uint256 reserve = 0.05 ether;
        _fundReserve(reserve);
        vm.txGasPrice(1 gwei);

        _rebalanceSupply();

        uint256 paid = keeper.balance; // started at 0
        assertGt(paid, 0, "keeper reimbursed");
        assertLt(paid, reserve, "reimburse stays below the reserve");
        assertEq(address(vault).balance, reserve - paid, "vault reserve drawn down by exactly the payout");
        assertEq(pos.balanceOf(address(vault)), FUND, "the move still executed");
    }

    function test_ReimburseCappedAtReserve() public {
        uint256 tiny = 1000 wei; // far less than one rebalance's gas
        _fundReserve(tiny);
        vm.txGasPrice(1 gwei);

        _rebalanceSupply();

        assertEq(address(vault).balance, 0, "reserve fully drawn, never reverts");
        assertEq(keeper.balance, tiny, "keeper paid exactly the capped reserve");
    }

    function test_NoReimburseAtZeroGasPrice() public {
        uint256 reserve = 0.05 ether;
        _fundReserve(reserve);
        // tx.gasprice defaults to 0 → spent is 0 → nothing is paid (so the
        // existing rebalance tests, which never fund ETH, are unaffected).
        _rebalanceSupply();
        assertEq(address(vault).balance, reserve, "reserve untouched");
        assertEq(keeper.balance, 0, "no reimbursement");
    }

    function test_OwnerWithdrawEth() public {
        _fundReserve(0.03 ether);
        vm.prank(user);
        vault.withdrawEth(0.03 ether, user);
        assertEq(user.balance, 0.03 ether, "owner reclaimed the reserve");
        assertEq(address(vault).balance, 0);
    }

    function test_WithdrawEthOnlyOwner() public {
        _fundReserve(0.03 ether);
        vm.prank(stranger);
        vm.expectRevert(bytes("not owner"));
        vault.withdrawEth(0.01 ether, stranger);
    }

    function test_EmergencyWithdrawSweepsEthToo() public {
        _fundReserve(0.04 ether);
        address[] memory toks = new address[](1);
        toks[0] = address(usdc);
        vm.prank(user);
        vault.emergencyWithdraw(toks, user);
        assertEq(usdc.balanceOf(user), FUND, "tokens swept");
        assertEq(user.balance, 0.04 ether, "leftover ETH swept");
        assertEq(address(vault).balance, 0);
    }
}
