const hre = require("hardhat");
const { getAddress } = require("ethers");

async function main() {
  console.log("开始部署到 AlveyChain...");

  try {
    // 获取部署账户
    const [deployer] = await hre.ethers.getSigners();
    console.log(`使用账户地址部署: ${deployer.address}`);
    console.log(`账户余额: ${hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ALV`);

    // Mario代币合约地址 - 使用 getAddress 确保校验和正确
    const MARIO_TOKEN_ADDRESS = "0x0D8318C1C2C36a1f614Ca17af77Cb3D5c0cC7e10";
    
    // 确保地址正确 - 根据需要修改此地址
    const checkedAddress = getAddress(MARIO_TOKEN_ADDRESS.toLowerCase());
    console.log(`使用 Mario 代币地址: ${checkedAddress}`);

    // 部署 AlveyNFT 合约
    console.log("部署 AlveyNFT 合约...");
    const NFT = await hre.ethers.getContractFactory("AlveyNFT");
    const nft = await NFT.deploy(checkedAddress);
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log(`AlveyNFT 部署成功，地址: ${nftAddress}`);

    // 部署质押合约
    console.log("部署 StakingContract 合约...");
    const StakingContract = await hre.ethers.getContractFactory("StakingContract");
    const staking = await StakingContract.deploy(nftAddress, checkedAddress);
    await staking.waitForDeployment();
    console.log(`StakingContract 部署成功，地址: ${await staking.getAddress()}`);

    // 打印合约信息用于前端配置
    console.log("\n前端配置信息:");
    console.log(`NFT_CONTRACT_ADDRESS="${nftAddress}"`);
    console.log(`STAKING_CONTRACT_ADDRESS="${await staking.getAddress()}"`);
    console.log(`MARIO_TOKEN_ADDRESS="${checkedAddress}"`);
    
    console.log("\n部署完成！");
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