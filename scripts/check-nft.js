const hre = require("hardhat");

async function main() {
  console.log("查询 NFT 信息...");

  try {
    // 使用部署的合约地址
    const NFT_CONTRACT_ADDRESS = "0x2680952E8a35f4d210393bb19DBEFAf5aC172fbE";
    
    // 获取部署账户
    const [deployer] = await hre.ethers.getSigners();
    console.log(`查询账户地址: ${deployer.address}`);
    
    // 连接到 NFT 合约
    const nftAbi = [
      "function balanceOf(address owner) public view returns (uint256)",
      "function ownerOf(uint256 tokenId) public view returns (address)",
      "function tokenURI(uint256 tokenId) public view returns (string memory)",
      "function getMintRecords(uint256 limit) public view returns (tuple(address minter, uint256 tokenId, string uri)[] memory)"
    ];
    const nftContract = new hre.ethers.Contract(NFT_CONTRACT_ADDRESS, nftAbi, deployer);
    
    // 查询账户拥有的 NFT 数量
    const balance = await nftContract.balanceOf(deployer.address);
    console.log(`账户拥有 ${balance} 个 NFT`);
    
    // 查询铸造记录
    console.log("\n查询铸造记录...");
    const records = await nftContract.getMintRecords(10);
    console.log(`找到 ${records.length} 条铸造记录`);
    
    // 显示铸造记录
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      console.log(`\n记录 ${i + 1}:`);
      console.log(`  铸造者: ${record.minter}`);
      console.log(`  代币 ID: ${record.tokenId}`);
      console.log(`  URI: ${record.uri}`);
      
      // 查询当前所有者
      try {
        const owner = await nftContract.ownerOf(record.tokenId);
        console.log(`  当前所有者: ${owner}`);
      } catch (error) {
        console.log(`  无法查询所有者: ${error.message}`);
      }
    }
    
    // 尝试查询最新铸造的 NFT
    console.log("\n尝试查询最新铸造的 NFT (代币 ID 0)...");
    try {
      const owner = await nftContract.ownerOf(0);
      console.log(`代币 ID 0 的所有者: ${owner}`);
      
      const tokenURI = await nftContract.tokenURI(0);
      console.log(`代币 ID 0 的 URI: ${tokenURI}`);
    } catch (error) {
      console.log(`查询失败: ${error.message}`);
    }
    
    console.log("\nNFT 信息查询完成");
  } catch (error) {
    console.error("查询 NFT 信息过程中发生错误:", error.message);
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