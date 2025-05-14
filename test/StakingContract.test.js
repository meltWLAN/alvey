const { expect } = require("chai");
const { ethers, hre } = require("./hardhat-ethers-helpers");

describe("StakingContract", function () {
  let nft;
  let token;
  let staking;
  let owner;
  let addr1;
  let addr2;
  const tokenURI = "https://example.com/token/1";

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy MockERC20 for rewards
    const MockERC20 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    token = await MockERC20.deploy("Reward Token", "RWD", 18);
    await token.waitForDeployment();
    
    // Deploy NFT contract
    const NFT = await ethers.getContractFactory("AlveyNFT");
    nft = await NFT.deploy(await token.getAddress());
    await nft.waitForDeployment();
    
    // Deploy Staking contract
    const Staking = await ethers.getContractFactory("StakingContract");
    staking = await Staking.deploy(await nft.getAddress(), await token.getAddress());
    await staking.waitForDeployment();
    
    // Mint tokens to owner
    await token.mint(owner.address, ethers.parseUnits("1000000", 18));
    
    // Transfer tokens to addr1 and addr2
    await token.transfer(addr1.address, ethers.parseUnits("100000", 18));
    await token.transfer(addr2.address, ethers.parseUnits("100000", 18));

    // Transfer reward tokens to staking contract
    await token.transfer(await staking.getAddress(), ethers.parseUnits("100000", 18));
  });

  describe("Basic Staking", function () {
    it("Should allow staking NFT", async function () {
      // Mint NFT to addr1
      const mintPrice = await nft.mintPrice();
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
      await nft.connect(addr1).safeMint(addr1.address, tokenURI);
      
      // Approve staking contract
      await nft.connect(addr1).approve(await staking.getAddress(), 1);
      
      // Stake NFT
      await staking.connect(addr1).stake(1);
      
      expect(await nft.ownerOf(1)).to.equal(await staking.getAddress());
      const stakes = await staking.getUserStakes(addr1.address);
      expect(stakes.length).to.equal(1);
      expect(stakes[0]).to.equal(1n);
    });

    it("Should fail if not NFT owner", async function () {
      // Mint NFT to addr1
      const mintPrice = await nft.mintPrice();
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
      await nft.connect(addr1).safeMint(addr1.address, tokenURI);
      
      // addr2尝试质押不存在的tokenId
      await expect(
        staking.connect(addr2).stake(2)
      ).to.be.revertedWith("ERC721: invalid token ID");
    });

    it("Should fail if not approved", async function () {
      // Mint NFT to addr1
      const mintPrice = await nft.mintPrice();
      await token.connect(addr1).approve(await nft.getAddress(), mintPrice);
      await nft.connect(addr1).safeMint(addr1.address, tokenURI);
      
      await expect(
        staking.connect(addr1).stake(1)
      ).to.be.revertedWith("ERC721: caller is not token owner or approved");
    });
  });
}); 