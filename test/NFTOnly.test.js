const { expect } = require("chai");
const { ethers, hre } = require("./hardhat-ethers-helpers");

describe("AlveyNFT", function () {
  let nft;
  let token;
  let owner;
  let addr1;
  const tokenURI = "https://example.com/token/1";

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    // 部署 MockERC20
    const MockERC20 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    token = await MockERC20.deploy("Mock Token", "MTK", 18);
    await token.waitForDeployment();
    
    // 部署 NFT 合约
    const NFT = await ethers.getContractFactory("AlveyNFT");
    nft = await NFT.deploy(await token.getAddress());
    await nft.waitForDeployment();
  });

  it("Should have correct name and symbol", async function () {
    expect(await nft.name()).to.equal("AlveyNFT");
    expect(await nft.symbol()).to.equal("ALV");
  });

  it("Should set the right owner", async function () {
    expect(await nft.owner()).to.equal(owner.address);
  });

  it("Should set the correct mint price", async function () {
    const mintPrice = await nft.mintPrice();
    expect(mintPrice).to.equal(ethers.parseUnits("100", 18));
  });
});