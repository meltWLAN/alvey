const hre = require("hardhat");
const { getAddress } = require("ethers");

async function main() {
  console.log("开始部署 MetaverseX 合约系统...");

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

    // 部署工厂合约
    console.log("\n部署 MetaverseXFactory 合约...");
    const MetaverseXFactory = await hre.ethers.getContractFactory("MetaverseXFactory");
    const factory = await MetaverseXFactory.deploy(paymentTokenAddress);
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log(`MetaverseXFactory 部署成功，地址: ${factoryAddress}`);

    // 通过工厂部署所有合约
    console.log("\n通过工厂部署所有合约...");
    const deployTx = await factory.deployAllContracts();
    await deployTx.wait();
    console.log("所有合约部署成功");

    // 获取已部署的合约地址
    const [nftAddress, spaceAddress, marketAddress] = await factory.getContractAddresses();
    console.log(`\nNFT 合约地址: ${nftAddress}`);
    console.log(`空间合约地址: ${spaceAddress}`);
    console.log(`市场合约地址: ${marketAddress}`);

    // 获取合约实例
    const nftContract = await hre.ethers.getContractAt("MetaverseXNFT", nftAddress);
    const spaceContract = await hre.ethers.getContractAt("MetaverseSpace", spaceAddress);
    const marketContract = await hre.ethers.getContractAt("MetaverseMarket", marketAddress);

    // 创建一个示例空间
    console.log("\n创建示例虚拟空间...");
    const createSpaceTx = await spaceContract.createSpace(
      "MetaverseX Gallery", // 名称
      "A showcase gallery for 3D NFT assets", // 描述
      "https://metaversex.example/spaces/gallery.json", // 空间配置URI
      0, // 空间类型: GALLERY
      1, // 空间大小: MEDIUM
      hre.ethers.parseUnits("100", 18), // 价格: 100 MVX
      hre.ethers.parseUnits("10", 18), // 租赁价格: 10 MVX / 天
      true // 可租赁
    );
    await createSpaceTx.wait();
    console.log("示例空间创建成功");

    // 铸造一个示例NFT
    console.log("\n准备铸造示例NFT...");
    
    // 先授权NFT合约使用代币
    const approveTx = await paymentToken.approve(nftAddress, hre.ethers.parseUnits("1000", 18));
    await approveTx.wait();
    console.log("授权NFT合约使用代币成功");
    
    // 创建示例资产元数据
    const assetMetadata = {
      name: "Example 3D Asset",
      description: "A showcase 3D model for the MetaverseX platform",
      modelURI: "https://metaversex.example/models/example.glb",
      thumbnailURI: "https://metaversex.example/thumbnails/example.png",
      format: "glb",
      vrCompatible: true,
      createdAt: 0, // 将由合约设置
      updatedAt: 0, // 将由合约设置
      creator: "0x0000000000000000000000000000000000000000" // 将由合约设置
    };
    
    // 铸造NFT
    const mintTx2 = await nftContract.mintAsset(
      deployer.address,
      "https://metaversex.example/nfts/example.json",
      assetMetadata,
      ["example", "3d", "model"] // 标签
    );
    const receipt = await mintTx2.wait();
    console.log("示例NFT铸造成功");

    // 打印部署摘要和交互信息
    console.log("\n============= MetaverseX 部署完成 =============");
    console.log("支付代币地址:", paymentTokenAddress);
    console.log("工厂合约地址:", factoryAddress);
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