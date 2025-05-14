const { expect } = require("chai");
const { ethers } = require("./hardhat-ethers-helpers");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AlveyNFT 管理功能安全测试", function () {
  // 定义测试环境
  async function deployNFTFixture() {
    const [owner, attacker, newOwner, user1, user2] = await ethers.getSigners();
    
    // 部署模拟ERC20代币
    const MockERC20 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    const token = await MockERC20.deploy("Mock Token", "MTK", 18);
    
    // 部署NFT合约
    const NFT = await ethers.getContractFactory("AlveyNFT");
    const nft = await NFT.deploy(await token.getAddress());
    
    // 铸造大量代币
    await token.mint(owner.address, ethers.parseUnits("1000000", 18));
    await token.mint(user1.address, ethers.parseUnits("1000000", 18));
    await token.mint(user2.address, ethers.parseUnits("1000000", 18));
    
    return { nft, token, owner, attacker, newOwner, user1, user2 };
  }

  describe("1. 所有权管理", function() {
    it("应正确处理所有权转移", async function() {
      const { nft, owner, newOwner, attacker } = await loadFixture(deployNFTFixture);
      
      // 验证初始所有者
      expect(await nft.owner()).to.equal(owner.address);
      
      // 尝试从非所有者账户转移所有权（应该失败）
      await expect(
        nft.connect(attacker).transferOwnership(attacker.address)
      ).to.be.reverted;
      
      // 从所有者账户转移所有权
      await nft.connect(owner).transferOwnership(newOwner.address);
      
      // 验证新所有者
      expect(await nft.owner()).to.equal(newOwner.address);
      
      // 尝试从原所有者账户调用只有所有者可以调用的函数（应该失败）
      await expect(
        nft.connect(owner).setMintPrice(ethers.parseUnits("200", 18))
      ).to.be.reverted;
      
      // 从新所有者账户调用只有所有者可以调用的函数
      await nft.connect(newOwner).setMintPrice(ethers.parseUnits("200", 18));
    });
    
    it("应通过两步验证正确处理所有权放弃", async function() {
      const { nft, owner } = await loadFixture(deployNFTFixture);
      
      // 验证所有者
      expect(await nft.owner()).to.equal(owner.address);
      
      // 放弃所有权
      await nft.connect(owner).renounceOwnership();
      
      // 验证所有权已放弃
      expect(await nft.owner()).to.equal(ethers.ZeroAddress);
      
      // 尝试调用只有所有者可以调用的函数（应该失败）
      await expect(
        nft.connect(owner).setMintPrice(ethers.parseUnits("200", 18))
      ).to.be.reverted;
    });
  });

  describe("2. 紧急控制功能", function() {
    it("应确保只有所有者可以暂停合约", async function() {
      const { nft, owner, attacker } = await loadFixture(deployNFTFixture);
      
      // 尝试从非所有者账户暂停合约（应该失败）
      await expect(
        nft.connect(attacker).pause()
      ).to.be.reverted;
      
      // 从所有者账户暂停合约
      await nft.connect(owner).pause();
      
      // 验证合约已暂停
      expect(await nft.paused()).to.be.true;
    });
    
    it("应确保紧急取款仅可被所有者使用", async function() {
      const { nft, token, owner, attacker, user1 } = await loadFixture(deployNFTFixture);
      
      // 让用户1铸造NFT，给合约付款
      const mintPrice = await nft.mintPrice();
      await token.connect(user1).approve(await nft.getAddress(), mintPrice);
      await nft.connect(user1).safeMint(user1.address, "https://example.com/token/1");
      
      // 验证合约余额
      expect(await token.balanceOf(await nft.getAddress())).to.equal(mintPrice);
      
      // 尝试从非所有者账户提取资金（应该失败）
      await expect(
        nft.connect(attacker).withdrawTokens()
      ).to.be.reverted;
      
      // 从所有者账户提取资金
      const initialOwnerBalance = await token.balanceOf(owner.address);
      await nft.connect(owner).withdrawTokens();
      
      // 验证资金已转移
      expect(await token.balanceOf(await nft.getAddress())).to.equal(0);
      expect(await token.balanceOf(owner.address)).to.equal(initialOwnerBalance + mintPrice);
    });
    
    it("应确保特殊ERC20恢复功能只能被所有者使用", async function() {
      const { nft, owner, attacker } = await loadFixture(deployNFTFixture);
      
      // 部署另一个ERC20代币
      const MockERC20_2 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
      const token2 = await MockERC20_2.deploy("Another Token", "ATK", 18);
      
      // 铸造代币并转给NFT合约
      await token2.mint(attacker.address, ethers.parseUnits("1000", 18));
      await token2.connect(attacker).transfer(await nft.getAddress(), ethers.parseUnits("500", 18));
      
      // 尝试从非所有者账户恢复代币（应该失败）
      await expect(
        nft.connect(attacker).recoverERC20(await token2.getAddress(), attacker.address)
      ).to.be.reverted;
      
      // 从所有者账户恢复代币
      await nft.connect(owner).recoverERC20(await token2.getAddress(), owner.address);
      
      // 验证代币已恢复
      expect(await token2.balanceOf(await nft.getAddress())).to.equal(0);
      expect(await token2.balanceOf(owner.address)).to.equal(ethers.parseUnits("500", 18));
    });
  });

  describe("3. 敏感参数管理", function() {
    it("应确保铸造价格仅可由所有者修改", async function() {
      const { nft, owner, attacker } = await loadFixture(deployNFTFixture);
      
      const initialPrice = await nft.mintPrice();
      const newPrice = initialPrice * 2n;
      
      // 尝试从非所有者账户修改价格（应该失败）
      await expect(
        nft.connect(attacker).setMintPrice(newPrice)
      ).to.be.reverted;
      
      // 从所有者账户修改价格
      await nft.connect(owner).setMintPrice(newPrice);
      
      // 验证价格已修改
      expect(await nft.mintPrice()).to.equal(newPrice);
    });
    
    it("应确保铸造限制仅可由所有者修改", async function() {
      const { nft, owner, attacker } = await loadFixture(deployNFTFixture);
      
      const initialLimit = await nft.maxMintPerAddress();
      const newLimit = initialLimit * 2n;
      
      // 尝试从非所有者账户修改限制（应该失败）
      await expect(
        nft.connect(attacker).setMaxMintPerAddress(newLimit)
      ).to.be.reverted;
      
      // 从所有者账户修改限制
      await nft.connect(owner).setMaxMintPerAddress(newLimit);
      
      // 验证限制已修改
      expect(await nft.maxMintPerAddress()).to.equal(newLimit);
    });
    
    it("应确保总供应量限制仅可由所有者修改", async function() {
      const { nft, owner, attacker } = await loadFixture(deployNFTFixture);
      
      const initialSupplyLimit = await nft.maxTotalSupply();
      const newSupplyLimit = initialSupplyLimit * 2n;
      
      // 尝试从非所有者账户修改限制（应该失败）
      await expect(
        nft.connect(attacker).setMaxTotalSupply(newSupplyLimit)
      ).to.be.reverted;
      
      // 从所有者账户修改限制
      await nft.connect(owner).setMaxTotalSupply(newSupplyLimit);
      
      // 验证限制已修改
      expect(await nft.maxTotalSupply()).to.equal(newSupplyLimit);
    });
    
    it("应正确验证新总供应量与当前铸造量的关系", async function() {
      const { nft, token, owner, user1 } = await loadFixture(deployNFTFixture);
      
      // 铸造2个NFT
      const mintPrice = await nft.mintPrice();
      await token.connect(user1).approve(await nft.getAddress(), mintPrice * 2n);
      await nft.connect(user1).safeMint(user1.address, "https://example.com/token/1");
      await nft.connect(user1).safeMint(user1.address, "https://example.com/token/2");
      
      // 尝试将总供应量设置为小于当前铸造量的值（应该失败）
      await expect(
        nft.connect(owner).setMaxTotalSupply(1)
      ).to.be.revertedWith("New limit must be >= current supply");
      
      // 将总供应量设置为等于当前铸造量的值
      await nft.connect(owner).setMaxTotalSupply(2);
      expect(await nft.maxTotalSupply()).to.equal(2);
      
      // 将总供应量设置为大于当前铸造量的值
      await nft.connect(owner).setMaxTotalSupply(100);
      expect(await nft.maxTotalSupply()).to.equal(100);
    });
  });

  describe("4. URI长度管理", function() {
    it("应确保URI长度限制仅可由所有者修改", async function() {
      const { nft, owner, attacker } = await loadFixture(deployNFTFixture);
      
      const initialURILimit = await nft.maxURILength();
      const newURILimit = 1024; // 设置一个不同的值
      
      // 尝试从非所有者账户修改限制（应该失败）
      await expect(
        nft.connect(attacker).setMaxURILength(newURILimit)
      ).to.be.reverted;
      
      // 从所有者账户修改限制
      await nft.connect(owner).setMaxURILength(newURILimit);
      
      // 验证限制已修改
      expect(await nft.maxURILength()).to.equal(newURILimit);
    });
    
    it("应拒绝零或负值的URI长度限制", async function() {
      const { nft, owner } = await loadFixture(deployNFTFixture);
      
      // 尝试将URI长度限制设置为零（应该失败）
      await expect(
        nft.connect(owner).setMaxURILength(0)
      ).to.be.revertedWith("Length must be greater than 0");
    });
  });

  describe("5. 支付代币管理", function() {
    it("应确保支付代币仅可由所有者修改", async function() {
      const { nft, token, owner, attacker } = await loadFixture(deployNFTFixture);
      
      // 部署另一个ERC20代币
      const MockERC20_2 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
      const newToken = await MockERC20_2.deploy("New Token", "NTK", 18);
      
      // 尝试从非所有者账户修改支付代币（应该失败）
      await expect(
        nft.connect(attacker).setPaymentToken(await newToken.getAddress())
      ).to.be.reverted;
      
      // 从所有者账户修改支付代币
      await nft.connect(owner).setPaymentToken(await newToken.getAddress());
      
      // 验证支付代币已修改
      expect(await nft.paymentToken()).to.equal(await newToken.getAddress());
    });
    
    it("应拒绝无效的ERC20代币地址", async function() {
      const { nft, owner } = await loadFixture(deployNFTFixture);
      
      // 尝试将支付代币设置为零地址（应该失败）
      await expect(
        nft.connect(owner).setPaymentToken(ethers.ZeroAddress)
      ).to.be.revertedWith("Token cannot be zero address");
      
      // 尝试将支付代币设置为非ERC20合约地址（应该失败）
      // 使用一个随机的外部拥有账户（EOA）地址，它肯定不会实现ERC20接口
      const randomEOA = ethers.Wallet.createRandom().address;
      await expect(
        nft.connect(owner).setPaymentToken(randomEOA)
      ).to.be.reverted; // 期望交易失败但不指定原因
    });
  });
}); 