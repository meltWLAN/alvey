const hre = require("hardhat");

async function main() {
  console.log("开始铸造 NFT (简化版)...");

  try {
    // 使用部署的合约地址
    const NFT_CONTRACT_ADDRESS = "0x2680952E8a35f4d210393bb19DBEFAf5aC172fbE";
    
    // 获取部署账户
    const [deployer] = await hre.ethers.getSigners();
    console.log(`使用账户地址: ${deployer.address}`);
    console.log(`账户余额: ${hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ALV`);
    
    // 连接到 NFT 合约
    const nftContract = await hre.ethers.getContractAt("AlveyNFT", NFT_CONTRACT_ADDRESS);
    
    // 查询铸造价格
    try {
      const mintPrice = await nftContract.mintPrice();
      console.log(`NFT 铸造价格: ${hre.ethers.formatUnits(mintPrice, 18)} MARIO`);
    } catch (error) {
      console.error("获取铸造价格失败:", error.message);
    }
    
    // 尝试直接铸造 NFT (注意：这需要已经授权代币)
    console.log("\n尝试铸造 NFT...");
    
    try {
      const mintTx = await nftContract.safeMint(deployer.address, "https://alveychain.com/nft/example1.json");
      console.log("等待交易确认...");
      const receipt = await mintTx.wait();
      console.log(`NFT 铸造成功，交易哈希: ${mintTx.hash}`);
    } catch (error) {
      console.error("\n铸造 NFT 失败。可能的原因:");
      console.error("1. Mario 代币余额不足");
      console.error("2. 未授权 NFT 合约使用 Mario 代币");
      console.error("3. 其他合约错误");
      console.error("\n错误详情:", error.message);
    }
    
  } catch (error) {
    console.error("脚本执行过程中发生错误:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 