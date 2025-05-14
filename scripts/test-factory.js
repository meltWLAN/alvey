const hre = require("hardhat");

async function main() {
  console.log("测试 MetaverseXFactory 功能...");

  try {
    // 合约地址配置 - 使用实际部署的地址
    // 注意：每次重新部署时这些地址会变化，需要从部署输出获取
    const paymentTokenAddress = "0x36C02dA8a0983159322a80FFE9F24b1acfF8B570";
    const factoryAddress = "0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154";
    
    // 获取账户
    const [deployer, creator1, creator2] = await hre.ethers.getSigners();
    console.log(`部署者地址: ${deployer.address}`);
    console.log(`创建者1地址: ${creator1.address}`);
    console.log(`创建者2地址: ${creator2.address}`);
    
    // 获取合约实例
    const paymentToken = await hre.ethers.getContractAt("contracts/MockERC20.sol:MockERC20", paymentTokenAddress);
    const factory = await hre.ethers.getContractAt("MetaverseXFactory", factoryAddress);
    
    // 为测试账户铸造代币
    console.log("为测试账户铸造代币...");
    const mintAmount = hre.ethers.parseUnits("10000", 18);
    await paymentToken.mint(creator1.address, mintAmount);
    await paymentToken.mint(creator2.address, mintAmount);
    console.log(`为创建者1铸造了 ${hre.ethers.formatUnits(mintAmount, 18)} MVX 代币`);
    console.log(`为创建者2铸造了 ${hre.ethers.formatUnits(mintAmount, 18)} MVX 代币`);
    
    // 查询当前集合数量
    const initialCount = await factory.getCollectionsCount();
    console.log(`当前集合数量: ${initialCount}`);
    
    // 获取注册费用
    const registrationFee = await factory.registrationFee();
    console.log(`注册费用: ${hre.ethers.formatUnits(registrationFee, 18)} MVX`);
    
    // 创建者1创建集合
    console.log("\n创建者1创建集合...");
    await paymentToken.connect(creator1).approve(factoryAddress, registrationFee);
    
    const tx1 = await factory.connect(creator1).createCollection(
      "科幻宇宙",
      "SCI",
      true // 立即注册
    );
    await tx1.wait();
    
    // 查询更新后的集合数量
    const countAfterFirst = await factory.getCollectionsCount();
    console.log(`创建第一个集合后的数量: ${countAfterFirst}`);
    
    // 获取刚创建的集合地址和信息
    const collections = await factory.getCollections(0, countAfterFirst);
    const latestCollection = collections[0][Number(countAfterFirst) - 1]; // 最后一个集合的地址
    console.log(`最新创建的集合地址: ${latestCollection}`);
    
    // 查询集合信息
    const collectionInfo = await factory.getCollectionInfo(latestCollection);
    console.log("\n集合信息:");
    console.log(`- 名称: ${collectionInfo[0]}`);
    console.log(`- 创建者: ${collectionInfo[1]}`);
    console.log(`- 创建时间: ${new Date(Number(collectionInfo[2]) * 1000).toLocaleString()}`);
    console.log(`- 是否已注册: ${collectionInfo[3]}`);
    
    // 创建者2创建集合但不注册
    console.log("\n创建者2创建集合但不注册...");
    
    const tx2 = await factory.connect(creator2).createCollection(
      "音乐空间",
      "MUSIC",
      false // 不注册
    );
    await tx2.wait();
    
    // 查询更新后的集合数量
    const countAfterSecond = await factory.getCollectionsCount();
    console.log(`创建第二个集合后的数量: ${countAfterSecond}`);
    
    // 获取所有集合信息
    console.log("\n获取所有集合信息:");
    const allCollections = await factory.getCollections(0, countAfterSecond);
    
    for (let i = 0; i < allCollections[0].length; i++) {
      console.log(`\n集合 #${i + 1}:`);
      console.log(`- 地址: ${allCollections[0][i]}`);
      console.log(`- 名称: ${allCollections[1][i]}`);
      console.log(`- 创建者: ${allCollections[2][i]}`);
      console.log(`- 创建时间: ${new Date(Number(allCollections[3][i]) * 1000).toLocaleString()}`);
      console.log(`- 是否已注册: ${allCollections[4][i]}`);
    }
    
    // 创建者2后续注册集合
    console.log("\n创建者2后续注册集合...");
    
    // 先授权工厂合约使用代币
    await paymentToken.connect(creator2).approve(factoryAddress, registrationFee);
    
    // 获取未注册的集合地址
    const unregisteredCollection = allCollections[0][allCollections[0].length - 1];
    
    // 注册集合
    const registerTx = await factory.connect(creator2).registerCollection(
      unregisteredCollection,
      "已注册的音乐空间"
    );
    await registerTx.wait();
    
    // 再次获取集合信息
    const updatedInfo = await factory.getCollectionInfo(unregisteredCollection);
    console.log("\n注册后的集合信息:");
    console.log(`- 名称: ${updatedInfo[0]}`);
    console.log(`- 创建者: ${updatedInfo[1]}`);
    console.log(`- 创建时间: ${new Date(Number(updatedInfo[2]) * 1000).toLocaleString()}`);
    console.log(`- 是否已注册: ${updatedInfo[3]}`);
    
    console.log("\nMetaverseXFactory 功能测试完成!");
  } catch (error) {
    console.error("测试过程中发生错误:", error);
    console.error(error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 