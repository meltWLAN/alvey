// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockERC20
 * @dev 用于测试的ERC20代币
 */
contract MockERC20 is ERC20, Ownable {
    uint8 private _decimals;

    /**
     * @dev 构造函数
     * @param name 代币名称
     * @param symbol 代币符号
     * @param decimalsValue 代币精度
     */
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimalsValue
    ) ERC20(name, symbol) {
        _decimals = decimalsValue;
    }
    
    /**
     * @dev 铸造代币
     * @param to 接收者地址
     * @param amount 铸造数量
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev 销毁代币
     * @param from 销毁者地址
     * @param amount 销毁数量
     */
    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }

    /**
     * @dev 重写decimals函数
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
} 