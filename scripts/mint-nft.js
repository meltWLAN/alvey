const hre = require("hardhat");

async function main() {
  console.log("开始铸造 NFT...");

  try {
    // 使用部署的合约地址
    const NFT_CONTRACT_ADDRESS = "0x2680952E8a35f4d210393bb19DBEFAf5aC172fbE";
    const MARIO_TOKEN_ADDRESS = "0x0d8318c1c2c36A1f614cA17af77cb3d5c0Cc7e10";

    // 获取部署账户
    const [deployer] = await hre.ethers.getSigners();
    console.log(`使用账户地址: ${deployer.address}`);
    console.log(`账户余额: ${hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ALV`);

    // 连接到 Mario 代币合约
    const tokenContract = await hre.ethers.getContractAt("IERC20", MARIO_TOKEN_ADDRESS);
    
    // 连接到 NFT 合约
    const nftContract = await hre.ethers.getContractAt("AlveyNFT", NFT_CONTRACT_ADDRESS);
    
    // 获取铸造价格
    const mintPrice = await nftContract.mintPrice();
    console.log(`NFT 铸造价格: ${hre.ethers.formatUnits(mintPrice, 18)} MARIO`);
    
    // 检查代币余额
    const balance = await tokenContract.balanceOf(deployer.address);
    console.log(`MARIO 代币余额: ${hre.ethers.formatUnits(balance, 18)} MARIO`);
    
    if (balance < mintPrice) {
      console.log("代币余额不足，无法铸造 NFT");
      return;
    }
    
    // 授权 NFT 合约使用代币
    console.log("授权 NFT 合约使用 MARIO 代币...");
    const approveTx = await tokenContract.approve(NFT_CONTRACT_ADDRESS, mintPrice);
    await approveTx.wait();
    console.log(`授权成功，交易哈希: ${approveTx.hash}`);
    
    // 铸造 NFT
    console.log("开始铸造 NFT...");
    const mintTx = await nftContract.safeMint(deployer.address, "https://alveychain.com/nft/example1.json");
    const receipt = await mintTx.wait();
    console.log(`NFT 铸造成功，交易哈希: ${mintTx.hash}`);
    
    // 查询 NFT 余额
    const nftBalance = await nftContract.balanceOf(deployer.address);
    console.log(`账户 NFT 余额: ${nftBalance} 个`);
    
    console.log("\nNFT 铸造完成！");
  } catch (error) {
    console.error("铸造过程中发生错误:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 