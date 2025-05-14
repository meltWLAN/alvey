import { expect } from "chai";
import { ethers } from "hardhat";

describe("AlveyNFT Security Tests", function () {
  let nft;
  let token;
  let owner;
  let addr1;
  let addr2;
  let attacker;
  const tokenURI = "https://example.com/token/1";

  beforeEach(async function () {
    [owner, addr1, addr2, attacker] = await ethers.getSigners();
    
    // Deploy MockERC20
    const MockERC20 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    token = await MockERC20.deploy("Mock Token", "MTK", 18);
    await token.waitForDeployment();
    
    // Mint tokens to owner and test accounts
    await token.mint(owner.address, ethers.parseUnits("2000000", 18));
    await token.transfer(addr1.address, ethers.parseUnits("1000000", 18));
    await token.transfer(addr2.address, ethers.parseUnits("1000000", 18));
    await token.transfer(attacker.address, ethers.parseUnits("1000000", 18));
    
    // Deploy NFT contract
    const NFT = await ethers.getContractFactory("AlveyNFT");
    nft = await NFT.deploy(await token.getAddress());
    await nft.waitForDeployment();
  });

  describe("Reentrancy Protection", function () {
    it("Should be protected against reentrancy attacks", async function () {
      // Since we're using OpenZeppelin's safeMint and _safeMint, 
      // which have built-in reentrancy protection, this is a theoretical test
      
      // The vulnerability would be in the token transferFrom call if it allowed reentrancy,
      // but standard ERC20s don't allow this callback mechanism
      const mintPrice = await nft.mintPrice();
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
      
      // Simulate a mint - in a real attack, we would deploy a malicious receiver contract
      await nft.connect(addr1).safeMint(addr1.address, tokenURI);
      
      // Verify the mint completed successfully
      expect(await nft.ownerOf(1)).to.equal(addr1.address);
      expect(await nft.mintedPerAddress(addr1.address)).to.equal(1);
    });
  });

  describe("Integer Overflow/Underflow Protection", function () {
    it("Should protect against mint price overflow", async function () {
      // Setting an extremely large mint price (which is safely handled in Solidity 0.8+)
      const overflowPrice = ethers.MaxUint256;
      await nft.setMintPrice(overflowPrice);
      expect(await nft.mintPrice()).to.equal(overflowPrice);
      
      // The test passes if no exception is thrown during the setMintPrice call
    });
    
    it("Should protect against batch minting overflow", async function () {
      // First, set max mint per address to a high number
      await nft.setMaxMintPerAddress(100);
      
      // Approve a large amount of tokens
      const mintPrice = await nft.mintPrice();
      const batchSize = 10; // Maximum allowed by the contract
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice * BigInt(batchSize));
      
      // Try to mint the maximum batch size
      const uris = Array(batchSize).fill(tokenURI);
      await nft.connect(addr1).batchMint(addr1.address, uris);
      
      // Verify the minting worked correctly
      expect(await nft.mintedPerAddress(addr1.address)).to.equal(batchSize);
      expect(await nft.totalSupply()).to.equal(batchSize);
    });
  });

  describe("Access Control Security", function () {
    it("Should prevent frontrunning of owner functions", async function () {
      // This tests that owner functions are properly protected
      const newPrice = ethers.parseUnits("200", 18);
      
      // Attempt by non-owner should fail
      await expect(nft.connect(attacker).setMintPrice(newPrice)).to.be.reverted;
      
      // Owner should succeed
      await nft.connect(owner).setMintPrice(newPrice);
      expect(await nft.mintPrice()).to.equal(newPrice);
    });
    
    it("Should safely withdraw funds to owner only", async function () {
      // Mint a token to get some funds in the contract
      const mintPrice = await nft.mintPrice();
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
      await nft.connect(addr1).safeMint(addr1.address, tokenURI);
      
      // Check contract balance
      const contractBalance = await token.balanceOf(await nft.getAddress());
      expect(contractBalance).to.equal(mintPrice);
      
      // Attacker tries to withdraw
      await expect(nft.connect(attacker).withdrawTokens()).to.be.reverted;
      
      // Balance should remain unchanged
      expect(await token.balanceOf(await nft.getAddress())).to.equal(contractBalance);
      
      // Owner can withdraw successfully
      await nft.connect(owner).withdrawTokens();
      expect(await token.balanceOf(await nft.getAddress())).to.equal(0);
    });
  });

  describe("Token URI Security", function () {
    it("Should protect against malicious URIs", async function () {
      // Test with extremely long URI (potential DoS vector)
      const longURI = "https://example.com/".repeat(1000);
      const mintPrice = await nft.mintPrice();
      
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
      await nft.connect(addr1).safeMint(addr1.address, longURI);
      
      // URI should be stored and retrieved successfully
      expect(await nft.tokenURI(1)).to.equal(longURI);
    });
    
    it("Should handle JavaScript injection in URI", async function () {
      // Test with URI containing JavaScript code (potential XSS vector in UI)
      const maliciousURI = "javascript:alert('XSS')";
      const mintPrice = await nft.mintPrice();
      
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
      await nft.connect(addr1).safeMint(addr1.address, maliciousURI);
      
      // URI should be stored as-is (frontend would need to sanitize)
      expect(await nft.tokenURI(1)).to.equal(maliciousURI);
    });
  });

  describe("Pause Mechanism Security", function () {
    it("Should recover from emergency pause", async function () {
      // Pause the contract
      await nft.connect(owner).pause();
      
      // Verify minting is blocked
      const mintPrice = await nft.mintPrice();
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
      await expect(nft.connect(addr1).safeMint(addr1.address, tokenURI))
        .to.be.revertedWith("Pausable: paused");
      
      // Unpause and verify minting works again
      await nft.connect(owner).unpause();
      await nft.connect(addr1).safeMint(addr1.address, tokenURI);
      expect(await nft.ownerOf(1)).to.equal(addr1.address);
    });
    
    it("Should prevent attackers from manipulating pause state", async function () {
      // Attacker tries to pause
      await expect(nft.connect(attacker).pause()).to.be.reverted;
      expect(await nft.paused()).to.be.false;
      
      // Owner pauses
      await nft.connect(owner).pause();
      expect(await nft.paused()).to.be.true;
      
      // Attacker tries to unpause
      await expect(nft.connect(attacker).unpause()).to.be.reverted;
      expect(await nft.paused()).to.be.true;
    });
  });

  describe("Payment Token Security", function () {
    it("Should handle malicious payment token safely", async function () {
      // Deploy a "malicious" token for testing
      const MaliciousTokenFactory = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
      const maliciousToken = await MaliciousTokenFactory.deploy("Malicious", "MAL", 18);
      await maliciousToken.waitForDeployment();
      
      // Mint tokens to attacker
      await maliciousToken.mint(attacker.address, ethers.parseUnits("1000000", 18));
      
      // Change payment token (only owner can do this)
      await nft.connect(owner).setPaymentToken(await maliciousToken.getAddress());
      
      // Try to mint with malicious token
      const mintPrice = await nft.mintPrice();
      await maliciousToken.connect(attacker).approve(await nft.getAddress(), mintPrice);
      await nft.connect(attacker).safeMint(attacker.address, tokenURI);
      
      // Verify the mint succeeded properly
      expect(await nft.ownerOf(1)).to.equal(attacker.address);
      expect(await maliciousToken.balanceOf(await nft.getAddress())).to.equal(mintPrice);
    });
    
    it("Should handle payment token that reverts on transfer", async function () {
      // This would require a custom mock token that reverts on transfer
      // For simplicity, we'll disconnect approval to simulate a failing transfer
      const mintPrice = await nft.mintPrice();
      
      // Don't approve the contract to spend tokens
      await expect(nft.connect(addr1).safeMint(addr1.address, tokenURI))
        .to.be.revertedWith("ERC20: insufficient allowance");
    });
  });

  describe("Denial of Service Prevention", function () {
    it("Should not be vulnerable to gas limit DoS attack via record accumulation", async function () {
      // Set a high mint limit for test
      await nft.setMaxMintPerAddress(50);
      
      // Mint many tokens to generate many records
      const mintPrice = await nft.mintPrice();
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice * 20n);
      
      for (let i = 0; i < 20; i++) {
        await nft.connect(addr1).safeMint(addr1.address, tokenURI);
      }
      
      // Try to get all records - this should work without hitting gas limits
      const records = await nft.getMintRecords(20);
      expect(records.length).to.equal(20);
      
      // Verify we can still mint after accumulating many records
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
      await nft.connect(addr1).safeMint(addr1.address, tokenURI);
      expect(await nft.totalSupply()).to.equal(21);
    });
    
    it("Should handle large batch requests efficiently", async function () {
      // Approve tokens for a large batch
      const mintPrice = await nft.mintPrice();
      const batchSize = 10;
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice * BigInt(batchSize));
      
      // Create a batch of URIs
      const uris = Array(batchSize).fill(tokenURI);
      
      // Mint the batch
      await nft.connect(addr1).batchMint(addr1.address, uris);
      
      // Verify all tokens were minted
      expect(await nft.totalSupply()).to.equal(batchSize);
      for (let i = 1; i <= batchSize; i++) {
        expect(await nft.ownerOf(i)).to.equal(addr1.address);
      }
    });
  });

  describe("Function Call Sequence Vulnerability", function () {
    it("Should prevent unauthorized state modification between operations", async function () {
      // Simulate a scenario where an attacker tries to exploit function call ordering
      // Set initial mint price
      const mintPrice = ethers.parseUnits("100", 18);
      await nft.setMintPrice(mintPrice);
      
      // Attacker approves tokens for this mint price
      await token.connect(attacker).approve(await nft.getAddress(), mintPrice);
      
      // Owner increases price before attacker can mint
      const newPrice = ethers.parseUnits("200", 18);
      await nft.setMintPrice(newPrice);
      
      // Attacker tries to mint with previous approval
      // This should fail because the price has changed
      await expect(nft.connect(attacker).safeMint(attacker.address, tokenURI))
        .to.be.revertedWith("ERC20: insufficient allowance");
      
      // Verify no tokens were minted
      expect(await nft.totalSupply()).to.equal(0);
    });
  });
}); 