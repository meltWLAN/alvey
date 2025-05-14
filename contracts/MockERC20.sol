// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * @dev 用于测试的ERC20代币
 */
contract MockERC20 is ERC20 {
    uint8 private _decimals;

    /**
     * @dev 构造函数
     * @param name 代币名称
     * @param symbol 代币符号
     * @param decimalsValue 代币精度
     */
    constructor(string memory name, string memory symbol, uint8 decimalsValue) ERC20(name, symbol) {
        _decimals = decimalsValue;
        _mint(msg.sender, 1000000 * 10**decimalsValue); // 铸造100万代币作为初始供应
    }

    /**
     * @dev 铸造代币
     * @param to 接收地址
     * @param amount 金额
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @dev 重写decimals函数
     */
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
} 