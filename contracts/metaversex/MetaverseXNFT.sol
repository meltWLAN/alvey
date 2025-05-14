// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MetaverseXNFT
 * @dev 实现基于ERC721标准的元宇宙NFT，包含特殊的元数据和属性
 */
contract MetaverseXNFT is ERC721Enumerable, ERC721URIStorage, Ownable, Pausable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // NFT属性
    struct AssetMetadata {
        string assetType; // land, character, item, etc.
        uint256 rarity; // 1-5, 5 being the rarest
        uint256 level; // 升级级别
        bool transferable; // 是否可转让
        uint256 creationTime; // 创建时间
    }
    
    mapping(uint256 => AssetMetadata) private _assetMetadata;
    mapping(address => uint256) public mintedPerAddress;
    
    // 铸造限制
    uint256 public maxMintPerAddress = 20;
    uint256 public maxTotalSupply = 50000;
    
    // 铸造费用
    uint256 public mintPrice = 100 * 10**18;
    IERC20 public paymentToken;
    
    // 事件
    event AssetMinted(address indexed owner, uint256 tokenId, string assetType, uint256 rarity);
    event AssetMetadataUpdated(uint256 tokenId, string assetType, uint256 rarity, uint256 level);
    event MintPriceUpdated(uint256 newPrice);
    event PaymentTokenUpdated(address newToken);
    
    constructor(address _paymentToken) ERC721("MetaverseX NFT", "MVXNFT") {
        require(_paymentToken != address(0), "Invalid payment token");
        paymentToken = IERC20(_paymentToken);
    }
    
    /**
     * @dev 铸造新的元宇宙资产NFT
     */
    function mintAsset(
        string memory uri,
        string memory assetType,
        uint256 rarity
    ) public whenNotPaused returns (uint256) {
        require(mintedPerAddress[msg.sender] < maxMintPerAddress, "Exceeds max mint per address");
        require(_tokenIds.current() < maxTotalSupply, "Exceeds max total supply");
        require(rarity >= 1 && rarity <= 5, "Rarity must be between 1 and 5");
        
        // 支付铸造费用
        bool success = paymentToken.transferFrom(msg.sender, address(this), mintPrice);
        require(success, "Payment failed");
        
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        
        // 铸造NFT
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        
        // 设置元数据
        _assetMetadata[tokenId] = AssetMetadata({
            assetType: assetType,
            rarity: rarity,
            level: 1,
            transferable: true,
            creationTime: block.timestamp
        });
        
        mintedPerAddress[msg.sender]++;
        
        emit AssetMinted(msg.sender, tokenId, assetType, rarity);
        
        return tokenId;
    }
    
    /**
     * @dev 批量铸造NFT资产
     */
    function batchMintAssets(
        string[] memory uris,
        string[] memory assetTypes,
        uint256[] memory rarities
    ) public whenNotPaused returns (uint256[] memory) {
        require(uris.length == assetTypes.length && uris.length == rarities.length, "Arrays length mismatch");
        require(uris.length > 0 && uris.length <= 10, "Invalid batch size");
        require(mintedPerAddress[msg.sender] + uris.length <= maxMintPerAddress, "Exceeds max mint per address");
        require(_tokenIds.current() + uris.length <= maxTotalSupply, "Exceeds max total supply");
        
        // 支付铸造费用
        uint256 totalCost = mintPrice * uris.length;
        bool success = paymentToken.transferFrom(msg.sender, address(this), totalCost);
        require(success, "Payment failed");
        
        uint256[] memory tokenIds = new uint256[](uris.length);
        
        for (uint256 i = 0; i < uris.length; i++) {
            require(rarities[i] >= 1 && rarities[i] <= 5, "Rarity must be between 1 and 5");
            
            _tokenIds.increment();
            uint256 tokenId = _tokenIds.current();
            tokenIds[i] = tokenId;
            
            // 铸造NFT
            _safeMint(msg.sender, tokenId);
            _setTokenURI(tokenId, uris[i]);
            
            // 设置元数据
            _assetMetadata[tokenId] = AssetMetadata({
                assetType: assetTypes[i],
                rarity: rarities[i],
                level: 1,
                transferable: true,
                creationTime: block.timestamp
            });
            
            emit AssetMinted(msg.sender, tokenId, assetTypes[i], rarities[i]);
        }
        
        mintedPerAddress[msg.sender] += uris.length;
        
        return tokenIds;
    }
    
    /**
     * @dev 更新资产元数据（仅限所有者）
     */
    function updateAssetMetadata(
        uint256 tokenId,
        string memory assetType,
        uint256 rarity,
        uint256 level,
        bool transferable
    ) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not approved or owner");
        require(rarity >= 1 && rarity <= 5, "Rarity must be between 1 and 5");
        
        AssetMetadata storage metadata = _assetMetadata[tokenId];
        metadata.assetType = assetType;
        metadata.rarity = rarity;
        metadata.level = level;
        metadata.transferable = transferable;
        
        emit AssetMetadataUpdated(tokenId, assetType, rarity, level);
    }
    
    /**
     * @dev 获取资产元数据
     */
    function getAssetMetadata(uint256 tokenId) public view returns (
        string memory assetType,
        uint256 rarity,
        uint256 level,
        bool transferable,
        uint256 creationTime
    ) {
        require(_exists(tokenId), "Token does not exist");
        AssetMetadata memory metadata = _assetMetadata[tokenId];
        return (
            metadata.assetType,
            metadata.rarity,
            metadata.level,
            metadata.transferable,
            metadata.creationTime
        );
    }
    
    /**
     * @dev 设置铸造价格
     */
    function setMintPrice(uint256 _price) public onlyOwner {
        mintPrice = _price;
        emit MintPriceUpdated(_price);
    }
    
    /**
     * @dev 设置支付代币
     */
    function setPaymentToken(address _token) public onlyOwner {
        require(_token != address(0), "Invalid token address");
        paymentToken = IERC20(_token);
        emit PaymentTokenUpdated(_token);
    }
    
    /**
     * @dev 设置每地址最大铸造数量
     */
    function setMaxMintPerAddress(uint256 _limit) public onlyOwner {
        maxMintPerAddress = _limit;
    }
    
    /**
     * @dev 设置最大总供应量
     */
    function setMaxTotalSupply(uint256 _limit) public onlyOwner {
        require(_limit >= _tokenIds.current(), "New limit must be >= current supply");
        maxTotalSupply = _limit;
    }
    
    /**
     * @dev 提取合约中的代币（仅限所有者）
     */
    function withdrawTokens() public onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        bool success = paymentToken.transfer(owner(), balance);
        require(success, "Transfer failed");
    }
    
    /**
     * @dev 暂停合约
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @dev 当前总供应量
     */
    function totalSupply() public view override returns (uint256) {
        return _tokenIds.current();
    }
    
    // 重写必要的函数以解决继承冲突
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        delete _assetMetadata[tokenId];
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }  
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 