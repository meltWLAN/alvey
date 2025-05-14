const hre = require("hardhat");
const config = require("../config");

async function main() {
  console.log("开始设置 NFT 参数...");

  try {
    // 使用配置文件中的合约地址
    const NFT_CONTRACT_ADDRESS = config.NFT_CONTRACT_ADDRESS;
    
    // 获取部署账户
    const [deployer] = await hre.ethers.getSigners();
    console.log(`使用账户地址: ${deployer.address}`);
    
    // 连接到 NFT 合约
    const nftAbi = [
      "function mintPrice() public view returns (uint256)",
      "function setMintPrice(uint256 _price) public",
      "function setMaxTotalSupply(uint256 _maxTotalSupply) public",
      "function setMaxMintPerAddress(uint256 _maxMintPerAddress) public",
      "function maxTotalSupply() public view returns (uint256)",
      "function maxMintPerAddress() public view returns (uint256)",
      "function owner() public view returns (address)"
    ];
    const nftContract = new hre.ethers.Contract(NFT_CONTRACT_ADDRESS, nftAbi, deployer);
    
    // 检查是否是合约所有者
    const owner = await nftContract.owner();
    console.log(`合约所有者: ${owner}`);
    
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.error("您不是合约所有者，无法设置参数");
      return;
    }
    
    // 获取并显示当前参数
    const currentPrice = await nftContract.mintPrice();
    const currentMaxSupply = await nftContract.maxTotalSupply();
    const currentMaxPerAddress = await nftContract.maxMintPerAddress();
    
    console.log("当前参数：");
    console.log(`- 铸造价格: ${hre.ethers.formatUnits(currentPrice, 18)} MARIO`);
    console.log(`- 最大供应量: ${currentMaxSupply}`);
    console.log(`- 每地址最大铸造量: ${currentMaxPerAddress}`);
    
    // 设置新参数
    const newPrice = hre.ethers.parseUnits("500000", 18); // 500,000 MARIO
    const newMaxSupply = 10000; // 10000个NFT
    const newMaxPerAddress = 5; // 每个地址最多5个
    
    console.log("\n设置新参数：");
    console.log(`- 新铸造价格: ${hre.ethers.formatUnits(newPrice, 18)} MARIO`);
    console.log(`- 新最大供应量: ${newMaxSupply}`);
    console.log(`- 新每地址最大铸造量: ${newMaxPerAddress}`);
    
    // 设置新参数
    console.log("\n开始设置参数...");
    
    const tx1 = await nftContract.setMintPrice(newPrice);
    console.log("等待铸造价格设置确认...");
    await tx1.wait();
    console.log(`铸造价格设置成功，交易哈希: ${tx1.hash}`);
    
    // 验证新参数
    const updatedPrice = await nftContract.mintPrice();
    const updatedMaxSupply = await nftContract.maxTotalSupply();
    const updatedMaxPerAddress = await nftContract.maxMintPerAddress();
    
    console.log("\n更新后的参数：");
    console.log(`- 铸造价格: ${hre.ethers.formatUnits(updatedPrice, 18)} MARIO`);
    console.log(`- 最大供应量: ${updatedMaxSupply}`);
    console.log(`- 每地址最大铸造量: ${updatedMaxPerAddress}`);
    
    console.log("\nNFT 参数设置完成！");
  } catch (error) {
    console.error("设置参数过程中发生错误:", error.message);
    if (error.error) {
      console.error("详细错误:", error.error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 