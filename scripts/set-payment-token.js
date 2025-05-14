const hre = require("hardhat");
const { getAddress } = require("ethers");

async function main() {
  console.log("设置 NFT 合约的支付代币地址...");

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
    
    // 设置新的支付代币地址 - 可以替换为您自己的代币地址
    // 这里我们部署一个新的模拟代币用于测试
    console.log("\n部署一个新的模拟代币用于测试...");
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy("Test Token", "TEST");
    await mockToken.waitForDeployment();
    const tokenAddress = await mockToken.getAddress();
    console.log(`模拟代币部署成功，地址: ${tokenAddress}`);
    
    // 铸造一些代币给部署者
    const mintAmount = hre.ethers.parseUnits("1000000", 18); // 100万代币
    await mockToken.mint(deployer.address, mintAmount);
    console.log(`铸造了 ${hre.ethers.formatUnits(mintAmount, 18)} 代币给部署者`);
    
    // 设置新的支付代币地址
    console.log("\n设置新的支付代币地址...");
    const setTx = await nftContract.setPaymentToken(tokenAddress);
    console.log("等待交易确认...");
    await setTx.wait();
    console.log(`设置成功，交易哈希: ${setTx.hash}`);
    
    // 验证新的支付代币地址
    const newToken = await nftContract.paymentToken();
    console.log(`新的支付代币地址: ${newToken}`);
    
    // 授权 NFT 合约使用代币
    console.log("\n授权 NFT 合约使用代币...");
    const approveAmount = hre.ethers.parseUnits("10000", 18); // 1万代币
    const approveTx = await mockToken.approve(NFT_CONTRACT_ADDRESS, approveAmount);
    await approveTx.wait();
    console.log(`授权成功，交易哈希: ${approveTx.hash}`);
    
    console.log("\n支付代币设置和授权完成，现在您可以尝试铸造 NFT");
    console.log("请运行: npx hardhat run scripts/mint-nft-simple.js --network alveychain");
  } catch (error) {
    console.error("设置支付代币地址过程中发生错误:", error.message);
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