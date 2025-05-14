// 部署到测试网的脚本
// 注意：实际部署前请确保.env文件中有正确的私钥，且钱包中有足够的ALV代币

const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("===== AlveyChain NFT 测试网部署流程 =====");
  console.log("这是一个模拟部署流程，实际部署时请确保有正确的私钥和足够的代币");
  console.log("");

  try {
    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log(`使用账户地址部署: ${deployer.address}`);
    console.log(`账户余额: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ALV`);
    console.log("");

    // 部署一个模拟的支付代币
    console.log("1. 部署模拟支付代币 (MockERC20)...");
    const MockERC20 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    const paymentToken = await MockERC20.deploy("Mario Token", "MARIO", 18);
    await paymentToken.waitForDeployment();
    const paymentTokenAddress = await paymentToken.getAddress();
    console.log(`   - 支付代币部署成功，地址: ${paymentTokenAddress}`);
    
    // 铸造一些代币给部署者
    const mintAmount = ethers.parseEther("1000000");
    await paymentToken.mint(deployer.address, mintAmount);
    console.log(`   - 向部署者铸造了 1,000,000 MARIO 代币`);
    console.log("");

    // 部署NFT合约
    console.log("2. 部署 AlveyNFT 合约...");
    const NFT = await ethers.getContractFactory("AlveyNFT");
    const nft = await NFT.deploy(paymentTokenAddress);
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log(`   - NFT合约部署成功，地址: ${nftAddress}`);
    console.log("");

    // 部署质押合约
    console.log("3. 部署质押合约 (StakingContract)...");
    const Staking = await ethers.getContractFactory("StakingContract");
    const staking = await Staking.deploy(nftAddress, paymentTokenAddress);
    await staking.waitForDeployment();
    const stakingAddress = await staking.getAddress();
    console.log(`   - 质押合约部署成功，地址: ${stakingAddress}`);
    console.log("");

    // 进行铸造测试
    console.log("4. 测试铸造NFT...");
    // 授权NFT合约使用支付代币
    const mintPrice = await nft.mintPrice();
    console.log(`   - NFT铸造价格: ${ethers.formatEther(mintPrice)} MARIO`);
    
    await paymentToken.approve(nftAddress, mintPrice);
    console.log(`   - 授权NFT合约使用支付代币成功`);
    
    // 铸造一个NFT
    const tx = await nft.safeMint(deployer.address, "https://example.com/token/1");
    await tx.wait();
    console.log(`   - NFT铸造成功，交易哈希: ${tx.hash}`);
    console.log(`   - 当前NFT总量: ${await nft.totalSupply()}`);
    console.log("");

    // 测试质押功能
    console.log("5. 测试质押功能...");
    // 授权质押合约操作NFT
    await nft.setApprovalForAll(stakingAddress, true);
    console.log(`   - 授权质押合约操作NFT成功`);
    
    // 质押NFT
    const tokenId = 1; // 第一个铸造的NFT
    await staking.stake(tokenId);
    console.log(`   - NFT #${tokenId} 质押成功`);
    console.log(`   - 当前质押总量: ${await staking.totalStaked()}`);
    console.log("");

    // 验证合约提示
    console.log("===== 完成部署 =====");
    console.log("要在区块浏览器上验证合约，请运行以下命令：");
    console.log("");
    console.log(`npx hardhat verify --network alveychainTestnet ${paymentTokenAddress} "Mario Token" "MARIO" 18`);
    console.log(`npx hardhat verify --network alveychainTestnet ${nftAddress} ${paymentTokenAddress}`);
    console.log(`npx hardhat verify --network alveychainTestnet ${stakingAddress} ${nftAddress} ${paymentTokenAddress}`);
    console.log("");

    // 前端配置
    console.log("===== 前端配置 =====");
    console.log("请在frontend/src/config.js中使用以下合约地址：");
    console.log("");
    console.log(`export const CONTRACT_ADDRESSES = {`);
    console.log(`  nftContract: "${nftAddress}",`);
    console.log(`  paymentToken: "${paymentTokenAddress}",`);
    console.log(`  stakingContract: "${stakingAddress}"`);
    console.log(`};`);
    console.log("");

    // 部署前端提示
    console.log("===== 部署前端 =====");
    console.log("1. 更新前端配置文件");
    console.log("2. 构建前端: cd frontend && npm install && npm run build");
    console.log("3. 将build文件夹部署到Vercel、Netlify或其他托管服务");
    console.log("");

    console.log("模拟部署流程完成！实际部署请确保有正确的私钥和资金。");

  } catch (error) {
    console.error("部署过程中出错:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 