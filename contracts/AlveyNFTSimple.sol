// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AlveyNFTSimple is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // 映射 tokenId 到 URI
    mapping(uint256 => string) private _tokenURIs;
    
    uint256 public mintPrice = 1000000 * 10**18; // 100万代币
    IERC20 public paymentToken;

    constructor(address _paymentToken) ERC721("AlveyNFT", "ALV") {
        paymentToken = IERC20(_paymentToken);
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        require(_exists(tokenId), "URI set for nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function _exists(uint256 tokenId) internal view override returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    function safeMint(address to, string memory uri) public {
        bool success = paymentToken.transferFrom(msg.sender, address(this), mintPrice);
        require(success, "Payment failed");
        
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function withdrawTokens() public onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        paymentToken.transfer(owner(), balance);
    }

    function setMintPrice(uint256 _price) public onlyOwner {
        mintPrice = _price;
    }
} 