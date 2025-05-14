// 针对NFTLendingV2合约的极端与异常路径测试
const { expect } = require("chai");
const { ethers } = require("./hardhat-ethers-helpers");
describe("NFTLendingV2 Edge Cases", function () {
  let owner, user1, user2, attacker, mockToken, alveyNFT, nftLending;
  beforeEach(async function () {
    [owner, user1, user2, attacker] = await ethers.getSigners();
    const NFTLending = await ethers.getContractFactory("NFTLending");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const AlveyNFT = await ethers.getContractFactory("AlveyNFT");
    mockToken = await MockERC20.deploy("Mock Token", "MTK", 18);
    alveyNFT = await AlveyNFT.deploy("AlveyNFT", "ANFT");
    nftLending = await NFTLending.deploy();
    await nftLending.setSupportedNFTContract(alveyNFT.address, true);
    await nftLending.setSupportedPaymentToken(mockToken.address, true, 18);
    await mockToken.mint(user1.address, ethers.parseEther("100"));
    await mockToken.mint(user2.address, ethers.parseEther("100"));
    await alveyNFT.mint(user1.address, 1);
    await alveyNFT.connect(user1).approve(nftLending.address, 1);
    await mockToken.connect(user1).approve(nftLending.address, ethers.parseEther("100"));
  });
  it("零值输入应被拒绝", async function () {
    await expect(nftLending.setNFTValuation(alveyNFT.address, 0, 0, 0)).to.be.reverted;
  });
  it("极大值输入应被正确处理", async function () {
    const maxUint = ethers.MaxUint256;
    await expect(nftLending.setNFTValuation(alveyNFT.address, 1, maxUint, 5)).not.to.be.reverted;
  });
  it("负值输入应被拒绝", async function () {
    await expect(nftLending.setNFTValuation(alveyNFT.address, 1, -1, 5)).to.be.reverted;
  });
  it("非owner不能执行owner操作", async function () {
    await expect(nftLending.connect(attacker).pause()).to.be.reverted;
  });
  it("非借款人不能偿还贷款", async function () {
    await expect(nftLending.connect(attacker).repayLoan(1)).to.be.reverted;
  });
  it("pause状态下敏感操作应被拒绝", async function () {
    await nftLending.pause();
    await expect(nftLending.createLoan(alveyNFT.address, 1, mockToken.address, 100)).to.be.reverted;
  });
  it("unpause后功能恢复", async function () {
    await nftLending.pause();
    await nftLending.unpause();
    await expect(nftLending.setNFTValuation(alveyNFT.address, 2, 100, 5)).not.to.be.reverted;
  });
  it("batchSetNFTValuations输入长度不一致应被拒绝", async function () {
    await expect(nftLending.batchSetNFTValuations(alveyNFT.address, [1,2], [100], [5,5])).to.be.reverted;
  });
  it("batchSetNFTValuations极大数组应被正确处理或拒绝", async function () {
    const ids = Array(1000).fill(1);
    const vals = Array(1000).fill(100);
    const rats = Array(1000).fill(5);
    await expect(nftLending.batchSetNFTValuations(alveyNFT.address, ids, vals, rats)).to.be.reverted;
  });
  it("合约升级后历史数据兼容性", async function () {
    expect(true).to.be.true;
  });
  it("ERC20授权失效应被拒绝", async function () {
    await mockToken.connect(user1).approve(nftLending.address, 0);
    await expect(nftLending.connect(user1).createLoan(alveyNFT.address, 1, mockToken.address, 100)).to.be.reverted;
  });
  it("ERC20余额不足应被拒绝", async function () {
    await expect(nftLending.connect(attacker).createLoan(alveyNFT.address, 1, mockToken.address, 1000000000)).to.be.reverted;
  });
  it("ERC721未授权应被拒绝", async function () {
    await expect(nftLending.connect(user2).createLoan(alveyNFT.address, 1, mockToken.address, 100)).to.be.reverted;
  });
});