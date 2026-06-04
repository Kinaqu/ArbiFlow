// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {VaultFactory} from "../src/VaultFactory.sol";
import {DelegationVault} from "../src/DelegationVault.sol";
import {MockERC20} from "../test/mocks/MockERC20.sol";
import {MockProtocol} from "../test/mocks/MockProtocol.sol";

/// @notice End-to-end demo on Arbitrum Sepolia: deploys the vault stack plus a
/// stand-in yield protocol, then runs deposit -> backend-signed rebalance ->
/// owner withdraw as real on-chain transactions. The mock protocol stands in
/// for the real markets (Aave/Compound/...) wired on mainnet; the same path is
/// proven against the real Aave V3 pool in test/RebalanceForkAave.t.sol.
///
/// Run (deployer key needs Arbitrum Sepolia ETH):
///   DEPLOYER_PK=0x... ARBITRUM_SEPOLIA_RPC_URL=... \
///     forge script script/DeployDemo.s.sol --rpc-url arbitrum_sepolia --broadcast
contract DeployDemo is Script {
    bytes32 constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 constant ALLOCATION_TYPEHASH =
        keccak256("Allocation(bytes32 callsHash,uint256 nonce,uint256 deadline)");
    bytes32 constant NAME_HASH = keccak256(bytes("ArbiFlowDelegationVault"));
    bytes32 constant VERSION_HASH = keccak256(bytes("1"));

    uint256 constant FUND = 1_000e6;

    function run() external {
        uint256 deployerPk = vm.envUint("DEPLOYER_PK");
        // Demo backend signer. In production this key lives in the ArbiFlow
        // backend and signs every allocation; fine to default for a testnet demo.
        uint256 backendPk = vm.envOr("BACKEND_PK", uint256(0xA11CE));
        address deployer = vm.addr(deployerPk);
        address backendSigner = vm.addr(backendPk);

        vm.startBroadcast(deployerPk);

        // 1. Demo tokens + stand-in yield protocol.
        MockERC20 usdc = new MockERC20("USD Coin (ArbiFlow demo)", "afUSDC", 6);
        MockERC20 pos = new MockERC20("ArbiFlow aUSDC", "af-aUSDC", 6);
        MockProtocol proto = new MockProtocol(usdc, pos);

        // 2. Vault factory (admin = deployer, 1% max slippage) + curated config.
        VaultFactory factory = new VaultFactory(deployer, backendSigner, 100);
        factory.setAsset(address(usdc), true);
        factory.setAsset(address(pos), true);
        factory.setTarget(address(proto), true);
        factory.setPrice(address(usdc), 1e18);
        factory.setPrice(address(pos), 1e18);

        // 3. Per-user vault; deployer doubles as the demo keeper.
        DelegationVault vault = DelegationVault(factory.createVault());
        vault.setKeeper(deployer);

        // 4. Deposit: idle USDC -> vault.
        usdc.mint(deployer, FUND);
        usdc.approve(address(vault), FUND);
        vault.deposit(address(usdc), FUND);

        // 5. Rebalance: backend-signed supply of the USDC into the protocol.
        DelegationVault.Call[] memory calls = new DelegationVault.Call[](1);
        calls[0] = DelegationVault.Call({
            target: address(proto),
            sellToken: address(usdc),
            sellAmount: FUND,
            value: 0,
            data: abi.encodeCall(MockProtocol.supply, (FUND, address(vault)))
        });
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(backendPk, address(vault), calls, vault.nonce(), deadline);
        vault.rebalance(calls, deadline, sig);

        // 6. Owner withdraw: pull the position out (non-custodial escape hatch).
        uint256 posBal = pos.balanceOf(address(vault));
        vault.withdraw(address(pos), posBal, deployer);

        vm.stopBroadcast();

        console.log("=== ArbiFlow testnet demo (Arbitrum Sepolia) ===");
        console.log("factory        ", address(factory));
        console.log("vault          ", address(vault));
        console.log("usdc           ", address(usdc));
        console.log("posToken       ", address(pos));
        console.log("protocol       ", address(proto));
        console.log("deployer/keeper", deployer);
        console.log("backendSigner  ", backendSigner);
    }

    function _sign(uint256 pk, address vaultAddr, DelegationVault.Call[] memory calls, uint256 nonce_, uint256 deadline)
        internal
        view
        returns (bytes memory)
    {
        bytes32 callsHash = keccak256(abi.encode(calls));
        bytes32 structHash = keccak256(abi.encode(ALLOCATION_TYPEHASH, callsHash, nonce_, deadline));
        bytes32 domain = keccak256(abi.encode(DOMAIN_TYPEHASH, NAME_HASH, VERSION_HASH, block.chainid, vaultAddr));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domain, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, digest);
        return abi.encodePacked(r, s, v);
    }
}
