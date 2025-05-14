import { expect } from "chai";
import { ethers } from "hardhat";

describe("AlveyNFT", function () {
  let nft;
  let token;
  let owner;
  let addr1;
  let addr2;
  const tokenURI = "https://example.com/token/1";

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy MockERC20
    const MockERC20 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    token = await MockERC20.deploy("Mock Token", "MTK", 18);
    await token.waitForDeployment();
    
    // Mint tokens to owner
    await token.mint(owner.address, ethers.parseUnits("2000000", 18));
    
    // Deploy NFT contract
    const NFT = await ethers.getContractFactory("AlveyNFT");
    nft = await NFT.deploy(await token.getAddress());
    await nft.waitForDeployment();
    
    // Transfer tokens to addr1 and addr2
      await token.transfer(addr1.address, ethers.parseUnits("1000000", 18));
    await token.transfer(addr2.address, ethers.parseUnits("1000000", 18));
    });

  describe("Basic Functionality", function () {
    describe("Minting", function () {
    it("Should mint a new token with correct URI", async function () {
      const mintPrice = await nft.mintPrice();
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
      await nft.connect(addr1).safeMint(addr1.address, tokenURI);
      
        const tokenId = 1;
      expect(await nft.ownerOf(tokenId)).to.equal(addr1.address);
      expect(await nft.tokenURI(tokenId)).to.equal(tokenURI);
    });

    it("Should fail if payment is insufficient", async function () {
        await token.connect(addr1).approve(await nft.getAddress(), 0);
        await expect(
          nft.connect(addr1).safeMint(addr1.address, tokenURI)
        ).to.be.revertedWith("ERC20: insufficient allowance");
      });

      it("Should fail if exceeds max mint per address", async function () {
        const mintPrice = await nft.mintPrice();
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice * 11n);
        
        for (let i = 0; i < 10; i++) {
          await nft.connect(addr1).safeMint(addr1.address, tokenURI);
        }
        
        await expect(
          nft.connect(addr1).safeMint(addr1.address, tokenURI)
        ).to.be.revertedWith("Exceeds max mint per address");
      });

      it("Should track minted tokens per address", async function () {
        const mintPrice = await nft.mintPrice();
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice * 3n);
        
        await nft.connect(addr1).safeMint(addr1.address, tokenURI);
        expect(await nft.mintedPerAddress(addr1.address)).to.equal(1);
        
        await nft.connect(addr1).safeMint(addr1.address, tokenURI);
        expect(await nft.mintedPerAddress(addr1.address)).to.equal(2);
      });
    });

    describe("Batch Minting", function () {
      it("Should batch mint tokens", async function () {
        const mintPrice = await nft.mintPrice();
        const batchSize = 5;
        const uris = Array(batchSize).fill(tokenURI);
        
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice * BigInt(batchSize));
        await nft.connect(addr1).batchMint(addr1.address, uris);
        
        for (let i = 1; i <= batchSize; i++) {
          expect(await nft.ownerOf(i)).to.equal(addr1.address);
          expect(await nft.tokenURI(i)).to.equal(tokenURI);
        }
      });

      it("Should fail if batch size is invalid", async function () {
        const mintPrice = await nft.mintPrice();
        const uris = Array(11).fill(tokenURI);
        
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice * BigInt(uris.length));
        await expect(
          nft.connect(addr1).batchMint(addr1.address, uris)
        ).to.be.revertedWith("Invalid batch size");
      });

      it("Should fail if batch size is zero", async function () {
        const uris = [];
        await expect(
          nft.connect(addr1).batchMint(addr1.address, uris)
        ).to.be.revertedWith("Invalid batch size");
      });

      it("Should update minted tokens count correctly after batch mint", async function () {
        const mintPrice = await nft.mintPrice();
        const batchSize = 5;
        const uris = Array(batchSize).fill(tokenURI);
        
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice * BigInt(batchSize));
        await nft.connect(addr1).batchMint(addr1.address, uris);
        
        expect(await nft.mintedPerAddress(addr1.address)).to.equal(batchSize);
      });
    });

    describe("Token URI Management", function () {
      it("Should return correct token URI", async function () {
        const mintPrice = await nft.mintPrice();
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
        await nft.connect(addr1).safeMint(addr1.address, tokenURI);
        
        expect(await nft.tokenURI(1)).to.equal(tokenURI);
      });

      it("Should fail when querying URI for non-existent token", async function () {
        await expect(nft.tokenURI(999)).to.be.revertedWith("URI query for nonexistent token");
      });

      it("Should handle empty URI", async function () {
        const mintPrice = await nft.mintPrice();
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
        await nft.connect(addr1).safeMint(addr1.address, "");
        expect(await nft.tokenURI(1)).to.equal("");
      });
    });
  });

  describe("Access Control", function () {
    describe("Owner Functions", function () {
      it("Should allow owner to update mint price", async function () {
        const newPrice = ethers.parseUnits("200", 18);
        await nft.setMintPrice(newPrice);
        expect(await nft.mintPrice()).to.equal(newPrice);
      });

      it("Should fail if non-owner tries to update mint price", async function () {
        const newPrice = ethers.parseUnits("200", 18);
        await expect(
          nft.connect(addr1).setMintPrice(newPrice)
        ).to.be.reverted;
      });

      it("Should allow owner to update payment token", async function () {
        const MockERC20 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
        const newToken = await MockERC20.deploy("New Token", "NTK", 18);
        await newToken.waitForDeployment();
        
        await nft.setPaymentToken(await newToken.getAddress());
        expect(await nft.paymentToken()).to.equal(await newToken.getAddress());
      });

      it("Should fail if non-owner tries to update payment token", async function () {
        await expect(
          nft.connect(addr1).setPaymentToken(addr2.address)
        ).to.be.reverted;
      });

      it("Should allow owner to update max mint per address", async function () {
        const newLimit = 20;
        await nft.setMaxMintPerAddress(newLimit);
        expect(await nft.maxMintPerAddress()).to.equal(newLimit);
      });

      it("Should fail if non-owner tries to update max mint per address", async function () {
        await expect(
          nft.connect(addr1).setMaxMintPerAddress(20)
        ).to.be.reverted;
      });

      it("Should allow owner to update max total supply", async function () {
        const newLimit = 20000;
        await nft.setMaxTotalSupply(newLimit);
        expect(await nft.maxTotalSupply()).to.equal(newLimit);
      });

      it("Should fail if non-owner tries to update max total supply", async function () {
        await expect(
          nft.connect(addr1).setMaxTotalSupply(20000)
        ).to.be.reverted;
      });

      it("Should fail if new max total supply is less than current supply", async function () {
        const mintPrice = await nft.mintPrice();
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
        await nft.connect(addr1).safeMint(addr1.address, tokenURI);
        
        await expect(
          nft.setMaxTotalSupply(0)
        ).to.be.revertedWith("New limit must be >= current supply");
      });
    });

    describe("Pause Control", function () {
      it("Should allow owner to pause contract", async function () {
        await nft.pause();
        expect(await nft.paused()).to.be.true;
      });

      it("Should fail if non-owner tries to pause contract", async function () {
        await expect(nft.connect(addr1).pause()).to.be.reverted;
      });

      it("Should allow owner to unpause contract", async function () {
        await nft.pause();
        await nft.unpause();
        expect(await nft.paused()).to.be.false;
      });

      it("Should fail if non-owner tries to unpause contract", async function () {
        await nft.pause();
        await expect(nft.connect(addr1).unpause()).to.be.reverted;
      });

      it("Should prevent minting when paused", async function () {
        await nft.pause();
        const mintPrice = await nft.mintPrice();
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
        
      await expect(
        nft.connect(addr1).safeMint(addr1.address, tokenURI)
        ).to.be.revertedWith("Pausable: paused");
      });

      it("Should prevent batch minting when paused", async function () {
        await nft.pause();
        const mintPrice = await nft.mintPrice();
        const uris = Array(5).fill(tokenURI);
        
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice * BigInt(uris.length));
        await expect(
          nft.connect(addr1).batchMint(addr1.address, uris)
        ).to.be.revertedWith("Pausable: paused");
      });
    });
  });

  describe("State Management", function () {
    describe("Supply Limits", function () {
      it("Should enforce total supply limit", async function () {
        const mintPrice = await nft.mintPrice();
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice * 11n);
        
        await nft.setMaxTotalSupply(5);
        
        for (let i = 0; i < 5; i++) {
          await nft.connect(addr1).safeMint(addr1.address, tokenURI);
        }
        
        await expect(
          nft.connect(addr1).safeMint(addr1.address, tokenURI)
        ).to.be.revertedWith("Exceeds max total supply");
      });

      it("Should track total supply correctly", async function () {
        const mintPrice = await nft.mintPrice();
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice * 3n);
        
        expect(await nft.totalSupply()).to.equal(0);
        
        await nft.connect(addr1).safeMint(addr1.address, tokenURI);
        expect(await nft.totalSupply()).to.equal(1);
        
        await nft.connect(addr1).safeMint(addr1.address, tokenURI);
        expect(await nft.totalSupply()).to.equal(2);
      });
    });

    describe("Mint Records", function () {
      it("Should return correct mint records", async function () {
        const mintPrice = await nft.mintPrice();
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice * 3n);
        
        for (let i = 0; i < 3; i++) {
          await nft.connect(addr1).safeMint(addr1.address, tokenURI);
        }
        
        const records = await nft.getMintRecords(3);
        expect(records.length).to.equal(3);
        expect(records[2].minter).to.equal(addr1.address);
        expect(records[2].tokenId).to.equal(3);
        expect(records[1].minter).to.equal(addr1.address);
        expect(records[1].tokenId).to.equal(2);
        expect(records[0].minter).to.equal(addr1.address);
        expect(records[0].tokenId).to.equal(1);
      });

      it("Should return all records if limit exceeds total records", async function () {
        const mintPrice = await nft.mintPrice();
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
        await nft.connect(addr1).safeMint(addr1.address, tokenURI);
        
        const records = await nft.getMintRecords(10);
        expect(records.length).to.equal(1);
      });

      it("Should return empty array if no records exist", async function () {
        const records = await nft.getMintRecords(10);
        expect(records.length).to.equal(0);
      });
    });
  });

  describe("Financial Operations", function () {
    describe("Withdrawal", function () {
    it("Should allow owner to withdraw funds", async function () {
        const mintPrice = await nft.mintPrice();
        
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
        await nft.connect(addr1).safeMint(addr1.address, tokenURI);
        
        const contractBalance = await token.balanceOf(await nft.getAddress());
        const initialOwnerBalance = await token.balanceOf(owner.address);
      
      await nft.connect(owner).withdrawTokens();
      
        const finalOwnerBalance = await token.balanceOf(owner.address);
        expect(finalOwnerBalance).to.equal(initialOwnerBalance + contractBalance);
    });

    it("Should not allow non-owner to withdraw", async function () {
      await expect(nft.connect(addr1).withdrawTokens()).to.be.reverted;
      });

      it("Should handle withdrawal with zero balance", async function () {
        await nft.connect(owner).withdrawTokens();
        expect(await token.balanceOf(await nft.getAddress())).to.equal(0);
      });

      it("Should emit WithdrawDebug event on successful withdrawal", async function () {
        const mintPrice = await nft.mintPrice();
        await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
        await nft.connect(addr1).safeMint(addr1.address, tokenURI);
        
        const contractBalance = await token.balanceOf(await nft.getAddress());
        await expect(nft.connect(owner).withdrawTokens())
          .to.emit(nft, "WithdrawDebug")
          .withArgs(owner.address, contractBalance);
      });
    });

    describe("Payment Token Management", function () {
      it("Should mint with new payment token", async function () {
        const MockERC20 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
        const newToken = await MockERC20.deploy("New Token", "NTK", 18);
        await newToken.waitForDeployment();
        
        await newToken.mint(addr1.address, ethers.parseUnits("1000000", 18));
        
        await nft.setPaymentToken(await newToken.getAddress());
        const mintPrice = await nft.mintPrice();
        
        await newToken.connect(addr1).approve(await nft.getAddress(), mintPrice);
        await nft.connect(addr1).safeMint(addr1.address, tokenURI);
        
        expect(await nft.ownerOf(1)).to.equal(addr1.address);
      });

      it("Should emit PaymentTokenUpdated event", async function () {
        const MockERC20 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
        const newToken = await MockERC20.deploy("New Token", "NTK", 18);
        await newToken.waitForDeployment();
        
        await expect(nft.setPaymentToken(await newToken.getAddress()))
          .to.emit(nft, "PaymentTokenUpdated")
          .withArgs(await newToken.getAddress());
      });
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero address minting", async function () {
      const mintPrice = await nft.mintPrice();
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
      await expect(
        nft.connect(addr1).safeMint(ethers.ZeroAddress, tokenURI)
      ).to.be.revertedWith("ERC721: mint to the zero address");
    });

    it("Should handle empty URI", async function () {
      const mintPrice = await nft.mintPrice();
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
      await nft.connect(addr1).safeMint(addr1.address, "");
      expect(await nft.tokenURI(1)).to.equal("");
    });

    it("Should handle max supply limit edge case", async function () {
      const mintPrice = await nft.mintPrice();
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
      
      await nft.setMaxTotalSupply(0);
      
      await expect(
        nft.connect(addr1).safeMint(addr1.address, tokenURI)
      ).to.be.revertedWith("Exceeds max total supply");
    });

    it("Should handle multiple minters", async function () {
      const mintPrice = await nft.mintPrice();
      
      // addr1 mints
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
      await nft.connect(addr1).safeMint(addr1.address, tokenURI);
      
      // addr2 mints
      await token.connect(addr2).approve(await nft.getAddress(), mintPrice);
      await nft.connect(addr2).safeMint(addr2.address, tokenURI);
      
      expect(await nft.ownerOf(1)).to.equal(addr1.address);
      expect(await nft.ownerOf(2)).to.equal(addr2.address);
      expect(await nft.mintedPerAddress(addr1.address)).to.equal(1);
      expect(await nft.mintedPerAddress(addr2.address)).to.equal(1);
    });

    it("Should handle token transfer after minting", async function () {
      const mintPrice = await nft.mintPrice();
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
      await nft.connect(addr1).safeMint(addr1.address, tokenURI);
      
      await nft.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
      expect(await nft.ownerOf(1)).to.equal(addr2.address);
    });
  });
});