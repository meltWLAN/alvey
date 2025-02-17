const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AlveyNFT", function () {
  let nft;
  let owner;
  let addr1;
  const tokenURI = "https://example.com/token/1";

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("AlveyNFT");
    nft = await NFT.deploy();
    await nft.waitForDeployment();
  });

  describe("Minting", function () {
    it("Should mint a new token with correct URI", async function () {
      const mintPrice = await nft.mintPrice();
      await nft.connect(addr1).safeMint(addr1.address, tokenURI, { value: mintPrice });
      
      const tokenId = 0;
      expect(await nft.ownerOf(tokenId)).to.equal(addr1.address);
      expect(await nft.tokenURI(tokenId)).to.equal(tokenURI);
    });

    it("Should fail if payment is insufficient", async function () {
      const mintPrice = await nft.mintPrice();
      await expect(
        nft.connect(addr1).safeMint(addr1.address, tokenURI, { value: 0 })
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Withdrawal", function () {
    it("Should allow owner to withdraw funds", async function () {
      const mintPrice = await nft.mintPrice();
      await nft.connect(addr1).safeMint(addr1.address, tokenURI, { value: mintPrice });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      await nft.connect(owner).withdraw();
      const finalBalance = await ethers.provider.getBalance(owner.address);

      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should not allow non-owner to withdraw", async function () {
      await expect(nft.connect(addr1).withdraw()).to.be.reverted;
    });
  });
});