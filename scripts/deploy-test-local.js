const hre = require("hardhat");

async function main() {
  console.log("开始本地测试部署...");

  try {
    // 获取部署账户
    const [deployer] = await hre.ethers.getSigners();
    console.log(`使用账户地址部署: ${deployer.address}`);
    console.log(`账户余额: ${hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);

    // 部署模拟代币
    console.log("\n部署测试代币...");
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const token = await MockERC20.deploy("Test Token", "TST");
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log(`测试代币部署成功，地址: ${tokenAddress}`);

    // 部署MetaverseXNFT
    console.log("\n部署NFT合约...");
    const MetaverseXNFT = await hre.ethers.getContractFactory("MetaverseXNFT");
    const nft = await MetaverseXNFT.deploy(tokenAddress);
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log(`NFT合约部署成功，地址: ${nftAddress}`);

    console.log("\n测试部署完成");

  } catch (error) {
    console.error("部署过程中发生错误:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 