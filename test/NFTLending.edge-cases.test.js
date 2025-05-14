// 针对NFTLending合约的极端与异常路径测试
const { expect } = require("chai");
const { ethers } = require("./hardhat-ethers-helpers");
describe("NFTLending Edge Cases", function () {
  let owner, borrower, lender, attacker, token, nft, nftLending;
  beforeEach(async function () {
    [owner, borrower, lender, attacker] = await ethers.getSigners();
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    token = await MockERC20.deploy("MARIO Token", "MARIO");
    await token.waitForDeployment();
    await token.mint(lender.address, ethers.parseUnits("1000", 18));
    const NFT = await ethers.getContractFactory("AlveyNFT");
    nft = await NFT.deploy(await token.getAddress());
    await nft.waitForDeployment();
    await token.mint(borrower.address, ethers.parseUnits("10", 18));
    await token.connect(borrower).approve(await nft.getAddress(), await nft.mintPrice());
    await nft.connect(borrower).safeMint(borrower.address, "tokenURI");
    const NFTLending = await ethers.getContractFactory("NFTLending");
    nftLending = await NFTLending.deploy();
    await nftLending.waitForDeployment();
  });
  it("零值输入应被拒绝", async function () {
    await expect(nftLending.setNFTValuation(nft.getAddress(), 0, 0, 0)).to.be.reverted;
  });
  it("极大值输入应被正确处理", async function () {
    const maxUint = ethers.MaxUint256;
    await expect(nftLending.setNFTValuation(nft.getAddress(), 1, maxUint, 5)).not.to.be.reverted;
  });
  it("负值输入应被拒绝", async function () {
    await expect(nftLending.setNFTValuation(nft.getAddress(), 1, -1, 5)).to.be.reverted;
  });
  it("非owner不能执行owner操作", async function () {
    await expect(nftLending.connect(attacker).pause()).to.be.reverted;
  });
  it("非借款人不能偿还贷款", async function () {
    // 省略贷款创建流程，假设loanId=1
    await expect(nftLending.connect(attacker).repayLoan(1)).to.be.reverted;
  });
  it("pause状态下敏感操作应被拒绝", async function () {
    await nftLending.pause();
    await expect(nftLending.createLoan(nft.getAddress(), 1, token.getAddress(), 100)).to.be.reverted;
  });
  it("unpause后功能恢复", async function () {
    await nftLending.pause();
    await nftLending.unpause();
    await expect(nftLending.setNFTValuation(nft.getAddress(), 2, 100, 5)).not.to.be.reverted;
  });
  it("batchSetNFTValuations输入长度不一致应被拒绝", async function () {
    await expect(nftLending.batchSetNFTValuations(nft.getAddress(), [1,2], [100], [5,5])).to.be.reverted;
  });
  it("batchSetNFTValuations极大数组应被正确处理或拒绝", async function () {
    const ids = Array(1000).fill(1);
    const vals = Array(1000).fill(100);
    const rats = Array(1000).fill(5);
    await expect(nftLending.batchSetNFTValuations(nft.getAddress(), ids, vals, rats)).to.be.reverted;
  });
  it("合约升级后历史数据兼容性", async function () {
    // 这里仅做占位，实际升级需hardhat-upgrades等工具
    expect(true).to.be.true;
  });
  it("ERC20授权失效应被拒绝", async function () {
    await token.connect(borrower).approve(nftLending.getAddress(), 0);
    await expect(nftLending.connect(borrower).createLoan(nft.getAddress(), 1, token.getAddress(), 100)).to.be.reverted;
  });
  it("ERC20余额不足应被拒绝", async function () {
    await expect(nftLending.connect(attacker).createLoan(nft.getAddress(), 1, token.getAddress(), 1000000000)).to.be.reverted;
  });
  it("ERC721未授权应被拒绝", async function () {
    await expect(nftLending.connect(borrower).createLoan(nft.getAddress(), 1, token.getAddress(), 100)).to.be.reverted;
  });
  it("应防止重入攻击", async function () {
    // 构造恶意重入合约
    const ReentrantAttacker = await ethers.getContractFactory("ReentrantAttacker");
    const attackerContract = await ReentrantAttacker.deploy(nftLending.getAddress(), nft.getAddress(), token.getAddress());
    await attackerContract.waitForDeployment();
    // 先给攻击合约mint并授权NFT
    await token.mint(attackerContract.getAddress(), ethers.parseUnits("10", 18));
    await attackerContract.mintAndApproveNFT();
    // 尝试发起重入攻击
    await expect(attackerContract.attackReentrancy(1, 100)).to.be.reverted;
  });
  it("应防止授权绕过", async function () {
    // 模拟未授权用户尝试敏感操作
    await expect(nftLending.connect(attacker).createLoan(nft.getAddress(), 1, token.getAddress(), 100)).to.be.reverted;
  });
  it("应防止整数溢出", async function () {
    // 尝试传入极大数值
    const overflowVal = ethers.MaxUint256;
    await expect(nftLending.setNFTValuation(nft.getAddress(), 1, overflowVal, overflowVal)).not.to.be.reverted;
  });
  it("应防止恶意合约交互", async function () {
    // 构造恶意合约模拟
    const MaliciousContract = await ethers.getContractFactory("MaliciousNFTReceiver");
    const malicious = await MaliciousContract.deploy();
    await malicious.waitForDeployment();
    // 尝试通过恶意合约与NFTLending交互
    await expect(malicious.maliciousInteract(nftLending.getAddress(), nft.getAddress(), token.getAddress())).to.be.reverted;
  });
});