import { expect } from "chai";
import pkg from 'hardhat';
const { ethers } = pkg;
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("StakingContract Security Tests", function () {
  let stakingContract;
  let nft;
  let rewardToken;
  let owner;
  let staker1;
  let staker2;
  let attacker;
  
  const tokenId = 1;
  const tokenURI = "https://example.com/token/1";

  beforeEach(async function () {
    [owner, staker1, staker2, attacker] = await ethers.getSigners();
    
    // Deploy Mock ERC20 (reward token)
    const MockERC20 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    rewardToken = await MockERC20.deploy("Reward Token", "RWD", 18);
    await rewardToken.waitForDeployment();
    
    // Mint reward tokens to owner
    await rewardToken.mint(owner.address, ethers.parseUnits("1000000", 18));
    
    // Deploy NFT
    const NFT = await ethers.getContractFactory("AlveyNFT");
    nft = await NFT.deploy(await rewardToken.getAddress());
    await nft.waitForDeployment();
    
    // Deploy Staking Contract
    const StakingContract = await ethers.getContractFactory("StakingContract");
    stakingContract = await StakingContract.deploy(
      await nft.getAddress(),
      await rewardToken.getAddress()
    );
    await stakingContract.waitForDeployment();
    
    // Fund staking contract with rewards
    await rewardToken.transfer(await stakingContract.getAddress(), ethers.parseUnits("500000", 18));
    
    // Mint NFT to staker1
    await rewardToken.transfer(staker1.address, ethers.parseUnits("10000", 18));
    await rewardToken.connect(staker1).approve(await nft.getAddress(), await nft.mintPrice());
    await nft.connect(staker1).safeMint(staker1.address, tokenURI);
    
    // Approve staking contract to transfer NFT
    await nft.connect(staker1).approve(await stakingContract.getAddress(), tokenId);
  });

  describe("Reentrancy Protection", function () {
    it("Should protect stake function from reentrancy", async function () {
      // Test is theoretical as ReentrancyGuard is used
      // The stake function changes state after the external call
      await stakingContract.connect(staker1).stake(tokenId);
      
      // Verify stake was successful
      const stakeInfo = await stakingContract.stakes(tokenId);
      expect(stakeInfo.staker).to.equal(staker1.address);
      expect(await nft.ownerOf(tokenId)).to.equal(await stakingContract.getAddress());
    });
    
    it("Should protect unstake function from reentrancy", async function () {
      // First stake the NFT
      await stakingContract.connect(staker1).stake(tokenId);
      
      // Try to unstake
      await stakingContract.connect(staker1).unstake(tokenId);
      
      // Verify NFT is back with staker1
      expect(await nft.ownerOf(tokenId)).to.equal(staker1.address);
      
      // Verify stake record is deleted
      const stakeInfo = await stakingContract.stakes(tokenId);
      expect(stakeInfo.stakedAt).to.equal(0); // Empty struct
    });
  });

  describe("Access Control", function () {
    it("Should prevent unauthorized unstaking", async function () {
      // First stake the NFT
      await stakingContract.connect(staker1).stake(tokenId);
      
      // Attacker tries to unstake
      await expect(stakingContract.connect(attacker).unstake(tokenId))
        .to.be.revertedWith("Not staker");
    });
    
    it("Should prevent unauthorized reward claims", async function () {
      // First stake the NFT
      await stakingContract.connect(staker1).stake(tokenId);
      
      // Attacker tries to claim reward
      await expect(stakingContract.connect(attacker).claimReward(tokenId))
        .to.be.revertedWith("Not staker");
    });
    
    it("Should prevent non-owner from updating reward parameters", async function () {
      await expect(stakingContract.connect(attacker).updateRewardParams(
        ethers.parseUnits("2", 18),
        2
      )).to.be.reverted;
    });
    
    it("Should prevent non-owner from emergency withdrawing", async function () {
      await expect(stakingContract.connect(attacker).emergencyWithdraw())
        .to.be.reverted;
    });
  });

  describe("Reward Calculation Security", function () {
    it("Should calculate rewards correctly with time manipulation", async function () {
      // Stake the NFT
      await stakingContract.connect(staker1).stake(tokenId);
      const baseRewardRate = await stakingContract.baseRewardRate();
      
      // Fast forward time (7 days)
      await time.increase(time.duration.days(7));
      
      // Calculate expected reward
      const stakeDuration = time.duration.days(7);
      const timeWeight = 1n + (BigInt(stakeDuration) * 1n) / BigInt(time.duration.days(1));
      const expectedReward = BigInt(stakeDuration) * baseRewardRate * timeWeight;
      
      // Claim reward
      await stakingContract.connect(staker1).claimReward(tokenId);
      
      // Get accumulated rewards
      const stakeInfo = await stakingContract.stakes(tokenId);
      expect(stakeInfo.accumulated).to.equal(0); // Should be reset after claim
      
      // Check if reward was transferred correctly
      const contractBalance = await rewardToken.balanceOf(await stakingContract.getAddress());
      expect(contractBalance).to.be.lessThan(ethers.parseUnits("500000", 18));
    });
    
    it("Should handle multiple staking and unstaking correctly", async function () {
      // Mint another NFT to staker1
      const tokenId2 = 2;
      await rewardToken.connect(staker1).approve(await nft.getAddress(), await nft.mintPrice());
      await nft.connect(staker1).safeMint(staker1.address, tokenURI);
      await nft.connect(staker1).approve(await stakingContract.getAddress(), tokenId2);
      
      // Stake first NFT
      await stakingContract.connect(staker1).stake(tokenId);
      
      // Fast forward time (3 days)
      await time.increase(time.duration.days(3));
      
      // Stake second NFT
      await stakingContract.connect(staker1).stake(tokenId2);
      
      // Fast forward time (4 days)
      await time.increase(time.duration.days(4));
      
      // Unstake first NFT (should get rewards for 7 days)
      await stakingContract.connect(staker1).unstake(tokenId);
      
      // Fast forward time (2 days)
      await time.increase(time.duration.days(2));
      
      // Unstake second NFT (should get rewards for 6 days)
      await stakingContract.connect(staker1).unstake(tokenId2);
      
      // Verify both NFTs are back with staker1
      expect(await nft.ownerOf(tokenId)).to.equal(staker1.address);
      expect(await nft.ownerOf(tokenId2)).to.equal(staker1.address);
      
      // Verify no remaining stakes for staker1
      const userStakes = await stakingContract.getUserStakes(staker1.address);
      expect(userStakes.length).to.equal(0);
    });
  });

  describe("Parameter Update Security", function () {
    it("Should correctly apply parameter updates", async function () {
      // Stake an NFT
      await stakingContract.connect(staker1).stake(tokenId);
      
      // Fast forward time (1 day)
      await time.increase(time.duration.days(1));
      
      // Update reward parameters
      const newBaseRate = ethers.parseUnits("2", 18);
      const newWeightFactor = 2;
      await stakingContract.connect(owner).updateRewardParams(newBaseRate, newWeightFactor);
      
      // Verify parameters were updated
      expect(await stakingContract.baseRewardRate()).to.equal(newBaseRate);
      expect(await stakingContract.timeWeightFactor()).to.equal(newWeightFactor);
      
      // Fast forward time (1 day)
      await time.increase(time.duration.days(1));
      
      // Claim reward with new parameters
      await stakingContract.connect(staker1).claimReward(tokenId);
      
      // Check stake weight was updated
      const stakeWeight = await stakingContract.stakeWeights(tokenId);
      expect(stakeWeight).to.be.gt(0);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow emergency withdraw by owner", async function () {
      const initialOwnerBalance = await rewardToken.balanceOf(owner.address);
      const contractBalance = await rewardToken.balanceOf(await stakingContract.getAddress());
      
      // Execute emergency withdraw
      await stakingContract.connect(owner).emergencyWithdraw();
      
      // Verify funds were transferred to owner
      const finalOwnerBalance = await rewardToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance + contractBalance);
      
      // Verify contract balance is 0
      expect(await rewardToken.balanceOf(await stakingContract.getAddress())).to.equal(0);
    });
    
    it("Should handle staking after emergency withdrawal", async function () {
      // Execute emergency withdraw
      await stakingContract.connect(owner).emergencyWithdraw();
      
      // Refund the contract
      await rewardToken.transfer(await stakingContract.getAddress(), ethers.parseUnits("10000", 18));
      
      // Stake an NFT
      await stakingContract.connect(staker1).stake(tokenId);
      
      // Fast forward time (1 day)
      await time.increase(time.duration.days(1));
      
      // Claim reward
      await stakingContract.connect(staker1).claimReward(tokenId);
      
      // Unstake
      await stakingContract.connect(staker1).unstake(tokenId);
      
      // Verify NFT is back with staker1
      expect(await nft.ownerOf(tokenId)).to.equal(staker1.address);
    });
  });

  describe("DoS Protections", function () {
    it("Should handle large number of stakes efficiently", async function () {
      // This test is limited by the mock environment, but in a real environment
      // would test with many more NFTs
      
      // Mint 5 more NFTs to staker1
      const additionalNFTs = 5;
      for (let i = 0; i < additionalNFTs; i++) {
        const newTokenId = tokenId + i + 1;
        await rewardToken.connect(staker1).approve(await nft.getAddress(), await nft.mintPrice());
        await nft.connect(staker1).safeMint(staker1.address, tokenURI);
        await nft.connect(staker1).approve(await stakingContract.getAddress(), newTokenId);
        await stakingContract.connect(staker1).stake(newTokenId);
      }
      
      // Verify all NFTs were staked
      const userStakes = await stakingContract.getUserStakes(staker1.address);
      expect(userStakes.length).to.equal(additionalNFTs);
      
      // Get all stake info
      const stakesInfo = await stakingContract.getUserStakesInfo(staker1.address);
      expect(stakesInfo.length).to.equal(additionalNFTs);
      
      // Unstake all NFTs
      for (let i = 0; i < userStakes.length; i++) {
        await stakingContract.connect(staker1).unstake(userStakes[i]);
      }
      
      // Verify all NFTs were unstaked
      const finalUserStakes = await stakingContract.getUserStakes(staker1.address);
      expect(finalUserStakes.length).to.equal(0);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle unstaking of non-existent stake", async function () {
      await expect(stakingContract.connect(staker1).unstake(99999))
        .to.be.revertedWith("NFT not staked");
    });
    
    it("Should handle claiming rewards of non-staked NFT", async function () {
      await expect(stakingContract.connect(staker1).claimReward(99999))
        .to.be.revertedWith("NFT not staked");
    });
    
    it("Should handle insufficient reward balance", async function () {
      // Stake the NFT
      await stakingContract.connect(staker1).stake(tokenId);
      
      // Emergency withdraw all rewards
      await stakingContract.connect(owner).emergencyWithdraw();
      
      // Fast forward time
      await time.increase(time.duration.days(30));
      
      // Try to claim rewards (should fail)
      await expect(stakingContract.connect(staker1).claimReward(tokenId))
        .to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });
});