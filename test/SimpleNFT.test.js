const { expect } = require("chai");
const { ethers, hre } = require("./hardhat-ethers-helpers");

describe("AlveyNFTSimple", function () {
  let nft;
  let owner;
  let addr1;
  let mockToken;

  beforeEach(async function () {
    // 获取测试账户
    [owner, addr1] = await ethers.getSigners();
    
    // 部署一个模拟的 ERC20 代币
    const MockToken = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    mockToken = await MockToken.deploy("MockToken", "MTK", 18);
    await mockToken.waitForDeployment();
    
    // 部署 NFT 合约
    const NFT = await ethers.getContractFactory("AlveyNFTSimple");
    nft = await NFT.deploy(await mockToken.getAddress());
    await nft.waitForDeployment();
    
    // 给测试账户一些代币
    await mockToken.mint(owner.address, ethers.parseUnits("2000000", 18));
    await mockToken.mint(addr1.address, ethers.parseUnits("2000000", 18));
  });

  it("Should have correct name and symbol", async function () {
    expect(await nft.name()).to.equal("AlveyNFT");
    expect(await nft.symbol()).to.equal("ALV");
  });

  it("Should set the right owner", async function () {
    expect(await nft.owner()).to.equal(owner.address);
  });

  it("Should allow minting with approved tokens", async function () {
    const tokenURI = "https://example.com/token/1";
    const mintPrice = await nft.mintPrice();
    
    // 授权 NFT 合约使用代币
    await mockToken.approve(await nft.getAddress(), mintPrice);
    
    // 铸造 NFT
    await nft.safeMint(owner.address, tokenURI);
    
    // 验证 NFT 的所有权和 URI
    expect(await nft.ownerOf(1)).to.equal(owner.address);
    expect(await nft.tokenURI(1)).to.equal(tokenURI);
  });

  it("Should allow owner to withdraw tokens", async function () {
    const mintPrice = await nft.mintPrice();
    
    // 授权并铸造
    await mockToken.approve(await nft.getAddress(), mintPrice);
    await nft.safeMint(owner.address, "https://example.com/token/1");
    
    // 检查合约余额
    const contractBalance = await mockToken.balanceOf(await nft.getAddress());
    expect(contractBalance).to.equal(mintPrice);
    
    // 提取前记录余额
    const initialOwnerBalance = await mockToken.balanceOf(owner.address);
    
    // 提取代币
    await nft.withdrawTokens();
    
    // 验证提取后的余额
    expect(await mockToken.balanceOf(await nft.getAddress())).to.equal(0);
    const newOwnerBalance = await mockToken.balanceOf(owner.address);
    expect(newOwnerBalance).to.equal(initialOwnerBalance + contractBalance);
  });
});