const hre = require("hardhat");

async function main() {
  console.log("测试 MetaverseXNFT 铸造功能...");

  try {
    // 合约地址配置
    const paymentTokenAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
    const nftAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
    
    // 获取账户
    const [deployer, user1, user2] = await hre.ethers.getSigners();
    console.log(`使用账户地址: ${deployer.address}`);
    console.log(`测试账户1: ${user1.address}`);
    console.log(`测试账户2: ${user2.address}`);
    
    // 获取合约实例
    const paymentToken = await hre.ethers.getContractAt("contracts/MockERC20.sol:MockERC20", paymentTokenAddress);
    const nft = await hre.ethers.getContractAt("MetaverseXNFT", nftAddress);
    
    // 查询当前NFT总供应量
    const totalSupply = await nft.totalSupply();
    console.log(`当前NFT总供应量: ${totalSupply}`);
    
    // 给测试账户转一些代币
    const mintAmount = hre.ethers.parseUnits("1000", 18);
    await paymentToken.mint(user1.address, mintAmount);
    console.log(`为测试账户1铸造了 ${hre.ethers.formatUnits(mintAmount, 18)} MVX 代币`);
    
    // 查询测试账户代币余额
    const user1Balance = await paymentToken.balanceOf(user1.address);
    console.log(`测试账户1代币余额: ${hre.ethers.formatUnits(user1Balance, 18)} MVX`);
    
    // 获取铸造价格
    const mintPrice = await nft.mintPrice();
    console.log(`NFT铸造价格: ${hre.ethers.formatUnits(mintPrice, 18)} MVX`);
    
    // 测试账户授权NFT合约使用代币
    console.log("测试账户授权NFT合约使用代币...");
    await paymentToken.connect(user1).approve(nftAddress, mintPrice);
    
    // 测试账户铸造NFT
    console.log("测试账户铸造NFT...");
    const mintTx = await nft.connect(user1).mintAsset(
      "https://metaversex.example/nfts/test1.json",
      "character",
      4 // 稀有度 (1-5)
    );
    await mintTx.wait();
    
    // 再次查询NFT总供应量
    const newTotalSupply = await nft.totalSupply();
    console.log(`铸造后NFT总供应量: ${newTotalSupply}`);
    
    // 查询新铸造的NFT属性
    console.log("查询新铸造的NFT属性...");
    const tokenId = newTotalSupply;
    const metadata = await nft.getAssetMetadata(tokenId);
    console.log(`NFT #${tokenId} 属性:`);
    console.log(`- 资产类型: ${metadata[0]}`);
    console.log(`- 稀有度: ${metadata[1]}`);
    console.log(`- 等级: ${metadata[2]}`);
    console.log(`- 可转让: ${metadata[3]}`);
    console.log(`- 创建时间: ${new Date(Number(metadata[4]) * 1000).toLocaleString()}`);
    
    // 查询NFT所有者
    const owner = await nft.ownerOf(tokenId);
    console.log(`NFT #${tokenId} 所有者: ${owner}`);
    console.log(`与测试账户1地址匹配: ${owner === user1.address}`);
    
    console.log("MetaverseXNFT 铸造功能测试完成!");
  } catch (error) {
    console.error("测试过程中发生错误:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 