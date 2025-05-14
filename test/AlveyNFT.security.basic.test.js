const { expect } = require("chai");
const { ethers, hre } = require("./hardhat-ethers-helpers");

describe("AlveyNFT Security Tests (Basic)", function () {
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
    
    // Mint tokens to test accounts
    const amount = ethers.parseUnits("1000000", 18);
    await token.mint(owner.address, amount);
    await token.mint(addr1.address, amount);
    await token.mint(addr2.address, amount); 
    await token.mint(attacker.address, amount);
    
    // Deploy NFT contract
    const NFT = await ethers.getContractFactory("AlveyNFT");
    nft = await NFT.deploy(await token.getAddress());
    await nft.waitForDeployment();
  });

  describe("Access Control Security", function () {
    it("Should prevent unauthorized access to admin functions", async function () {
      // 尝试设置铸造价格 (应该失败)
      const newPrice = ethers.parseUnits("200", 18);
      await expect(nft.connect(attacker).setMintPrice(newPrice)).to.be.reverted;
      
      // 尝试设置支付代币 (应该失败)
      await expect(nft.connect(attacker).setPaymentToken(attacker.address)).to.be.reverted;
      
      // 尝试提取代币 (应该失败)
      await expect(nft.connect(attacker).withdrawTokens()).to.be.reverted;
    });
    
    it("Should prevent unauthorized pausing", async function () {
      // 尝试暂停合约 (应该失败)
      await expect(nft.connect(attacker).pause()).to.be.reverted;
      
      // 验证合约仍然可用
      expect(await nft.paused()).to.equal(false);
      
      // 尝试解除暂停 (应该失败)
      await expect(nft.connect(attacker).unpause()).to.be.reverted;
    });
  });

  describe("Payment Security", function () {
    it("Should protect against payment manipulation", async function () {
      const mintPrice = await nft.mintPrice();
      
      // 授权不足金额 (应该失败)
      const insufficientAmount = ethers.parseUnits("10", 18); // 远小于 mintPrice
      await token.connect(addr1).approve(await nft.getAddress(), insufficientAmount);
      await expect(nft.connect(addr1).safeMint(addr1.address, tokenURI)).to.be.reverted;
      
      // 正确授权后应该成功
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
      await nft.connect(addr1).safeMint(addr1.address, tokenURI);
      expect(await nft.ownerOf(1)).to.equal(addr1.address);
    });
  });
}); 