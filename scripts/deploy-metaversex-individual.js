const hre = require("hardhat");
const { getAddress } = require("ethers");

async function main() {
  console.log("开始部署 MetaverseX 合约系统（单独部署方式）...");

  try {
    // 获取部署账户
    const [deployer] = await hre.ethers.getSigners();
    console.log(`使用账户地址部署: ${deployer.address}`);
    console.log(`账户余额: ${hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ALV`);

    // 首先部署模拟代币作为支付代币
    console.log("\n部署支付代币...");
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const paymentToken = await MockERC20.deploy("MetaverseX Token", "MVX");
    await paymentToken.waitForDeployment();
    const paymentTokenAddress = await paymentToken.getAddress();
    console.log(`支付代币部署成功，地址: ${paymentTokenAddress}`);

    // 为部署账户铸造一些代币
    const mintAmount = hre.ethers.parseUnits("10000000", 18); // 1000万代币
    const mintTx = await paymentToken.mint(deployer.address, mintAmount);
    await mintTx.wait();
    console.log(`为部署账户铸造了 ${hre.ethers.formatUnits(mintAmount, 18)} MVX 代币`);

    // 部署NFT合约
    console.log("\n部署 MetaverseXNFT 合约...");
    const MetaverseXNFT = await hre.ethers.getContractFactory("MetaverseXNFT");
    const nftContract = await MetaverseXNFT.deploy(paymentTokenAddress);
    await nftContract.waitForDeployment();
    const nftAddress = await nftContract.getAddress();
    console.log(`MetaverseXNFT 部署成功，地址: ${nftAddress}`);

    // 部署空间合约
    console.log("\n部署 MetaverseSpace 合约...");
    const MetaverseSpace = await hre.ethers.getContractFactory("MetaverseSpace");
    const spaceContract = await MetaverseSpace.deploy(paymentTokenAddress);
    await spaceContract.waitForDeployment();
    const spaceAddress = await spaceContract.getAddress();
    console.log(`MetaverseSpace 部署成功，地址: ${spaceAddress}`);

    // 部署市场合约
    console.log("\n部署 MetaverseMarket 合约...");
    const MetaverseMarket = await hre.ethers.getContractFactory("MetaverseMarket");
    const marketContract = await MetaverseMarket.deploy();
    await marketContract.waitForDeployment();
    const marketAddress = await marketContract.getAddress();
    console.log(`MetaverseMarket 部署成功，地址: ${marketAddress}`);

    // 设置创建者版税
    const setRoyaltyTx = await marketContract.setCreatorRoyalty(nftAddress, 1000); // 10%
    await setRoyaltyTx.wait();
    console.log("设置NFT创建者版税成功");

    // 打印部署摘要和交互信息
    console.log("\n============= MetaverseX 部署完成 =============");
    console.log("支付代币地址:", paymentTokenAddress);
    console.log("NFT 合约地址:", nftAddress);
    console.log("空间合约地址:", spaceAddress);
    console.log("市场合约地址:", marketAddress);
    console.log("\n前端配置:");
    console.log(`REACT_APP_PAYMENT_TOKEN="${paymentTokenAddress}"`);
    console.log(`REACT_APP_NFT_CONTRACT="${nftAddress}"`);
    console.log(`REACT_APP_SPACE_CONTRACT="${spaceAddress}"`);
    console.log(`REACT_APP_MARKET_CONTRACT="${marketAddress}"`);
    console.log("\n接下来的步骤:");
    console.log("1. 配置前端应用");
    console.log("2. 通过合约创建更多虚拟空间");
    console.log("3. 铸造更多3D资产NFT");
    console.log("4. 设置市场参数和版税");
    console.log("================================================");

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