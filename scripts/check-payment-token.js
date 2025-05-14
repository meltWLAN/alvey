const hre = require("hardhat");

async function main() {
  console.log("检查 NFT 合约的支付代币地址...");

  try {
    // 使用部署的合约地址
    const NFT_CONTRACT_ADDRESS = "0x2680952E8a35f4d210393bb19DBEFAf5aC172fbE";
    
    // 获取部署账户
    const [deployer] = await hre.ethers.getSigners();
    console.log(`使用账户地址: ${deployer.address}`);
    
    // 连接到 NFT 合约
    const nftAbi = [
      "function paymentToken() public view returns (address)",
      "function setPaymentToken(address _token) public",
      "function owner() public view returns (address)"
    ];
    const nftContract = new hre.ethers.Contract(NFT_CONTRACT_ADDRESS, nftAbi, deployer);
    
    // 检查是否是合约所有者
    const owner = await nftContract.owner();
    console.log(`合约所有者: ${owner}`);
    
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.error("您不是合约所有者，无法修改支付代币地址");
      return;
    }
    
    // 获取当前支付代币地址
    const currentToken = await nftContract.paymentToken();
    console.log(`当前支付代币地址: ${currentToken}`);
    
    // 询问是否要更改支付代币地址
    console.log("\n是否要更改支付代币地址？如果需要，请运行以下命令:");
    console.log(`npx hardhat run scripts/set-payment-token.js --network alveychain`);
    
  } catch (error) {
    console.error("检查支付代币地址过程中发生错误:", error.message);
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