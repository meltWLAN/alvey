const { expect } = require("chai");
const { ethers } = require("./hardhat-ethers-helpers");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("StakingContract 极限安全测试", function () {
  // 定义测试环境
  async function deployStakingFixture() {
    const [owner, attacker, staker1, staker2, staker3] = await ethers.getSigners();
    
    // 部署模拟ERC20代币
    const MockERC20 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    const rewardToken = await MockERC20.deploy("Reward Token", "RWD", 18);
    
    // 部署NFT合约
    const NFT = await ethers.getContractFactory("AlveyNFT");
    const nft = await NFT.deploy(await rewardToken.getAddress());
    
    // 部署质押合约
    const StakingContract = await ethers.getContractFactory("StakingContract");
    const stakingContract = await StakingContract.deploy(
      await nft.getAddress(),
      await rewardToken.getAddress()
    );
    
    // 铸造代币
    await rewardToken.mint(owner.address, ethers.parseUnits("10000000", 18));
    await rewardToken.mint(staker1.address, ethers.parseUnits("100000", 18));
    await rewardToken.mint(staker2.address, ethers.parseUnits("100000", 18));
    await rewardToken.mint(staker3.address, ethers.parseUnits("100000", 18));
    
    // 给质押合约转入奖励代币
    await rewardToken.transfer(await stakingContract.getAddress(), ethers.parseUnits("5000000", 18));
    
    // 铸造NFT给质押者
    const mintPrice = await nft.mintPrice();
    
    // 铸造NFT给staker1
    await rewardToken.connect(staker1).approve(await nft.getAddress(), mintPrice * 10n);
    for (let i = 1; i <= 5; i++) {
      await nft.connect(staker1).safeMint(staker1.address, `https://example.com/token/${i}`);
    }
    
    // 铸造NFT给staker2
    await rewardToken.connect(staker2).approve(await nft.getAddress(), mintPrice * 10n);
    for (let i = 6; i <= 10; i++) {
      await nft.connect(staker2).safeMint(staker2.address, `https://example.com/token/${i}`);
    }
    
    // 铸造NFT给staker3
    await rewardToken.connect(staker3).approve(await nft.getAddress(), mintPrice * 10n);
    for (let i = 11; i <= 15; i++) {
      await nft.connect(staker3).safeMint(staker3.address, `https://example.com/token/${i}`);
    }
    
    return { stakingContract, nft, rewardToken, owner, attacker, staker1, staker2, staker3 };
  }

  describe("1. 极限奖励计算", function() {
    it("应正确应用每日奖励上限", async function() {
      const { stakingContract, nft, rewardToken, staker1 } = await loadFixture(deployStakingFixture);
      
      // 批准NFT转移
      await nft.connect(staker1).approve(await stakingContract.getAddress(), 1);
      
      // 设置极高的基础奖励率
      const extremelyHighRate = ethers.parseUnits("1000", 18); // 极高的值
      await stakingContract.updateRewardParams(extremelyHighRate, 1);
      
      // 质押NFT
      await stakingContract.connect(staker1).stake(1);
      
      // 前进一天
      await time.increase(time.duration.days(1));
      
      // 获取待领取奖励
      const pendingReward = await stakingContract.getPendingReward(1);
      const maxDailyReward = await stakingContract.maxDailyReward();
      
      // 验证奖励不超过每日上限
      expect(pendingReward).to.be.lessThanOrEqual(maxDailyReward);
    });
    
    it("应正确应用总奖励上限", async function() {
      const { stakingContract, nft, rewardToken, staker1 } = await loadFixture(deployStakingFixture);
      
      // 批准NFT转移
      await nft.connect(staker1).approve(await stakingContract.getAddress(), 1);
      
      // 设置较高的基础奖励率
      const highRate = ethers.parseUnits("100", 18);
      await stakingContract.updateRewardParams(highRate, 10); // 高基础率和时间权重
      
      // 质押NFT
      await stakingContract.connect(staker1).stake(1);
      
      // 前进30天
      await time.increase(time.duration.days(30));
      
      // 获取待领取奖励
      const pendingReward = await stakingContract.getPendingReward(1);
      const maxRewardCap = await stakingContract.maxRewardCap();
      
      // 验证奖励不超过总上限
      expect(pendingReward).to.be.lessThanOrEqual(maxRewardCap);
    });
  });

  describe("2. 多用户同时质押和赎回", function() {
    it("应能处理多用户同时质押", async function() {
      const { stakingContract, nft, staker1, staker2, staker3 } = await loadFixture(deployStakingFixture);
      
      // 批准NFT转移
      await nft.connect(staker1).approve(await stakingContract.getAddress(), 1);
      await nft.connect(staker2).approve(await stakingContract.getAddress(), 6);
      await nft.connect(staker3).approve(await stakingContract.getAddress(), 11);
      
      // 并行质押
      await Promise.all([
        stakingContract.connect(staker1).stake(1),
        stakingContract.connect(staker2).stake(6),
        stakingContract.connect(staker3).stake(11)
      ]);
      
      // 验证所有NFT都被正确质押
      expect(await nft.ownerOf(1)).to.equal(await stakingContract.getAddress());
      expect(await nft.ownerOf(6)).to.equal(await stakingContract.getAddress());
      expect(await nft.ownerOf(11)).to.equal(await stakingContract.getAddress());
      
      // 验证质押记录正确
      const stake1 = await stakingContract.stakes(1);
      const stake6 = await stakingContract.stakes(6);
      const stake11 = await stakingContract.stakes(11);
      
      expect(stake1.staker).to.equal(staker1.address);
      expect(stake6.staker).to.equal(staker2.address);
      expect(stake11.staker).to.equal(staker3.address);
    });
    
    it("应能处理多用户同时领取奖励", async function() {
      const { stakingContract, nft, rewardToken, staker1, staker2, staker3 } = await loadFixture(deployStakingFixture);
      
      // 批准NFT转移
      await nft.connect(staker1).approve(await stakingContract.getAddress(), 1);
      await nft.connect(staker2).approve(await stakingContract.getAddress(), 6);
      await nft.connect(staker3).approve(await stakingContract.getAddress(), 11);
      
      // 质押NFT
      await stakingContract.connect(staker1).stake(1);
      await stakingContract.connect(staker2).stake(6);
      await stakingContract.connect(staker3).stake(11);
      
      // 前进7天
      await time.increase(time.duration.days(7));
      
      // 记录初始余额
      const initialBalance1 = await rewardToken.balanceOf(staker1.address);
      const initialBalance2 = await rewardToken.balanceOf(staker2.address);
      const initialBalance3 = await rewardToken.balanceOf(staker3.address);
      
      // 并行领取奖励
      await Promise.all([
        stakingContract.connect(staker1).claimReward(1),
        stakingContract.connect(staker2).claimReward(6),
        stakingContract.connect(staker3).claimReward(11)
      ]);
      
      // 验证所有用户都收到了奖励
      expect(await rewardToken.balanceOf(staker1.address)).to.be.gt(initialBalance1);
      expect(await rewardToken.balanceOf(staker2.address)).to.be.gt(initialBalance2);
      expect(await rewardToken.balanceOf(staker3.address)).to.be.gt(initialBalance3);
    });
  });

  describe("3. 极端时间测试", function() {
    it("应能处理极长的质押时间", async function() {
      const { stakingContract, nft, rewardToken, staker1 } = await loadFixture(deployStakingFixture);
      
      // 批准NFT转移
      await nft.connect(staker1).approve(await stakingContract.getAddress(), 1);
      
      // 质押NFT
      await stakingContract.connect(staker1).stake(1);
      
      // 前进一年
      await time.increase(time.duration.days(365));
      
      // 领取奖励
      const initialBalance = await rewardToken.balanceOf(staker1.address);
      await stakingContract.connect(staker1).claimReward(1);
      
      // 验证奖励已支付
      expect(await rewardToken.balanceOf(staker1.address)).to.be.gt(initialBalance);
      
      // 再前进10年
      await time.increase(time.duration.days(365 * 10));
      
      // 再次领取奖励
      const balanceAfterFirstClaim = await rewardToken.balanceOf(staker1.address);
      await stakingContract.connect(staker1).claimReward(1);
      
      // 验证奖励已支付
      expect(await rewardToken.balanceOf(staker1.address)).to.be.gt(balanceAfterFirstClaim);
    });
  });

  describe("4. 紧急情况处理", function() {
    it("应允许在紧急情况下提取所有代币", async function() {
      const { stakingContract, nft, rewardToken, owner, staker1 } = await loadFixture(deployStakingFixture);
      
      // 批准NFT转移
      await nft.connect(staker1).approve(await stakingContract.getAddress(), 1);
      
      // 质押NFT
      await stakingContract.connect(staker1).stake(1);
      
      // 前进一段时间
      await time.increase(time.duration.days(30));
      
      // 模拟紧急情况
      const contractBalance = await rewardToken.balanceOf(await stakingContract.getAddress());
      const ownerInitialBalance = await rewardToken.balanceOf(owner.address);
      
      await stakingContract.connect(owner).emergencyWithdraw();
      
      // 验证所有代币都被提取
      expect(await rewardToken.balanceOf(await stakingContract.getAddress())).to.equal(0);
      expect(await rewardToken.balanceOf(owner.address)).to.equal(ownerInitialBalance + contractBalance);
    });
    
    it("应允许紧急暂停所有函数", async function() {
      const { stakingContract, nft, owner, staker1, staker2 } = await loadFixture(deployStakingFixture);
      
      // 批准NFT转移
      await nft.connect(staker1).approve(await stakingContract.getAddress(), 1);
      await nft.connect(staker2).approve(await stakingContract.getAddress(), 6);
      
      // 质押一个NFT
      await stakingContract.connect(staker1).stake(1);
      
      // 暂停合约
      await stakingContract.connect(owner).pause();
      
      // 尝试质押（应该失败）
      await expect(
        stakingContract.connect(staker2).stake(6)
      ).to.be.revertedWith("Pausable: paused");
      
      // 尝试领取奖励（应该失败）
      await expect(
        stakingContract.connect(staker1).claimReward(1)
      ).to.be.revertedWith("Pausable: paused");
      
      // 尝试取回质押（应该失败）
      await expect(
        stakingContract.connect(staker1).unstake(1)
      ).to.be.revertedWith("Pausable: paused");
      
      // 恢复合约
      await stakingContract.connect(owner).unpause();
      
      // 现在应该可以质押
      await stakingContract.connect(staker2).stake(6);
      expect(await nft.ownerOf(6)).to.equal(await stakingContract.getAddress());
    });
  });

  describe("5. NFT恢复功能", function() {
    it("应能恢复误发的NFT", async function() {
      const { stakingContract, nft, owner, staker1 } = await loadFixture(deployStakingFixture);
      
      // 部署另一个NFT合约
      const NFT2 = await ethers.getContractFactory("AlveyNFT");
      const otherNft = await NFT2.deploy(await nft.paymentToken());
      
      // 铸造NFT
      const mintPrice = await otherNft.mintPrice();
      await (await nft.paymentToken()).connect(owner).approve(await otherNft.getAddress(), mintPrice);
      await otherNft.safeMint(owner.address, "https://example.com/other-token/1");
      
      // 误转NFT到质押合约
      await otherNft.approve(await stakingContract.getAddress(), 1);
      await otherNft["safeTransferFrom(address,address,uint256)"](owner.address, await stakingContract.getAddress(), 1);
      
      // 验证NFT已转到质押合约
      expect(await otherNft.ownerOf(1)).to.equal(await stakingContract.getAddress());
      
      // 恢复NFT
      await stakingContract.connect(owner).recoverERC721(await otherNft.getAddress(), 1, owner.address);
      
      // 验证NFT已恢复
      expect(await otherNft.ownerOf(1)).to.equal(owner.address);
    });
    
    it("应防止恢复已质押的NFT", async function() {
      const { stakingContract, nft, owner, staker1 } = await loadFixture(deployStakingFixture);
      
      // 批准并质押NFT
      await nft.connect(staker1).approve(await stakingContract.getAddress(), 1);
      await stakingContract.connect(staker1).stake(1);
      
      // 尝试恢复已质押的NFT（应该失败）
      await expect(
        stakingContract.connect(owner).recoverERC721(await nft.getAddress(), 1, owner.address)
      ).to.be.revertedWith("Cannot recover staked NFT");
    });
  });

  describe("6. 权重计算精度", function() {
    it("应正确计算时间加权因子", async function() {
      const { stakingContract, nft, staker1 } = await loadFixture(deployStakingFixture);
      
      // 设置高时间权重因子
      await stakingContract.updateRewardParams(ethers.parseUnits("1", 18), 10);
      
      // 批准NFT转移
      await nft.connect(staker1).approve(await stakingContract.getAddress(), 1);
      
      // 质押NFT
      await stakingContract.connect(staker1).stake(1);
      
      // 前进10天
      await time.increase(time.duration.days(10));
      
      // 获取待领取奖励
      const stakeWeight = await stakingContract.stakeWeights(1);
      
      // 验证权重大于0
      expect(stakeWeight).to.equal(0); // 初始权重为0
      
      // 领取奖励以更新权重
      await stakingContract.connect(staker1).claimReward(1);
      
      // 再次检查权重
      const updatedWeight = await stakingContract.stakeWeights(1);
      expect(updatedWeight).to.be.gt(0);
    });
  });

  describe("7. 获取用户质押信息", function() {
    it("应能获取用户的所有质押信息", async function() {
      const { stakingContract, nft, staker1 } = await loadFixture(deployStakingFixture);
      
      // 批准多个NFT
      await nft.connect(staker1).approve(await stakingContract.getAddress(), 1);
      await nft.connect(staker1).approve(await stakingContract.getAddress(), 2);
      await nft.connect(staker1).approve(await stakingContract.getAddress(), 3);
      
      // 质押多个NFT
      await stakingContract.connect(staker1).stake(1);
      await stakingContract.connect(staker1).stake(2);
      await stakingContract.connect(staker1).stake(3);
      
      // 获取用户质押
      const stakes = await stakingContract.getUserStakes(staker1.address);
      expect(stakes.length).to.equal(3);
      expect(stakes[0]).to.equal(1);
      expect(stakes[1]).to.equal(2);
      expect(stakes[2]).to.equal(3);
      
      // 获取详细信息
      const stakesInfo = await stakingContract.getUserStakesInfo(staker1.address);
      expect(stakesInfo.length).to.equal(3);
      expect(stakesInfo[0].tokenId).to.equal(1);
      expect(stakesInfo[1].tokenId).to.equal(2);
      expect(stakesInfo[2].tokenId).to.equal(3);
      expect(stakesInfo[0].staker).to.equal(staker1.address);
      expect(stakesInfo[1].staker).to.equal(staker1.address);
      expect(stakesInfo[2].staker).to.equal(staker1.address);
    });
  });

  describe("8. 异常情况处理", function() {
    it("应正确处理奖励代币耗尽的情况", async function() {
      const { stakingContract, nft, rewardToken, owner, staker1 } = await loadFixture(deployStakingFixture);
      
      // 批准NFT转移
      await nft.connect(staker1).approve(await stakingContract.getAddress(), 1);
      
      // 质押NFT
      await stakingContract.connect(staker1).stake(1);
      
      // 前进时间以累积奖励
      await time.increase(time.duration.days(30));
      
      // 提取所有奖励代币
      await stakingContract.connect(owner).emergencyWithdraw();
      
      // 尝试领取奖励（应该失败）
      await expect(
        stakingContract.connect(staker1).claimReward(1)
      ).to.be.revertedWith("Reward transfer failed");
    });
    
    it("应能在恢复合约后重新配置奖励参数", async function() {
      const { stakingContract, nft, rewardToken, owner, staker1 } = await loadFixture(deployStakingFixture);
      
      // 批准NFT转移
      await nft.connect(staker1).approve(await stakingContract.getAddress(), 1);
      
      // 质押NFT
      await stakingContract.connect(staker1).stake(1);
      
      // 提取所有奖励代币
      await stakingContract.connect(owner).emergencyWithdraw();
      
      // 再次给合约转入代币
      await rewardToken.transfer(await stakingContract.getAddress(), ethers.parseUnits("1000000", 18));
      
      // 更新奖励参数
      const newBaseRate = ethers.parseUnits("2", 18);
      const newWeightFactor = 5;
      await stakingContract.connect(owner).updateRewardParams(newBaseRate, newWeightFactor);
      
      // 验证参数已更新
      expect(await stakingContract.baseRewardRate()).to.equal(newBaseRate);
      expect(await stakingContract.timeWeightFactor()).to.equal(newWeightFactor);
    });
  });
}); 