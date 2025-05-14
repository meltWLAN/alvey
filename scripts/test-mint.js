const hre = require("hardhat");
const config = require("../config");

async function main() {
  console.log("开始测试 NFT 铸造...");

  try {
    // 获取合约地址
    const NFT_CONTRACT_ADDRESS = config.NFT_CONTRACT_ADDRESS;
    const MARIO_TOKEN_ADDRESS = config.MARIO_TOKEN_ADDRESS;
    
    // 获取账户
    const [minter] = await hre.ethers.getSigners();
    console.log(`使用账户地址: ${minter.address}`);
    
    // 连接到 NFT 合约
    const nftAbi = [
      "function mintPrice() public view returns (uint256)",
      "function safeMint() public",
      "function balanceOf(address owner) public view returns (uint256)",
      "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
      "function tokenURI(uint256 tokenId) public view returns (string)"
    ];
    const nftContract = new hre.ethers.Contract(NFT_CONTRACT_ADDRESS, nftAbi, minter);
    
    // 连接到 MARIO 代币合约
    const tokenAbi = [
      "function approve(address spender, uint256 amount) public returns (bool)",
      "function allowance(address owner, address spender) public view returns (uint256)",
      "function balanceOf(address account) public view returns (uint256)"
    ];
    const tokenContract = new hre.ethers.Contract(MARIO_TOKEN_ADDRESS, tokenAbi, minter);
    
    // 检查 MARIO 代币余额
    const tokenBalance = await tokenContract.balanceOf(minter.address);
    console.log(`MARIO 代币余额: ${hre.ethers.formatUnits(tokenBalance, 18)} MARIO`);
    
    // 获取铸造价格
    const mintPrice = await nftContract.mintPrice();
    console.log(`NFT 铸造价格: ${hre.ethers.formatUnits(mintPrice, 18)} MARIO`);
    
    // 检查并设置代币授权
    const allowance = await tokenContract.allowance(minter.address, NFT_CONTRACT_ADDRESS);
    if (allowance < mintPrice) {
      console.log("设置代币授权...");
      const approveTx = await tokenContract.approve(NFT_CONTRACT_ADDRESS, mintPrice);
      console.log("等待授权确认...");
      await approveTx.wait();
      console.log(`授权成功，交易哈希: ${approveTx.hash}`);
    }
    
    // 铸造 NFT
    console.log("开始铸造 NFT...");
    const mintTx = await nftContract.safeMint();
    console.log("等待铸造确认...");
    await mintTx.wait();
    console.log(`NFT 铸造成功，交易哈希: ${mintTx.hash}`);
    
    // 验证铸造结果
    const nftBalance = await nftContract.balanceOf(minter.address);
    console.log(`\n当前拥有的 NFT 数量: ${nftBalance}`);
    
    if (nftBalance > 0) {
      const tokenId = await nftContract.tokenOfOwnerByIndex(minter.address, nftBalance - 1);
      console.log(`最新铸造的 NFT Token ID: ${tokenId}`);
      
      const tokenUri = await nftContract.tokenURI(tokenId);
      console.log(`Token URI: ${tokenUri}`);
    }
    
    console.log("\nNFT 铸造测试完成！");
  } catch (error) {
    console.error("铸造过程中发生错误:", error.message);
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