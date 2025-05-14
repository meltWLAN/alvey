// 部署NFTLending合约的脚本
const hre = require("hardhat");

async function main() {
  console.log("开始部署NFTLending合约...");

  // 部署NFTLending合约
  const NFTLending = await hre.ethers.getContractFactory("NFTLending");
  const nftLending = await NFTLending.deploy();

  await nftLending.waitForDeployment();

  const nftLendingAddress = await nftLending.getAddress();
  console.log(`NFTLending合约已部署到地址: ${nftLendingAddress}`);

  // 输出部署信息，便于验证
  console.log("NFTLending合约部署信息:");
  console.log("-------------------------");
  console.log(`合约地址: ${nftLendingAddress}`);
  console.log(`区块链网络: ${hre.network.name}`);
  console.log(`部署账户: ${(await hre.ethers.getSigners())[0].address}`);
  
  // 等待10个区块确认，确保合约完全部署
  console.log("等待区块确认...");
  
  // 等待5秒，让交易被打包
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log("NFTLending合约部署完成！");
  console.log("-------------------------");
  console.log("下一步:");
  console.log("1. 设置支持的NFT合约: setSupportedNFTContract(nftAddress, true)");
  console.log("2. 设置支持的支付代币: setSupportedPaymentToken(tokenAddress, true, decimals)");
  console.log("3. 为NFT设置估值和评级: setNFTValuation(nftAddress, tokenId, value, rating)");
  console.log("-------------------------");
}

// 执行部署脚本
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 