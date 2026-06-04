// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MockERC20} from "./MockERC20.sol";

/// @notice Stand-in yield protocol for guard tests: pulls `underlying` from the
/// caller and mints a position token to `onBehalf`. `outBps` lets a test
/// simulate value loss on the move (e.g. 9000 = give back only 90%).
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
}
