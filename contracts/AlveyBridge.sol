// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AlveyBridge
 * @dev 实现基本的跨链桥功能，支持代币跨链转移
 */
contract AlveyBridge is ReentrancyGuard, Ownable, Pausable {
    // 事件
    event ChainAdded(address indexed token, uint256 indexed chainId);
    event ChainRemoved(address indexed token, uint256 indexed chainId);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event BridgeInitiated(
        bytes32 indexed requestId,
        address indexed token,
        address indexed sender,
        address recipient,
        uint256 amount,
        uint256 sourceChainId,
        uint256 targetChainId
    );
    event BridgeCompleted(
        bytes32 indexed requestId,
        address indexed token,
        address indexed sender,
        address recipient,
        uint256 amount,
        uint256 sourceChainId,
        uint256 targetChainId
    );

    // 状态变量
    struct BridgeRequest {
        address token;
        address sender;
        address recipient;
        uint256 amount;
        uint256 sourceChainId;
        uint256 targetChainId;
        bool completed;
    }

    mapping(bytes32 => BridgeRequest) public bridgeRequests;
    mapping(address => bool) public supportedTokens;
    mapping(address => mapping(uint256 => bool)) public supportedChains;
    mapping(address => uint256) public userNonces;

    // 常量
    uint256 public constant MAX_BRIDGE_AMOUNT = 1000000 * 10**18; // 最大桥接金额
    uint256 public constant MIN_BRIDGE_AMOUNT = 10 * 10**18; // 最小桥接金额

    // 构造函数
    constructor() {
        // 初始化为合约部署者
    }

    // 添加支持的代币
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(!supportedTokens[token], "Token already supported");
        supportedTokens[token] = true;
        emit TokenAdded(token);
    }

    // 移除支持的代币
    function removeSupportedToken(address token) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }

    // 添加支持的链
    function addSupportedChain(address token, uint256 chainId) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        require(chainId != block.chainid, "Cannot add current chain");
        require(!supportedChains[token][chainId], "Chain already supported for token");
        supportedChains[token][chainId] = true;
        emit ChainAdded(token, chainId);
    }

    // 移除支持的链
    function removeSupportedChain(address token, uint256 chainId) external onlyOwner {
        require(supportedChains[token][chainId], "Chain not supported for token");
        supportedChains[token][chainId] = false;
        emit ChainRemoved(token, chainId);
    }

    // 暂停合约
    function pause() external onlyOwner {
        _pause();
    }

    // 恢复合约
    function unpause() external onlyOwner {
        _unpause();
    }

    // 发起跨链请求
    function bridge(
        address token,
        uint256 amount,
        uint256 targetChainId,
        address recipient
    ) external nonReentrant whenNotPaused returns (bytes32 requestId) {
        require(supportedTokens[token], "Token not supported for bridging");
        require(supportedChains[token][targetChainId], "Target chain not supported for token");
        require(amount >= MIN_BRIDGE_AMOUNT, "Amount too low");
        require(amount <= MAX_BRIDGE_AMOUNT, "Amount too high");
        require(recipient != address(0), "Invalid recipient address");

        // 传输代币到合约
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        // 生成唯一请求ID
        userNonces[msg.sender]++;
        requestId = keccak256(abi.encodePacked(msg.sender, userNonces[msg.sender], token, block.timestamp));

        // 存储请求
        bridgeRequests[requestId] = BridgeRequest({
            token: token,
            sender: msg.sender,
            recipient: recipient,
            amount: amount,
            sourceChainId: block.chainid,
            targetChainId: targetChainId,
            completed: false
        });

        emit BridgeInitiated(
            requestId,
            token,
            msg.sender,
            recipient,
            amount,
            block.chainid,
            targetChainId
        );

        return requestId;
    }

    // 完成跨链请求（由验证者调用）
    function completeBridge(
        bytes32 requestId,
        address token,
        address recipient,
        uint256 amount
    ) external onlyOwner nonReentrant {
        BridgeRequest storage request = bridgeRequests[requestId];
        require(request.token != address(0), "Bridge request not found");
        require(!request.completed, "Bridge request already completed");

        // 标记为已完成
        request.completed = true;

        // 传输代币到接收者
        IERC20(token).transfer(recipient, amount);

        emit BridgeCompleted(
            requestId,
            request.token,
            request.sender,
            recipient,
            amount,
            request.sourceChainId,
            request.targetChainId
        );
    }
}