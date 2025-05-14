const hre = require("hardhat");

async function main() {
  console.log("开始授权 NFT 合约使用 Mario 代币...");

  try {
    // 使用部署的合约地址
    const NFT_CONTRACT_ADDRESS = "0x2680952E8a35f4d210393bb19DBEFAf5aC172fbE";
    const MARIO_TOKEN_ADDRESS = "0x0d8318c1c2c36A1f614cA17af77cb3d5c0Cc7e10";
    
    // 获取部署账户
    const [deployer] = await hre.ethers.getSigners();
    console.log(`使用账户地址: ${deployer.address}`);
    
    // 连接到 NFT 合约获取铸造价格
    const nftAbi = ["function mintPrice() public view returns (uint256)"];
    const nftContract = new hre.ethers.Contract(NFT_CONTRACT_ADDRESS, nftAbi, deployer);
    
    // 获取铸造价格
    let mintPrice;
    try {
      mintPrice = await nftContract.mintPrice();
      console.log(`NFT 铸造价格: ${hre.ethers.formatUnits(mintPrice, 18)} MARIO`);
    } catch (error) {
      console.error("获取铸造价格失败:", error.message);
      return;
    }
    
    // 连接到 Mario 代币合约 - 尝试直接使用更直接的方式
    console.log("\n开始授权...");
    try {
      // 授权一个较大的金额 (10倍铸造价格)
      const approveAmount = hre.ethers.parseUnits("10000000", 18); // 直接授权 1000万 MARIO
      
      console.log(`授权额度: ${hre.ethers.formatUnits(approveAmount, 18)} MARIO`);
      
      // 构建授权调用数据
      const tokenAbi = ["function approve(address spender, uint256 amount) public returns (bool)"];
      const tokenContract = new hre.ethers.Contract(MARIO_TOKEN_ADDRESS, tokenAbi, deployer);
      
      const approveTx = await tokenContract.approve(NFT_CONTRACT_ADDRESS, approveAmount);
      console.log("等待交易确认...");
      await approveTx.wait();
      console.log(`授权成功，交易哈希: ${approveTx.hash}`);
      
      console.log("授权完成，现在可以尝试铸造 NFT 了");
    } catch (error) {
      console.error("\n授权失败。可能的原因:");
      console.error("1. Mario 代币合约地址不正确");
      console.error("2. 账户没有 Mario 代币");
      console.error("3. 其他交易错误");
      console.error("\n错误详情:", error.message);
      
      // 尝试查看详细错误
      if (error.error) {
        console.error("详细错误:", error.error);
      }
    }
    
  } catch (error) {
    console.error("脚本执行过程中发生错误:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 