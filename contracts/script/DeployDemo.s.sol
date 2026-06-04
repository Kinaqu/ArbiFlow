// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {VaultFactory} from "../src/VaultFactory.sol";
import {DelegationVault} from "../src/DelegationVault.sol";
import {MockERC20} from "../test/mocks/MockERC20.sol";
import {MockProtocol} from "../test/mocks/MockProtocol.sol";

/// @notice End-to-end demo on Arbitrum Sepolia: deploys the vault stack plus
/// THREE stand-in yield protocols (Aave / Compound / Morpho demo), then runs
/// deposit -> supply into protocol A -> rebalance A->B -> owner withdraw as real
/// on-chain transactions. The mock protocols stand in for the real markets wired
/// on mainnet; the same path is proven against the real Aave V3 pool in
/// test/RebalanceForkAave.t.sol. The three-protocol layout is what the in-app
/// testnet view uses to show funds moving between protocols.
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

    // Deployed pieces are kept in storage so run()'s frame stays shallow (the
    // alternative is a stack-too-deep with this many locals).
    uint256 backendPk;
    MockERC20 usdc;
    MockProtocol aave;
    MockERC20 posAave;
    MockProtocol compound;
    MockERC20 posComp;
    MockProtocol morpho;
    MockERC20 posMorpho;
    VaultFactory factory;
    DelegationVault vault;

    function run() external {
        uint256 deployerPk = vm.envUint("DEPLOYER_PK");
        // Demo backend signer. In production this key lives in the ArbiFlow
        // backend and signs every allocation; fine to default for a testnet demo.
        backendPk = vm.envOr("BACKEND_PK", uint256(0xA11CE));
        address deployer = vm.addr(deployerPk);

        vm.startBroadcast(deployerPk);
        _deploy(deployer, vm.addr(backendPk));
        _demo(deployer);
        vm.stopBroadcast();

        _log(deployer);
    }

    /// @dev Deploy the stable, three demo protocols, and the curated factory.
    function _deploy(address deployer, address backendSigner) internal {
        usdc = new MockERC20("USD Coin (ArbiFlow demo)", "afUSDC", 6);
        (aave, posAave) = _protocol("ArbiFlow aUSDC (Aave demo)", "af-aUSDC");
        (compound, posComp) = _protocol("ArbiFlow cUSDC (Compound demo)", "af-cUSDC");
        (morpho, posMorpho) = _protocol("ArbiFlow mUSDC (Morpho demo)", "af-mUSDC");

        // Admin = deployer, 1% max slippage. Every demo protocol is a whitelisted
        // target; every token is a priced asset valued by the rebalance invariant.
        factory = new VaultFactory(deployer, backendSigner, 100);
        factory.setAsset(address(usdc), true);
        factory.setPrice(address(usdc), 1e18);
        _curate(aave, posAave);
        _curate(compound, posComp);
        _curate(morpho, posMorpho);
    }

    /// @dev Deposit -> supply into Aave -> move Aave->Compound -> owner withdraw.
    function _demo(address deployer) internal {
        vault = DelegationVault(factory.createVault());
        vault.setKeeper(deployer);

        // Deposit: idle USDC -> vault.
        usdc.mint(deployer, FUND);
        usdc.approve(address(vault), FUND);
        vault.deposit(address(usdc), FUND);

        // Rebalance #1: backend-signed supply of the USDC into Aave (demo).
        DelegationVault.Call[] memory supplyA = new DelegationVault.Call[](1);
        supplyA[0] = _supply(aave, FUND);
        _runRebalance(supplyA);

        // Rebalance #2: move the position Aave -> Compound (withdraw, re-supply).
        // This is the cross-protocol move the in-app testnet view animates.
        DelegationVault.Call[] memory move = new DelegationVault.Call[](2);
        move[0] = _withdraw(aave, posAave, FUND);
        move[1] = _supply(compound, FUND);
        _runRebalance(move);

        // Owner withdraw: pull the position out (non-custodial escape hatch).
        vault.withdraw(address(posComp), posComp.balanceOf(address(vault)), deployer);
    }

    function _protocol(string memory name, string memory symbol)
        internal
        returns (MockProtocol proto, MockERC20 pos)
    {
        pos = new MockERC20(name, symbol, 6);
        proto = new MockProtocol(usdc, pos);
    }

    function _curate(MockProtocol proto, MockERC20 pos) internal {
        factory.setTarget(address(proto), true);
        factory.setAsset(address(pos), true);
        factory.setPrice(address(pos), 1e18);
    }

    function _supply(MockProtocol proto, uint256 amount)
        internal
        view
        returns (DelegationVault.Call memory)
    {
        return DelegationVault.Call({
            target: address(proto),
            sellToken: address(usdc),
            sellAmount: amount,
            value: 0,
            data: abi.encodeCall(MockProtocol.supply, (amount, address(vault)))
        });
    }

    function _withdraw(MockProtocol proto, MockERC20 pos, uint256 amount)
        internal
        view
        returns (DelegationVault.Call memory)
    {
        return DelegationVault.Call({
            target: address(proto),
            sellToken: address(pos),
            sellAmount: amount,
            value: 0,
            data: abi.encodeCall(MockProtocol.withdraw, (amount, address(vault)))
        });
    }

    function _runRebalance(DelegationVault.Call[] memory calls) internal {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sign(calls, vault.nonce(), deadline);
        vault.rebalance(calls, deadline, sig);
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
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(backendPk, digest);
        return abi.encodePacked(r, s, v);
    }

    function _log(address deployer) internal view {
        console.log("=== ArbiFlow testnet demo (Arbitrum Sepolia) ===");
        console.log("factory        ", address(factory));
        console.log("vault          ", address(vault));
        console.log("usdc           ", address(usdc));
        console.log("aave proto     ", address(aave), " pos", address(posAave));
        console.log("compound proto ", address(compound), " pos", address(posComp));
        console.log("morpho proto   ", address(morpho), " pos", address(posMorpho));
        console.log("deployer/keeper", deployer);
        console.log("backendSigner  ", vm.addr(backendPk));
    }
}
