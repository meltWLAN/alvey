// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AlveyNFT is ERC721Enumerable, Ownable, Pausable {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    Counters.Counter private _tokenIds;
    
    // 存储 URI 映射
    mapping(uint256 => string) private _tokenURIs;
    
    uint256 public mintPrice = 100 * 10**18; // 100 Mario代币
    IERC20 public paymentToken;

    // 铸造限制
    uint256 public maxMintPerAddress = 10;
    mapping(address => uint256) public mintedPerAddress;
    uint256 public maxTotalSupply = 10000;

    // URI限制
    uint256 public maxURILength = 2048; // 最大URI长度限制

    event MintPriceUpdated(uint256 newPrice);
    event PaymentTokenUpdated(address newToken);
    event MintRecord(address indexed minter, uint256 tokenId, string uri);
    event TransferDebug(address from, address to, uint256 amount);
    event WithdrawDebug(address receiver, uint256 amount);
    event MaxMintPerAddressUpdated(uint256 newLimit);
    event MaxTotalSupplyUpdated(uint256 newLimit);
    event MaxURILengthUpdated(uint256 newLength);
    event RecoveredERC20(address token, address to, uint256 amount);

    struct MintRecordStruct {
        address minter;
        uint256 tokenId;
        string uri;
    }

    MintRecordStruct[] private _mintRecords;

    constructor(address _paymentToken) ERC721("AlveyNFT", "ALV") {
        // 验证支付代币地址
        require(_paymentToken != address(0), "Payment token cannot be zero address");
        
        // 验证代币是否实现了ERC20接口
        // 调用balanceOf函数检查是否是有效的ERC20
        try IERC20(_paymentToken).balanceOf(address(this)) returns (uint256) {
            paymentToken = IERC20(_paymentToken);
        } catch {
            revert("Invalid ERC20 token");
        }
    }

    function _validateURI(string memory uri) internal view returns (bool) {
        // 检查URI长度
        require(bytes(uri).length <= maxURILength, "URI too long");
        
        // 其他URI验证逻辑可以在这里添加
        // 例如检查URI是否为有效的URL格式等
        
        return true;
    }

    function safeMint(address to, string memory uri) public whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(mintedPerAddress[msg.sender] < maxMintPerAddress, "Exceeds max mint per address");
        require(_tokenIds.current() < maxTotalSupply, "Exceeds max total supply");
        require(_validateURI(uri), "Invalid URI");
        
        // 先更新状态，避免reentrancy
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        mintedPerAddress[msg.sender]++;
        
        // 使用安全的代币转账模式
        uint256 initialBalance = paymentToken.balanceOf(address(this));
        bool success = paymentToken.transferFrom(msg.sender, address(this), mintPrice);
        require(success, "Payment failed");
        
        // 检查实际转账金额，防止某些token可能有转账费或其他机制
        uint256 finalBalance = paymentToken.balanceOf(address(this));
        require(finalBalance >= initialBalance + mintPrice, "Payment amount mismatch");
        
        emit TransferDebug(msg.sender, address(this), mintPrice);
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        _mintRecords.push(MintRecordStruct(msg.sender, tokenId, uri));
        emit MintRecord(msg.sender, tokenId, uri);
    }

    function batchMint(address to, string[] memory uris) public whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(uris.length > 0 && uris.length <= 10, "Invalid batch size");
        require(mintedPerAddress[msg.sender] + uris.length <= maxMintPerAddress, "Exceeds max mint per address");
        require(_tokenIds.current() + uris.length <= maxTotalSupply, "Exceeds max total supply");
        
        // 验证所有URI
        for (uint256 i = 0; i < uris.length; i++) {
            require(_validateURI(uris[i]), "Invalid URI in batch");
        }
        
        // 先计算需要转账的金额
        uint256 totalCost = mintPrice * uris.length;
        
        // 更新状态值，防止reentrancy
        mintedPerAddress[msg.sender] += uris.length;
        
        // 使用安全的代币转账模式
        uint256 initialBalance = paymentToken.balanceOf(address(this));
        bool success = paymentToken.transferFrom(msg.sender, address(this), totalCost);
        require(success, "Payment failed");
        
        // 验证实际转账金额
        uint256 finalBalance = paymentToken.balanceOf(address(this));
        require(finalBalance >= initialBalance + totalCost, "Payment amount mismatch");
        
        emit TransferDebug(msg.sender, address(this), totalCost);
        
        for (uint256 i = 0; i < uris.length; i++) {
            _tokenIds.increment();
            uint256 tokenId = _tokenIds.current();
            
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uris[i]);
            
            _mintRecords.push(MintRecordStruct(msg.sender, tokenId, uris[i]));
            emit MintRecord(msg.sender, tokenId, uris[i]);
        }
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function _exists(uint256 tokenId) internal view virtual override returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override
        whenNotPaused
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function getMintRecords(uint256 limit) public view returns (MintRecordStruct[] memory) {
        uint256 resultLength = limit > _mintRecords.length ? _mintRecords.length : limit;
        MintRecordStruct[] memory result = new MintRecordStruct[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = _mintRecords[_mintRecords.length - resultLength + i];
        }
        return result;
    }

    function withdrawTokens() public onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        bool success = paymentToken.transfer(owner(), balance);
        require(success, "Transfer failed");
        emit WithdrawDebug(owner(), balance);
    }
    
    // 新增: 恢复其他ERC20代币
    function recoverERC20(address tokenAddress, address to) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        require(to != address(0), "Invalid recipient");
        
        // 如果是支付代币，使用标准提款方法
        if (tokenAddress == address(paymentToken)) {
            withdrawTokens();
            return;
        }
        
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to recover");
        
        bool success = token.transfer(to, balance);
        require(success, "Recovery transfer failed");
        
        emit RecoveredERC20(tokenAddress, to, balance);
    }

    function setMintPrice(uint256 _price) public onlyOwner {
        require(_price > 0, "Price must be greater than 0");
        mintPrice = _price;
        emit MintPriceUpdated(_price);
    }

    function setPaymentToken(address _token) public onlyOwner {
        require(_token != address(0), "Token cannot be zero address");
        
        // 验证代币是否实现了ERC20接口
        try IERC20(_token).balanceOf(address(this)) returns (uint256) {
            paymentToken = IERC20(_token);
            emit PaymentTokenUpdated(_token);
        } catch {
            revert("Invalid ERC20 token");
        }
    }

    function setMaxMintPerAddress(uint256 _limit) public onlyOwner {
        require(_limit > 0, "Limit must be greater than 0");
        maxMintPerAddress = _limit;
        emit MaxMintPerAddressUpdated(_limit);
    }

    function setMaxTotalSupply(uint256 _limit) public onlyOwner {
        require(_limit >= _tokenIds.current(), "New limit must be >= current supply");
        maxTotalSupply = _limit;
        emit MaxTotalSupplyUpdated(_limit);
    }
    
    function setMaxURILength(uint256 _length) public onlyOwner {
        require(_length > 0, "Length must be greater than 0");
        maxURILength = _length;
        emit MaxURILengthUpdated(_length);
    }

    function totalSupply() public view override returns (uint256) {
        return _tokenIds.current();
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}