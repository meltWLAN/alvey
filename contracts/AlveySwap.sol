// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title AlveySwap
 * @dev 实现基本的AMM功能，包括添加/移除流动性、交换代币
 */
contract AlveySwap is ReentrancyGuard, Ownable {
    using Math for uint256;

    // 事件
    event Swap(
        address indexed sender,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    event AddLiquidity(
        address indexed provider,
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountA,
        uint256 amountB
    );
    event RemoveLiquidity(
        address indexed provider,
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountA,
        uint256 amountB
    );
    event FeeCollected(uint256 amount);

    // 常量
    uint256 public constant FEE_RATE = 3; // 0.3% 交易手续费
    uint256 public constant FEE_DENOMINATOR = 1000;
    uint256 public constant MINIMUM_LIQUIDITY = 10**3; // 最低流动性要求

    // 交易对结构体
    struct Pair {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalSupply;
    }

    // 状态变量
    mapping(bytes32 => Pair) public pairs;
    mapping(address => mapping(address => bytes32)) public pairKeys;
    mapping(address => bool) public supportedTokens;

    // 构造函数
    constructor() {
        // 初始化
    }

    // 添加支持的代币
    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    // 创建交易对
    function createPair(address tokenA, address tokenB) external onlyOwner {
        require(tokenA != tokenB, "identical addresses");
        require(tokenA != address(0) && tokenB != address(0), "zero address");
        require(pairKeys[tokenA][tokenB] == bytes32(0), "pair exists");

        bytes32 pairKey = keccak256(abi.encodePacked(tokenA, tokenB));
        
        // 创建Pair结构体
        Pair storage newPair = pairs[pairKey];
        newPair.tokenA = tokenA;
        newPair.tokenB = tokenB;
        newPair.reserveA = 0;
        newPair.reserveB = 0;
        newPair.totalSupply = 0;
        
        // 设置双向映射
        pairKeys[tokenA][tokenB] = pairKey;
        pairKeys[tokenB][tokenA] = pairKey;
    }

    // 添加流动性
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant returns (uint256 liquidity) {
        bytes32 pairKey = pairKeys[tokenA][tokenB];
        require(pairKey != bytes32(0), "pair not exists");

        Pair storage pair = pairs[pairKey];
        
        // 转移代币到合约
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountB);

        // 更新储备
        pair.reserveA += amountA;
        pair.reserveB += amountB;

        // 计算流动性代币数量
        uint256 _totalSupply = pair.totalSupply;
        if (_totalSupply == 0) {
            liquidity = sqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
            pair.totalSupply = MINIMUM_LIQUIDITY; // 永久锁定最小流动性
        } else {
            liquidity = min(
                (amountA * _totalSupply) / pair.reserveA,
                (amountB * _totalSupply) / pair.reserveB
            );
        }

        require(liquidity > 0, "insufficient liquidity minted");
        pair.totalSupply += liquidity;

        emit AddLiquidity(msg.sender, tokenA, tokenB, amountA, amountB);
        return liquidity;
    }

    // 移除流动性
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        bytes32 pairKey = pairKeys[tokenA][tokenB];
        require(pairKey != bytes32(0), "pair not exists");

        Pair storage pair = pairs[pairKey];
        require(pair.totalSupply >= liquidity, "insufficient liquidity");

        // 计算应返还的代币数量
        amountA = (liquidity * pair.reserveA) / pair.totalSupply;
        amountB = (liquidity * pair.reserveB) / pair.totalSupply;
        require(amountA > 0 && amountB > 0, "insufficient liquidity burned");

        // 更新储备和流动性
        pair.totalSupply -= liquidity;
        pair.reserveA -= amountA;
        pair.reserveB -= amountB;

        // 转移代币给用户
        IERC20(tokenA).transfer(msg.sender, amountA);
        IERC20(tokenB).transfer(msg.sender, amountB);

        emit RemoveLiquidity(msg.sender, tokenA, tokenB, amountA, amountB);
        return (amountA, amountB);
    }

    // 交换代币
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external nonReentrant returns (uint256 amountOut) {
        require(tokenIn != tokenOut, "identical tokens");
        bytes32 pairKey = pairKeys[tokenIn][tokenOut];
        require(pairKey != bytes32(0), "pair not exists");

        Pair storage pair = pairs[pairKey];
        
        // 确定代币顺序和储备
        bool isTokenA = tokenIn == pair.tokenA;
        uint256 reserveIn = isTokenA ? pair.reserveA : pair.reserveB;
        uint256 reserveOut = isTokenA ? pair.reserveB : pair.reserveA;

        // 转移代币到合约
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        // 计算输出金额（考虑手续费）
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_RATE);
        amountOut = (amountInWithFee * reserveOut) / (reserveIn * FEE_DENOMINATOR + amountInWithFee);
        require(amountOut > 0, "insufficient output amount");

        // 更新储备
        if (isTokenA) {
            pair.reserveA += amountIn;
            pair.reserveB -= amountOut;
        } else {
            pair.reserveB += amountIn;
            pair.reserveA -= amountOut;
        }

        // 转移代币给用户
        IERC20(tokenOut).transfer(msg.sender, amountOut);

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
        return amountOut;
    }

    // 获取交易对储备
    function getReserves(address tokenA, address tokenB) external view returns (uint256 reserveA, uint256 reserveB) {
        bytes32 pairKey = pairKeys[tokenA][tokenB];
        require(pairKey != bytes32(0), "pair not exists");

        Pair storage pair = pairs[pairKey];
        return (pair.reserveA, pair.reserveB);
    }

    // 获取流动性平衡
    function getLiquidityBalance(address tokenA, address tokenB) external view returns (uint256) {
        bytes32 pairKey = pairKeys[tokenA][tokenB];
        if (pairKey == bytes32(0)) return 0;
        return pairs[pairKey].totalSupply;
    }

    // 计算平方根（Babylonian方法）
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    // 返回两个值中的较小值
    function min(uint256 x, uint256 y) internal pure returns (uint256) {
        return x < y ? x : y;
    }
}