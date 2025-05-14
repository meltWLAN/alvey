const hre = require("hardhat");

async function main() {
  console.log("开始部署 MetaverseX 合约系统...");

  try {
    // 获取部署账户
    const [deployer] = await hre.ethers.getSigners();
    console.log(`使用账户地址部署: ${deployer.address}`);
    console.log(`账户余额: ${hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ALV`);

    // 首先部署模拟代币作为支付代币
    console.log("\n部署支付代币...");
    const MockERC20 = await hre.ethers.getContractFactory("contracts/MockERC20.sol:MockERC20");
    const paymentToken = await MockERC20.deploy("MetaverseX Token", "MVX", 18); // 添加decimals参数
    await paymentToken.waitForDeployment();
    const paymentTokenAddress = await paymentToken.getAddress();
    console.log(`支付代币部署成功，地址: ${paymentTokenAddress}`);

    // 为部署账户铸造一些代币
    const mintAmount = hre.ethers.parseUnits("10000000", 18); // 1000万代币
    const mintTx = await paymentToken.mint(deployer.address, mintAmount);
    await mintTx.wait();
    console.log(`为部署账户铸造了 ${hre.ethers.formatUnits(mintAmount, 18)} MVX 代币`);

    // 部署 MetaverseXNFT 合约
    console.log("\n部署 MetaverseXNFT 合约...");
    const MetaverseXNFT = await hre.ethers.getContractFactory("MetaverseXNFT");
    const nft = await MetaverseXNFT.deploy(paymentTokenAddress);
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log(`MetaverseXNFT 部署成功，地址: ${nftAddress}`);

    // 部署 NFTLending 合约
    console.log("\n部署 NFTLending 合约...");
    const NFTLending = await hre.ethers.getContractFactory("NFTLending");
    const lending = await NFTLending.deploy();
    await lending.waitForDeployment();
    const lendingAddress = await lending.getAddress();
    console.log(`NFTLending 部署成功，地址: ${lendingAddress}`);

    // 部署 MetaverseXFactory 合约
    console.log("\n部署 MetaverseXFactory 合约...");
    const MetaverseXFactory = await hre.ethers.getContractFactory("MetaverseXFactory");
    const factory = await MetaverseXFactory.deploy(paymentTokenAddress);
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log(`MetaverseXFactory 部署成功，地址: ${factoryAddress}`);

    // 设置 NFTLending 支持的抵押代币
    console.log("\n配置 NFTLending 合约...");
    const addCollateralTx = await lending.addCollateralToken(paymentTokenAddress);
    await addCollateralTx.wait();
    console.log(`已添加 ${paymentTokenAddress} 作为支持的抵押代币`);

    // 准备铸造示例NFT
    console.log("\n准备铸造示例NFT...");
    
    // 先授权NFT合约使用代币
    const approveTx = await paymentToken.approve(nftAddress, hre.ethers.parseUnits("1000", 18));
    await approveTx.wait();
    console.log("授权NFT合约使用代币成功");
    
    // 铸造示例NFT
    const mintNftTx = await nft.mintAsset(
      "https://metaversex.example/nfts/example.json", 
      "land", 
      3 // 稀有度 (1-5)
    );
    await mintNftTx.wait();
    console.log("示例NFT铸造成功");

    // 通过工厂创建一个新的NFT集合
    console.log("\n通过工厂创建新的NFT集合...");
    
    // 先授权工厂合约使用代币
    const approveFactoryTx = await paymentToken.approve(factoryAddress, hre.ethers.parseUnits("1000", 18));
    await approveFactoryTx.wait();
    
    const createCollectionTx = await factory.createCollection(
      "Fantasy Collection",
      "FNT",
      true // 立即注册
    );
    await createCollectionTx.wait();
    console.log("新的NFT集合创建成功");

    // 获取工厂创建的集合数量
    const collectionsCount = await factory.getCollectionsCount();
    console.log(`当前工厂管理的集合数量: ${collectionsCount}`);

    // 打印部署摘要和下一步信息
    console.log("\n============= MetaverseX 部署完成 =============");
    console.log("支付代币地址:", paymentTokenAddress);
    console.log("MetaverseXNFT 合约地址:", nftAddress);
    console.log("NFTLending 合约地址:", lendingAddress);
    console.log("MetaverseXFactory 合约地址:", factoryAddress);
    
    console.log("\n前端配置:");
    console.log(`REACT_APP_PAYMENT_TOKEN="${paymentTokenAddress}"`);
    console.log(`REACT_APP_NFT_CONTRACT="${nftAddress}"`);
    console.log(`REACT_APP_LENDING_CONTRACT="${lendingAddress}"`);
    console.log(`REACT_APP_FACTORY_CONTRACT="${factoryAddress}"`);
    
    console.log("\n接下来的步骤:");
    console.log("1. 配置前端应用");
    console.log("2. 铸造更多NFT资产");
    console.log("3. 创建新的NFT集合");
    console.log("4. 设置NFT贷款参数");
    console.log("5. 添加更多支持的抵押代币");
    console.log("================================================");

  } catch (error) {
    console.error("部署过程中发生错误:", error);
    console.error(error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 