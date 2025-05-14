const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("===== AlveyChain NFT 系统部署与验证 =====\n");
  
  // 部署过程开始
  console.log("开始部署合约...");
  
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", (await deployer.getBalance()).toString());
  
  // 1. 部署代币合约 (如果已有可跳过)
  console.log("\n部署 MARIO 代币合约...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const tokenContract = await MockERC20.deploy("MARIO Token", "MARIO");
  await tokenContract.waitForDeployment();
  const tokenAddress = await tokenContract.getAddress();
  console.log("MARIO 代币合约已部署:", tokenAddress);
  
  // 2. 部署 NFT 合约
  console.log("\n部署 AlveyNFT 合约...");
  const AlveyNFT = await ethers.getContractFactory("AlveyNFT");
  const nftContract = await AlveyNFT.deploy(tokenAddress);
  await nftContract.waitForDeployment();
  const nftAddress = await nftContract.getAddress();
  console.log("AlveyNFT 合约已部署:", nftAddress);
  
  // 3. 部署质押合约
  console.log("\n部署 NFT 质押合约...");
  const NFTStaking = await ethers.getContractFactory("NFTStaking");
  const stakingContract = await NFTStaking.deploy(nftAddress, tokenAddress);
  await stakingContract.waitForDeployment();
  const stakingAddress = await stakingContract.getAddress();
  console.log("NFT 质押合约已部署:", stakingAddress);
  
  // 4. 部署借贷合约
  console.log("\n部署 NFTLending 合约...");
  const NFTLending = await ethers.getContractFactory("NFTLending");
  const lendingContract = await NFTLending.deploy();
  await lendingContract.waitForDeployment();
  const lendingAddress = await lendingContract.getAddress();
  console.log("NFTLending 合约已部署:", lendingAddress);
  
  // 创建部署信息文件
  const deployInfo = {
    network: hre.network.name,
    tokenContract: tokenAddress,
    nftContract: nftAddress,
    stakingContract: stakingAddress,
    lendingContract: lendingAddress,
    timestamp: new Date().toISOString(),
    deployer: deployer.address
  };
  
  const deploymentPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath);
  }
  
  fs.writeFileSync(
    path.join(deploymentPath, `${hre.network.name}-deployment.json`),
    JSON.stringify(deployInfo, null, 2)
  );
  
  console.log("\n部署信息已保存到:", `deployments/${hre.network.name}-deployment.json`);
  
  // 验证部署的合约
  console.log("\n===== 验证部署的合约 =====");
  
  // 验证NFT合约
  console.log("\n验证 AlveyNFT 合约...");
  try {
    const nftDeployed = await ethers.getContractAt("AlveyNFT", nftAddress);
    const name = await nftDeployed.name();
    const symbol = await nftDeployed.symbol();
    console.log("- 名称:", name);
    console.log("- 符号:", symbol);
    console.log("- 支付代币:", await nftDeployed.paymentToken());
    console.log("- 铸造价格:", ethers.formatUnits(await nftDeployed.mintPrice(), 18));
    console.log("✅ AlveyNFT 合约验证成功");
  } catch (error) {
    console.error("❌ AlveyNFT 合约验证失败:", error.message);
  }
  
  // 验证质押合约
  console.log("\n验证 NFT 质押合约...");
  try {
    const stakingDeployed = await ethers.getContractAt("NFTStaking", stakingAddress);
    console.log("- NFT 合约:", await stakingDeployed.nft());
    console.log("- 奖励代币:", await stakingDeployed.rewardToken());
    console.log("- 每天奖励率:", await stakingDeployed.rewardRate());
    console.log("✅ NFT 质押合约验证成功");
  } catch (error) {
    console.error("❌ NFT 质押合约验证失败:", error.message);
  }
  
  // 验证借贷合约
  console.log("\n验证 NFTLending 合约...");
  try {
    const lendingDeployed = await ethers.getContractAt("NFTLending", lendingAddress);
    const owner = await lendingDeployed.owner();
    console.log("- 合约拥有者:", owner);
    const loanCount = await lendingDeployed.loanCounter();
    console.log("- 初始贷款计数:", loanCount.toString());
    console.log("✅ NFTLending 合约验证成功");
  } catch (error) {
    console.error("❌ NFTLending 合约验证失败:", error.message);
  }
  
  // 生成前端配置文件
  console.log("\n生成前端配置文件...");
  const frontendConfigPath = path.join(__dirname, "../frontend/src/contracts-config.js");
  const frontendConfig = `
// 自动生成的合约配置文件 - 请勿手动修改
// 生成时间: ${new Date().toISOString()}
// 网络: ${hre.network.name}

export const CONTRACT_ADDRESSES = {
  AlveyNFT: "${nftAddress}",
  MarioToken: "${tokenAddress}",
  NFTStaking: "${stakingAddress}",
  NFTLending: "${lendingAddress}"
};

export default CONTRACT_ADDRESSES;
`;

  fs.writeFileSync(frontendConfigPath, frontendConfig);
  console.log("✅ 前端配置文件已生成:", frontendConfigPath);
  
  // 进行简单的交互测试
  console.log("\n===== 进行基本交互测试 =====");
  
  // 铸造一个测试NFT
  console.log("\n尝试铸造一个测试NFT...");
  try {
    // 先给deployer铸造一些代币
    await tokenContract.mint(deployer.address, ethers.parseUnits("1000", 18));
    console.log("代币已铸造给部署者");
    
    // 批准NFT合约花费代币
    const mintPrice = await nftContract.mintPrice();
    await tokenContract.approve(nftAddress, mintPrice);
    console.log("已批准NFT合约花费代币");
    
    // 铸造NFT
    const mintTx = await nftContract.safeMint(deployer.address, "https://example.com/test-nft.json");
    await mintTx.wait();
    console.log("✅ 测试NFT铸造成功");
    
    // 检查NFT所有权
    const balance = await nftContract.balanceOf(deployer.address);
    console.log("- 部署者的NFT余额:", balance.toString());
    
    if (balance > 0) {
      const tokenId = await nftContract.tokenOfOwnerByIndex(deployer.address, 0);
      console.log("- 拥有的NFT ID:", tokenId.toString());
      
      // 尝试质押NFT
      console.log("\n尝试质押NFT...");
      await nftContract.approve(stakingAddress, tokenId);
      console.log("已批准质押合约转移NFT");
      
      const stakeTx = await stakingContract.stake(tokenId);
      await stakeTx.wait();
      console.log("✅ NFT质押成功");
      
      // 检查质押状态
      const stakedTokens = await stakingContract.getStakedTokens(deployer.address);
      console.log("- 质押的NFT:", stakedTokens.map(t => t.toString()).join(", "));
      
      // 尝试解除质押
      console.log("\n尝试解除质押...");
      const unstakeTx = await stakingContract.unstake(tokenId);
      await unstakeTx.wait();
      console.log("✅ NFT解除质押成功");
      
      // 检查NFT已返回
      const ownerAfterUnstake = await nftContract.ownerOf(tokenId);
      console.log("- NFT解除质押后的所有者:", ownerAfterUnstake);
      
      // 尝试创建借贷
      console.log("\n尝试创建NFT借贷...");
      await nftContract.approve(lendingAddress, tokenId);
      console.log("已批准借贷合约转移NFT");
      
      const loanAmount = ethers.parseUnits("100", 18);
      const loanDuration = 7 * 24 * 60 * 60; // 7天
      
      const createLoanTx = await lendingContract.createLoan(
        nftAddress,
        tokenId,
        loanAmount,
        loanDuration,
        tokenAddress
      );
      await createLoanTx.wait();
      console.log("✅ 借贷创建成功");
      
      // 检查借贷状态
      const loanId = 0; // 第一个贷款
      const loan = await lendingContract.getLoan(loanId);
      console.log("- 贷款ID:", loanId);
      console.log("- 借款人:", loan.borrower);
      console.log("- NFT合约:", loan.nftContract);
      console.log("- NFT ID:", loan.tokenId.toString());
      console.log("- 借款金额:", ethers.formatUnits(loan.amount, 18));
      console.log("- 借款期限:", loan.duration.toString(), "秒");
    }
  } catch (error) {
    console.error("❌ 交互测试失败:", error.message);
  }
  
  console.log("\n===== 部署与验证完成 =====");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 