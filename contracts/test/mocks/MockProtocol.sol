// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MockERC20} from "./MockERC20.sol";

/// @notice Stand-in yield protocol for guard tests and the testnet demo: pulls
/// `underlying` from the caller and mints a position token to `onBehalf`, and
/// redeems that position token 1:1 back to `underlying`. `outBps` lets a test
/// simulate value loss on the supply move (e.g. 9000 = give back only 90%).
contract MockProtocol {
    using SafeERC20 for IERC20;

    IERC20 public immutable underlying;
    MockERC20 public immutable posToken;
    uint256 public outBps = 10_000;

    constructor(IERC20 underlying_, MockERC20 posToken_) {
        underlying = underlying_;
        posToken = posToken_;
    }

    function setOutBps(uint256 b) external {
        outBps = b;
    }

    function supply(uint256 amount, address onBehalf) external {
        underlying.safeTransferFrom(msg.sender, address(this), amount);
        posToken.mint(onBehalf, (amount * outBps) / 10_000);
    }

    /// @notice Redeem `amount` of the position token 1:1 back to `underlying`.
    /// Pulls the position token from the caller (which the protocol keeps and can
    /// re-issue) and returns the underlying it took in at supply time. This is the
    /// leg that lets a rebalance move funds out of one protocol and into another.
    function withdraw(uint256 amount, address to) external {
        IERC20(address(posToken)).safeTransferFrom(msg.sender, address(this), amount);
        underlying.safeTransfer(to, amount);
    }
}
