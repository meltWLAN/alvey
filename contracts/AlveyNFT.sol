// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AlveyNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    uint256 public mintPrice = 1000000 * 10**18; // 100万 Mario代币
    IERC20 public paymentToken;

    event MintPriceUpdated(uint256 newPrice);
    event PaymentTokenUpdated(address newToken);

    constructor(address _paymentToken) ERC721("AlveyNFT", "ANFT") Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
    }

    function safeMint(address to, string memory uri) public {
        require(paymentToken.transferFrom(msg.sender, address(this), mintPrice), "Payment failed");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function withdrawTokens() public onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(paymentToken.transfer(owner(), balance), "Transfer failed");
    }

    function setMintPrice(uint256 _price) public onlyOwner {
        mintPrice = _price;
        emit MintPriceUpdated(_price);
    }

    function setPaymentToken(address _token) public onlyOwner {
        paymentToken = IERC20(_token);
        emit PaymentTokenUpdated(_token);
    }
}