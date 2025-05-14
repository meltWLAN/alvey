// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AlveyIndex
 * @dev 实现基本的指数基金功能，包括投资组合管理和份额交易
 */
contract AlveyIndex is ReentrancyGuard, Ownable, Pausable {
    // 事件
    event TokenAdded(address indexed token, uint256 weight);
    event TokenRemoved(address indexed token);
    event WeightUpdated(address indexed token, uint256 newWeight);
    event Invested(address indexed user, uint256 amount, uint256 shares);
    event Redeemed(address indexed user, uint256 shares, uint256 amount);
    event Rebalanced(address indexed token, uint256 oldWeight, uint256 newWeight);

    // 状态变量
    struct TokenInfo {
        uint256 weight; // 权重（百分比，总和为100）
        uint256 balance; // 当前余额
    }

    struct UserInfo {
        uint256 shares; // 用户持有的份额
        uint256 lastUpdateTime; // 最后更新时间
    }

    mapping(address => TokenInfo) public tokens;
    mapping(address => UserInfo) public users;
    address[] public tokenList;
    uint256 public totalShares;
    uint256 public constant WEIGHT_BASE = 10000; // 权重基数（100% = 10000）
    uint256 public minInvestment = 0.01 ether; // 最小投资金额
    uint256 public lockPeriod = 1 days; // 锁定期

    // 构造函数
    constructor() {
        // 初始化为合约部署者
    }

    // 添加代币
    function addToken(address token, uint256 weight) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(weight > 0, "Weight must be positive");
        require(tokens[token].weight == 0, "Token already added");

        tokens[token] = TokenInfo({
            weight: weight,
            balance: 0
        });
        tokenList.push(token);

        emit TokenAdded(token, weight);
    }

    // 移除代币
    function removeToken(address token) external onlyOwner {
        require(tokens[token].weight > 0, "Token not found");
        require(tokens[token].balance == 0, "Token balance not zero");

        // 从列表中移除
        for (uint i = 0; i < tokenList.length; i++) {
            if (tokenList[i] == token) {
                tokenList[i] = tokenList[tokenList.length - 1];
                tokenList.pop();
                break;
            }
        }

        delete tokens[token];
        emit TokenRemoved(token);
    }

    // 更新权重
    function updateWeight(address token, uint256 newWeight) external onlyOwner {
        require(tokens[token].weight > 0, "Token not found");
        require(newWeight > 0, "Weight must be positive");
        
        uint256 oldWeight = tokens[token].weight;
        tokens[token].weight = newWeight;
        
        emit WeightUpdated(token, newWeight);
        emit Rebalanced(token, oldWeight, newWeight);
    }

    // 暂停合约
    function pause() external onlyOwner {
        _pause();
    }

    // 恢复合约
    function unpause() external onlyOwner {
        _unpause();
    }

    // 投资
    function invest() external payable nonReentrant whenNotPaused returns (uint256 shares) {
        require(msg.value >= minInvestment, "Investment too small");
        require(tokenList.length > 0, "No tokens in index");

        uint256 amount = msg.value;
        
        // 计算份额
        if (totalShares == 0) {
            shares = amount;
        } else {
            uint256 totalValue = getTotalValue();
            shares = (amount * totalShares) / totalValue;
        }
        
        // 分配资金到各代币
        for (uint i = 0; i < tokenList.length; i++) {
            address token = tokenList[i];
            uint256 tokenAmount = (amount * tokens[token].weight) / WEIGHT_BASE;
            
            // 购买代币（在实际环境中需与DEX交互）
            // 这里简化处理，实际可能需要兑换ETH为相应代币
            tokens[token].balance += tokenAmount;
        }
        
        // 更新用户信息
        users[msg.sender].shares += shares;
        users[msg.sender].lastUpdateTime = block.timestamp;
        totalShares += shares;
        
        emit Invested(msg.sender, amount, shares);
        return shares;
    }

    // 赎回
    function redeem(uint256 sharesToRedeem) external nonReentrant returns (uint256 amount) {
        UserInfo storage user = users[msg.sender];
        require(user.shares >= sharesToRedeem, "Insufficient shares");
        require(block.timestamp >= user.lastUpdateTime + lockPeriod, "Still in lock period");
        
        // 计算赎回金额
        uint256 totalValue = getTotalValue();
        amount = (sharesToRedeem * totalValue) / totalShares;
        
        // 更新用户信息
        user.shares -= sharesToRedeem;
        totalShares -= sharesToRedeem;
        
        // 按比例从各代币中赎回
        for (uint i = 0; i < tokenList.length; i++) {
            address token = tokenList[i];
            uint256 tokenAmount = (tokens[token].balance * sharesToRedeem) / (totalShares + sharesToRedeem);
            tokens[token].balance -= tokenAmount;
            
            // 将代币转换回ETH并发送给用户（实际环境中需与DEX交互）
            // 这里简化处理
        }
        
        // 向用户发送ETH
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");
        
        emit Redeemed(msg.sender, sharesToRedeem, amount);
        return amount;
    }

    // 再平衡
    function rebalance() external onlyOwner {
        require(tokenList.length > 0, "No tokens in index");
        
        uint256 totalValue = getTotalValue();
        require(totalValue > 0, "Total value is zero");
        
        for (uint i = 0; i < tokenList.length; i++) {
            address token = tokenList[i];
            uint256 targetValue = (totalValue * tokens[token].weight) / WEIGHT_BASE;
            uint256 currentValue = tokens[token].balance;
            
            if (targetValue != currentValue) {
                // 调整代币持仓（在实际环境中需与DEX交互）
                tokens[token].balance = targetValue;
                
                emit Rebalanced(token, currentValue, targetValue);
            }
        }
    }

    // 获取代币列表
    function getTokens() external view returns (address[] memory) {
        return tokenList;
    }

    // 获取用户信息
    function getUserInfo(address user) external view returns (uint256 shares, uint256 lastUpdateTime) {
        UserInfo storage info = users[user];
        return (info.shares, info.lastUpdateTime);
    }

    // 获取代币信息
    function getTokenInfo(address token) external view returns (uint256 weight, uint256 balance) {
        TokenInfo storage info = tokens[token];
        return (info.weight, info.balance);
    }

    // 获取总份额
    function getTotalShares() external view returns (uint256) {
        return totalShares;
    }

    // 获取锁定期
    function getLockPeriod() external view returns (uint256) {
        return lockPeriod;
    }

    // 获取最小投资额
    function getMinInvestment() external view returns (uint256) {
        return minInvestment;
    }

    // 获取总价值
    function getTotalValue() public view returns (uint256) {
        uint256 total = 0;
        for (uint i = 0; i < tokenList.length; i++) {
            total += tokens[tokenList[i]].balance;
        }
        return total;
    }

    // 接收ETH
    receive() external payable {}
}