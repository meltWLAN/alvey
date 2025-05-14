// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MetaverseXNFT.sol";

/**
 * @title MetaverseXFactory
 * @dev 允许创建和管理MetaverseX NFT集合的工厂合约
 */
contract MetaverseXFactory is Ownable, ReentrancyGuard {
    // 事件
    event CollectionCreated(address indexed creator, address indexed collection, string name, string symbol);
    event CollectionRegistered(address indexed collection, string name);
    event CollectionDeregistered(address indexed collection);
    event RegistrationFeeUpdated(uint256 newFee);
    event PaymentTokenUpdated(address newToken);

    // 集合信息
    struct CollectionInfo {
        string name;
        address creator;
        uint256 creationTime;
        bool registered;
    }

    // 状态变量
    mapping(address => CollectionInfo) public collections;
    address[] public collectionAddresses;
    
    uint256 public registrationFee = 1000 * 10**18; // 注册费用
    IERC20 public paymentToken; // 支付代币

    constructor(address _paymentToken) {
        require(_paymentToken != address(0), "Invalid payment token");
        paymentToken = IERC20(_paymentToken);
    }

    /**
     * @dev 创建新的NFT集合
     * @param name 集合名称
     * @param symbol 集合符号
     * @param register 是否立即注册（需支付费用）
     */
    function createCollection(
        string memory name,
        string memory symbol,
        bool register
    ) external nonReentrant returns (address) {
        // 创建新的MetaverseXNFT合约
        MetaverseXNFT newCollection = new MetaverseXNFT(address(paymentToken));
        
        // 转移所有权给创建者
        newCollection.transferOwnership(msg.sender);
        
        // 记录集合信息
        collections[address(newCollection)] = CollectionInfo({
            name: name,
            creator: msg.sender,
            creationTime: block.timestamp,
            registered: false
        });
        
        collectionAddresses.push(address(newCollection));
        
        emit CollectionCreated(msg.sender, address(newCollection), name, symbol);
        
        // 如果选择立即注册，则执行注册流程
        if (register) {
            _registerCollection(address(newCollection), name);
        }
        
        return address(newCollection);
    }

    /**
     * @dev 注册现有集合
     * @param collection 集合地址
     * @param name 集合名称
     */
    function registerCollection(address collection, string memory name) external nonReentrant {
        require(collection != address(0), "Invalid collection address");
        require(!collections[collection].registered, "Collection already registered");
        
        // 如果集合尚未记录，则添加记录
        if (collections[collection].creator == address(0)) {
            collections[collection] = CollectionInfo({
                name: name,
                creator: msg.sender,
                creationTime: block.timestamp,
                registered: false
            });
            
            collectionAddresses.push(collection);
        }
        
        _registerCollection(collection, name);
    }
    
    /**
     * @dev 内部注册集合函数
     * @param collection 集合地址
     * @param name 集合名称
     */
    function _registerCollection(address collection, string memory name) internal {
        // 转移注册费用
        bool success = paymentToken.transferFrom(msg.sender, address(this), registrationFee);
        require(success, "Registration fee transfer failed");
        
        // 更新注册状态
        collections[collection].registered = true;
        
        emit CollectionRegistered(collection, name);
    }
    
    /**
     * @dev 取消注册集合
     * @param collection 集合地址
     */
    function deregisterCollection(address collection) external onlyOwner {
        require(collections[collection].registered, "Collection not registered");
        
        collections[collection].registered = false;
        
        emit CollectionDeregistered(collection);
    }
    
    /**
     * @dev 设置注册费用
     * @param newFee 新费用
     */
    function setRegistrationFee(uint256 newFee) external onlyOwner {
        registrationFee = newFee;
        emit RegistrationFeeUpdated(newFee);
    }
    
    /**
     * @dev 设置支付代币
     * @param newToken 新代币地址
     */
    function setPaymentToken(address newToken) external onlyOwner {
        require(newToken != address(0), "Invalid token address");
        paymentToken = IERC20(newToken);
        emit PaymentTokenUpdated(newToken);
    }
    
    /**
     * @dev 提取合约中的代币
     */
    function withdrawTokens() external onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        bool success = paymentToken.transfer(owner(), balance);
        require(success, "Transfer failed");
    }
    
    /**
     * @dev 获取所有集合的数量
     */
    function getCollectionsCount() external view returns (uint256) {
        return collectionAddresses.length;
    }
    
    /**
     * @dev 获取分页集合列表
     * @param offset 起始索引
     * @param limit 限制数量
     */
    function getCollections(uint256 offset, uint256 limit) external view returns (
        address[] memory addresses,
        string[] memory names,
        address[] memory creators,
        uint256[] memory creationTimes,
        bool[] memory registrationStatus
    ) {
        uint256 totalCount = collectionAddresses.length;
        
        if (offset >= totalCount) {
            return (new address[](0), new string[](0), new address[](0), new uint256[](0), new bool[](0));
        }
        
        uint256 count = limit;
        if (offset + limit > totalCount) {
            count = totalCount - offset;
        }
        
        addresses = new address[](count);
        names = new string[](count);
        creators = new address[](count);
        creationTimes = new uint256[](count);
        registrationStatus = new bool[](count);
        
        for (uint256 i = 0; i < count; i++) {
            address collectionAddress = collectionAddresses[offset + i];
            CollectionInfo memory info = collections[collectionAddress];
            
            addresses[i] = collectionAddress;
            names[i] = info.name;
            creators[i] = info.creator;
            creationTimes[i] = info.creationTime;
            registrationStatus[i] = info.registered;
        }
        
        return (addresses, names, creators, creationTimes, registrationStatus);
    }
    
    /**
     * @dev 检查集合是否已注册
     * @param collection 集合地址
     */
    function isRegistered(address collection) external view returns (bool) {
        return collections[collection].registered;
    }
    
    /**
     * @dev 获取集合信息
     * @param collection 集合地址
     */
    function getCollectionInfo(address collection) external view returns (
        string memory name,
        address creator,
        uint256 creationTime,
        bool registered
    ) {
        CollectionInfo memory info = collections[collection];
        return (info.name, info.creator, info.creationTime, info.registered);
    }
    
    /**
     * @dev 修改集合名称（仅创建者或管理员）
     * @param collection 集合地址
     * @param newName 新名称
     */
    function updateCollectionName(address collection, string memory newName) external {
        require(
            collections[collection].creator == msg.sender || owner() == msg.sender,
            "Not creator or owner"
        );
        
        collections[collection].name = newName;
    }
}