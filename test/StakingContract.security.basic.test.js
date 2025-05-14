const { expect } = require("chai");
const { ethers, hre } = require("./hardhat-ethers-helpers");

describe("StakingContract Security Tests (Basic)", function () {
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
    
    // Mint reward tokens to all accounts
    const amount = ethers.parseUnits("1000000", 18);
    await rewardToken.mint(owner.address, amount);
    await rewardToken.mint(staker1.address, amount); 
    await rewardToken.mint(staker2.address, amount);
    await rewardToken.mint(attacker.address, amount);
    
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
    await rewardToken.connect(staker1).approve(await nft.getAddress(), await nft.mintPrice());
    await nft.connect(staker1).safeMint(staker1.address, tokenURI);
    
    // Approve staking contract to transfer NFT
    await nft.connect(staker1).approve(await stakingContract.getAddress(), tokenId);
  });

  describe("Access Control", function () {
    it("Should prevent unauthorized unstaking", async function () {
      // First stake the NFT
      await stakingContract.connect(staker1).stake(tokenId);
      
      // Attacker tries to unstake
      await expect(stakingContract.connect(attacker).unstake(tokenId))
        .to.be.revertedWith("Not staker");
        
      // Verify NFT is still in contract
      expect(await nft.ownerOf(tokenId)).to.equal(await stakingContract.getAddress());
    });
    
    it("Should prevent non-owner from updating reward parameters", async function () {
      await expect(stakingContract.connect(attacker).updateRewardParams(
        ethers.parseUnits("2", 18),
        2
      )).to.be.reverted;
      
      // Verify parameters were not changed
      expect(await stakingContract.baseRewardRate()).to.equal(ethers.parseUnits("1", 18));
      expect(await stakingContract.timeWeightFactor()).to.equal(1);
    });
    
    it("Should prevent non-owner from emergency withdrawing", async function () {
      const initialBalance = await rewardToken.balanceOf(await stakingContract.getAddress());
      
      await expect(stakingContract.connect(attacker).emergencyWithdraw())
        .to.be.reverted;
        
      // Verify balance was not changed
      expect(await rewardToken.balanceOf(await stakingContract.getAddress())).to.equal(initialBalance);
    });
  });
}); 