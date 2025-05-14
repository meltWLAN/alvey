const hre = require("hardhat");

async function main() {
  console.log("开始质押 NFT...");

  try {
    // 使用部署的合约地址
    const NFT_CONTRACT_ADDRESS = "0x2680952E8a35f4d210393bb19DBEFAf5aC172fbE";
    const STAKING_CONTRACT_ADDRESS = "0x71732a888B75FAe17c0A994E7cF96ce398154EaF";

    // 获取部署账户
    const [deployer] = await hre.ethers.getSigners();
    console.log(`使用账户地址: ${deployer.address}`);
    
    // 连接到 NFT 合约
    const nftContract = await hre.ethers.getContractAt("AlveyNFT", NFT_CONTRACT_ADDRESS);
    
    // 连接到质押合约
    const stakingContract = await hre.ethers.getContractAt("StakingContract", STAKING_CONTRACT_ADDRESS);
    
    // 检查 NFT 余额
    const nftBalance = await nftContract.balanceOf(deployer.address);
    console.log(`账户 NFT 余额: ${nftBalance} 个`);
    
    if (nftBalance.toString() === "0") {
      console.log("账户没有 NFT，无法质押");
      return;
    }
    
    // 获取第一个 NFT 的代币 ID (此处假设是代币 ID 1)
    const tokenId = 1;
    
    // 验证 NFT 所有权
    try {
      const owner = await nftContract.ownerOf(tokenId);
      console.log(`代币 ID ${tokenId} 的所有者是: ${owner}`);
      
      if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
        console.log(`您不是代币 ID ${tokenId} 的所有者，无法质押`);
        return;
      }
    } catch (error) {
      console.log(`代币 ID ${tokenId} 不存在或查询出错`);
      return;
    }
    
    // 授权质押合约操作 NFT
    console.log("授权质押合约操作 NFT...");
    const approveTx = await nftContract.approve(STAKING_CONTRACT_ADDRESS, tokenId);
    await approveTx.wait();
    console.log(`授权成功，交易哈希: ${approveTx.hash}`);
    
    // 质押 NFT
    console.log("开始质押 NFT...");
    const stakeTx = await stakingContract.stake(tokenId);
    const receipt = await stakeTx.wait();
    console.log(`NFT 质押成功，交易哈希: ${stakeTx.hash}`);
    
    // 查询质押的 NFT
    const userStakes = await stakingContract.getUserStakes(deployer.address);
    console.log(`账户质押的 NFT: ${userStakes.join(", ")}`);
    
    console.log("\nNFT 质押完成！");
  } catch (error) {
    console.error("质押过程中发生错误:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 