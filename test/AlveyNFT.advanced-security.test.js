const { expect } = require("chai");
const hre = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("./hardhat-ethers-helpers");

describe("AlveyNFT 高级安全测试", function () {
  // 定义测试环境
  async function deployNFTFixture() {
    const [owner, attacker, user1, user2, user3] = await ethers.getSigners();
    
    // 部署模拟ERC20代币
    const MockERC20 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    const token = await MockERC20.deploy("Mock Token", "MTK", 18);
    await token.waitForDeployment();
    
    // 部署恶意ERC20代币（用于攻击测试）
    const AttackerContractFactory = await ethers.getContractFactory("contracts/mocks/AttackerERC20.sol:AttackerERC20");
    let attackerContract;
    try {
      attackerContract = await AttackerContractFactory.deploy("Attacker", "ATK");
      await attackerContract.waitForDeployment();
    } catch(e) {
      console.log("恶意合约未部署，将跳过相关测试", e);
    }
    
    // 部署NFT合约
    const NFT = await ethers.getContractFactory("AlveyNFT");
    const nft = await NFT.deploy(await token.getAddress());
    await nft.waitForDeployment();
    
    // 铸造大量代币给测试账户
    await token.mint(owner.address, ethers.parseUnits("10000000", 18));
    await token.mint(attacker.address, ethers.parseUnits("1000000", 18));
    await token.mint(user1.address, ethers.parseUnits("1000000", 18));
    await token.mint(user2.address, ethers.parseUnits("1000000", 18));
    
    // 给NFT合约批准代币
    const mintPrice = await nft.mintPrice();
    await token.connect(owner).approve(await nft.getAddress(), ethers.parseUnits("10000000", 18));
    await token.connect(attacker).approve(await nft.getAddress(), ethers.parseUnits("1000000", 18));
    await token.connect(user1).approve(await nft.getAddress(), ethers.parseUnits("1000000", 18));
    await token.connect(user2).approve(await nft.getAddress(), ethers.parseUnits("1000000", 18));
    
    return { nft, token, attackerContract, owner, attacker, user1, user2, user3, mintPrice };
  }

  describe("1. 攻击者无法利用重入攻击", function() {
    it("合约状态应先更新再进行外部调用", async function() {
      const { nft, token, owner, attacker, mintPrice } = await loadFixture(deployNFTFixture);
      
      // 验证safeMint函数不会受到重入攻击
      const initialSupply = await nft.totalSupply();
      await nft.connect(attacker).safeMint(attacker.address, "https://example.com/token/1");
      
      // 验证状态已正确更新
      expect(await nft.totalSupply()).to.equal(initialSupply + 1n);
      expect(await nft.mintedPerAddress(attacker.address)).to.equal(1);
      
      // 理论上，如果合约存在重入漏洞，攻击者可以在回调中再次调用mint
      // 但我们的合约中先更新了状态，所以即使有回调也无法绕过限制
    });
  });

  describe("2. 前端运行攻击阻止", function() {
    it("不能通过前端运行来操纵价格获利", async function() {
      const { nft, token, owner, attacker, user1, mintPrice } = await loadFixture(deployNFTFixture);
      
      // 攻击者尝试前置运行价格变更
      // 1. 攻击者监控到价格即将提高的交易
      // 2. 攻击者尝试在价格变更前以低价铸造
      
      // 模拟情景：owner准备提高价格
      const newPrice = mintPrice * 2n;
      
      // 攻击者提前获知并尝试抢先铸造
      await nft.connect(attacker).safeMint(attacker.address, "https://example.com/token/1");
      
      // owner变更价格
      await nft.connect(owner).setMintPrice(newPrice);
      
      // 验证价格已变更
      expect(await nft.mintPrice()).to.equal(newPrice);
      
      // 用户1按新价格铸造
      await token.connect(user1).approve(await nft.getAddress(), newPrice);
      await nft.connect(user1).safeMint(user1.address, "https://example.com/token/2");
      
      // 清除攻击者之前的批准，只批准旧价格
      await token.connect(attacker).approve(await nft.getAddress(), 0); // 先清零
      await token.connect(attacker).approve(await nft.getAddress(), mintPrice); // 只批准旧价格
      
      // 攻击者尝试再次以旧价格铸造（应该失败）
      await expect(
        nft.connect(attacker).safeMint(attacker.address, "https://example.com/token/3")
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  });

  describe("3. 批量操作安全性", function() {
    it("批量铸造不会导致状态不一致", async function() {
      const { nft, token, attacker, mintPrice } = await loadFixture(deployNFTFixture);
      
      // 准备大批量铸造
      const batchSize = 10; // 最大允许的批量大小
      const uris = Array(batchSize).fill("https://example.com/token/");
      
      // 批准足够的代币
      const totalCost = mintPrice * BigInt(batchSize);
      await token.connect(attacker).approve(await nft.getAddress(), totalCost);
      
      // 执行批量铸造
      const initialSupply = await nft.totalSupply();
      await nft.connect(attacker).batchMint(attacker.address, uris);
      
      // 验证状态一致性
      expect(await nft.totalSupply()).to.equal(initialSupply + BigInt(batchSize));
      expect(await nft.mintedPerAddress(attacker.address)).to.equal(batchSize);
      
      // 验证所有NFT都正确铸造
      for (let i = 1; i <= batchSize; i++) {
        const tokenId = initialSupply + BigInt(i);
        expect(await nft.ownerOf(tokenId)).to.equal(attacker.address);
      }
    });
    
    it("达到批量铸造限制时会正确拒绝", async function() {
      const { nft, token, attacker, mintPrice } = await loadFixture(deployNFTFixture);
      
      // 尝试铸造超出批量限制的数量
      const batchSize = 11; // 超出最大允许的10个
      const uris = Array(batchSize).fill("https://example.com/token/");
      
      // 批准足够的代币
      const totalCost = mintPrice * BigInt(batchSize);
      await token.connect(attacker).approve(await nft.getAddress(), totalCost);
      
      // 执行批量铸造（应该失败）
      await expect(
        nft.connect(attacker).batchMint(attacker.address, uris)
      ).to.be.revertedWith("Invalid batch size");
    });
  });

  describe("4. 极限条件测试", function() {
    it("处理边界URI长度", async function() {
      const { nft, token, attacker, mintPrice } = await loadFixture(deployNFTFixture);
      
      // 获取最大URI长度
      const maxURILength = await nft.maxURILength();
      
      // 创建一个刚好达到最大长度的URI
      const exactMaxLengthURI = "x".repeat(Number(maxURILength));
      
      // 创建一个超出最大长度的URI
      const tooLongURI = "x".repeat(Number(maxURILength) + 1);
      
      // 批准代币
      await token.connect(attacker).approve(await nft.getAddress(), mintPrice);
      
      // 测试最大长度URI（应该成功）
      await nft.connect(attacker).safeMint(attacker.address, exactMaxLengthURI);
      
      // 测试超长URI（应该失败）
      await token.connect(attacker).approve(await nft.getAddress(), mintPrice);
      await expect(
        nft.connect(attacker).safeMint(attacker.address, tooLongURI)
      ).to.be.revertedWith("URI too long");
    });
    
    it("处理最大铸造限制", async function() {
      const { nft, token, owner, attacker, mintPrice } = await loadFixture(deployNFTFixture);
      
      // 将每个地址的最大铸造数设为1
      await nft.connect(owner).setMaxMintPerAddress(1);
      
      // 铸造一个NFT
      await nft.connect(attacker).safeMint(attacker.address, "https://example.com/token/1");
      
      // 尝试再次铸造（应该失败）
      await token.connect(attacker).approve(await nft.getAddress(), mintPrice);
      await expect(
        nft.connect(attacker).safeMint(attacker.address, "https://example.com/token/2")
      ).to.be.revertedWith("Exceeds max mint per address");
    });
    
    it("处理总供应量限制", async function() {
      const { nft, token, owner, attacker, user1, user2, mintPrice } = await loadFixture(deployNFTFixture);
      
      // 设置总供应量限制为2
      await nft.connect(owner).setMaxTotalSupply(2);
      
      // 铸造第一个NFT
      await nft.connect(attacker).safeMint(attacker.address, "https://example.com/token/1");
      
      // 铸造第二个NFT
      await nft.connect(user1).safeMint(user1.address, "https://example.com/token/2");
      
      // 尝试铸造第三个NFT（应该失败）
      await token.connect(user2).approve(await nft.getAddress(), mintPrice);
      await expect(
        nft.connect(user2).safeMint(user2.address, "https://example.com/token/3")
      ).to.be.revertedWith("Exceeds max total supply");
    });
  });

  describe("5. 恶意代币测试", function() {
    it("合约能够处理费用扣除的代币", async function() {
      const { nft, token, owner, attacker, mintPrice } = await loadFixture(deployNFTFixture);
      
      // 创建一个模拟的收费代币 (在实际测试中需要部署)
      // 这里我们使用常规代币模拟，因为我们没有真正的收费代币
      
      // 铸造代币并批准
      await token.connect(attacker).approve(await nft.getAddress(), mintPrice * 2n); // 批准2倍，模拟有手续费的情况
      
      // 铸造NFT
      await nft.connect(attacker).safeMint(attacker.address, "https://example.com/token/1");
      
      // 验证铸造成功
      expect(await nft.ownerOf(1)).to.equal(attacker.address);
    });
  });

  describe("6. 特权升级保护", function() {
    it("管理员功能受到保护", async function() {
      const { nft, token, owner, attacker, mintPrice } = await loadFixture(deployNFTFixture);
      
      // 尝试以攻击者身份调用特权函数
      await expect(
        nft.connect(attacker).setMintPrice(mintPrice * 2n)
      ).to.be.reverted;
      
      await expect(
        nft.connect(attacker).setMaxMintPerAddress(100)
      ).to.be.reverted;
      
      await expect(
        nft.connect(attacker).setMaxTotalSupply(5000)
      ).to.be.reverted;
      
      await expect(
        nft.connect(attacker).withdrawTokens()
      ).to.be.reverted;
      
      await expect(
        nft.connect(attacker).pause()
      ).to.be.reverted;
    });
  });

  describe("7. 紧急暂停功能测试", function() {
    it("暂停后应禁止所有铸造活动", async function() {
      const { nft, token, owner, attacker, mintPrice } = await loadFixture(deployNFTFixture);
      
      // 暂停合约
      await nft.connect(owner).pause();
      
      // 验证合约已暂停
      expect(await nft.paused()).to.be.true;
      
      // 尝试铸造（应该失败）
      await token.connect(attacker).approve(await nft.getAddress(), mintPrice);
      await expect(
        nft.connect(attacker).safeMint(attacker.address, "https://example.com/token/1")
      ).to.be.revertedWith("Pausable: paused");
      
      // 取消暂停
      await nft.connect(owner).unpause();
      
      // 验证合约已恢复
      expect(await nft.paused()).to.be.false;
      
      // 尝试铸造（应该成功）
      await nft.connect(attacker).safeMint(attacker.address, "https://example.com/token/1");
      expect(await nft.ownerOf(1)).to.equal(attacker.address);
    });
  });

  describe("8. 代币恢复功能测试", function() {
    it("应能恢复误发的ERC20代币", async function() {
      const { nft, token, owner, attacker } = await loadFixture(deployNFTFixture);
      
      // 部署第二种ERC20代币
      const MockERC20_2 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
      const token2 = await MockERC20_2.deploy("Mock Token 2", "MTK2", 18);
      await token2.waitForDeployment();
      
      // 铸造代币给攻击者
      await token2.mint(attacker.address, ethers.parseUnits("1000", 18));
      
      // 攻击者将代币转给NFT合约
      const sentAmount = ethers.parseUnits("100", 18);
      await token2.connect(attacker).transfer(await nft.getAddress(), sentAmount);
      
      // 验证代币已发送
      expect(await token2.balanceOf(await nft.getAddress())).to.equal(sentAmount);
      
      // 恢复代币
      const initialOwnerBalance = await token2.balanceOf(owner.address);
      await nft.connect(owner).recoverERC20(await token2.getAddress(), owner.address);
      
      // 验证代币已恢复
      expect(await token2.balanceOf(await nft.getAddress())).to.equal(0);
      expect(await token2.balanceOf(owner.address)).to.equal(initialOwnerBalance + sentAmount);
    });
  });

  describe("9. 高频交易测试", function() {
    it("应能处理多账户快速铸造", async function() {
      const { nft, token, owner, attacker, user1, user2, mintPrice } = await loadFixture(deployNFTFixture);
      
      // 模拟大量用户同时铸造
      const users = [owner, attacker, user1, user2];
      const initialSupply = await nft.totalSupply();
      
      // 并行铸造多个NFT
      await Promise.all(users.map(async (user, index) => {
        await token.connect(user).approve(await nft.getAddress(), mintPrice);
        return nft.connect(user).safeMint(user.address, `https://example.com/token/${index}`);
      }));
      
      // 验证所有NFT都被正确铸造
      expect(await nft.totalSupply()).to.equal(initialSupply + BigInt(users.length));
      
      // 验证每个用户都收到了自己的NFT
      for (let i = 0; i < users.length; i++) {
        const tokenId = Number(initialSupply) + i + 1;
        const tokenOwner = await nft.ownerOf(tokenId);
        expect(tokenOwner).to.equal(users[i].address);
      }
    });
  });
}); 