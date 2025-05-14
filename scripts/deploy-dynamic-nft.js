// 部署动态NFT合约的脚本
const hre = require("hardhat");

async function main() {
  console.log("开始部署动态NFT合约...");

  // 部署MockERC20作为支付代币
  console.log("部署支付代币...");
  const MockERC20 = await hre.ethers.getContractFactory("contracts/MockERC20.sol:MockERC20");
  const mockToken = await MockERC20.deploy("Alvey Token", "ALV", 18);
  await mockToken.waitForDeployment();
  
  const mockTokenAddress = await mockToken.getAddress();
  console.log(`支付代币已部署到地址: ${mockTokenAddress}`);

  // 部署MetaverseXNFT合约
  console.log("部署动态NFT合约...");
  const MetaverseXNFT = await hre.ethers.getContractFactory("MetaverseXNFT");
  const nft = await MetaverseXNFT.deploy(
    "AlveyChain Dynamic NFT", 
    "ADVNFT", 
    "https://api.alveychain.io/nft/",
    mockTokenAddress
  );

  await nft.waitForDeployment();

  const nftAddress = await nft.getAddress();
  console.log(`动态NFT合约已部署到地址: ${nftAddress}`);

  // 为铸造代币准备一些测试代币
  console.log("铸造一些测试代币...");
  const [deployer] = await hre.ethers.getSigners();
  const mintAmount = hre.ethers.parseEther("1000");
  await mockToken.mint(deployer.address, mintAmount);
  console.log(`已铸造 ${hre.ethers.formatEther(mintAmount)} 个测试代币到部署者账户`);

  // 设置NFT合约的铸造价格
  console.log("设置NFT铸造价格...");
  const mintPrice = hre.ethers.parseEther("1"); // 设置为1个代币
  await nft.setMintPrice(mintPrice);
  console.log(`铸造价格设置为: ${hre.ethers.formatEther(mintPrice)} 代币`);

  // 设置进化配置
  console.log("设置NFT进化配置...");
  await nft.setEvolutionConfig(
    86400, // 1天作为进化周期
    100,   // 需要100经验值才能进化
    5      // 最高等级为5
  );
  console.log("进化配置已设置");

  // 铸造一个示例NFT
  console.log("铸造示例NFT...");
  // 先批准NFT合约使用代币
  await mockToken.approve(nftAddress, mintPrice);
  // 铸造NFT
  const tx = await nft.mint(
    deployer.address,
    3, // 稀有度为3
    "standard", // 进化路径
    true // 可进化
  );
  await tx.wait();
  console.log("示例NFT已铸造");

  console.log("动态NFT系统部署完成！");
  console.log("-------------------------");
  console.log("合约地址信息:");
  console.log(`支付代币地址: ${mockTokenAddress}`);
  console.log(`NFT合约地址: ${nftAddress}`);
  console.log("-------------------------");
  console.log("下一步:");
  console.log("1. 使用mint函数铸造新的NFT");
  console.log("2. 使用addExperience函数增加NFT经验值");
  console.log("3. NFT将在满足条件后自动进化");
  console.log("-------------------------");
}

// 执行部署脚本
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 