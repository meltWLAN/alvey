const hre = require("hardhat");
const { getAddress } = require("ethers");

async function main() {
  console.log("开始部署到本地测试网络...");

  try {
    // 获取部署账户
    const [deployer, user1] = await hre.ethers.getSigners();
    console.log(`使用账户地址部署: ${deployer.address}`);
    console.log(`账户余额: ${hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);

    // 部署模拟的 ERC20 代币
    console.log("部署模拟的 ERC20 代币...");
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy("Mario Token", "MARIO");
    await mockToken.waitForDeployment();
    const tokenAddress = await mockToken.getAddress();
    console.log(`模拟 Mario 代币部署成功，地址: ${tokenAddress}`);

    // 给测试用户铸造一些代币
    const mintAmount = hre.ethers.parseUnits("10000000", 18); // 1000万代币
    await mockToken.mint(deployer.address, mintAmount);
    await mockToken.mint(user1.address, mintAmount);
    console.log(`已铸造 ${hre.ethers.formatUnits(mintAmount, 18)} 代币给部署者和测试用户`);

    // 部署 AlveyNFT 合约
    console.log("部署 AlveyNFT 合约...");
    const NFT = await hre.ethers.getContractFactory("AlveyNFT");
    const nft = await NFT.deploy(tokenAddress);
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log(`AlveyNFT 部署成功，地址: ${nftAddress}`);

    // 部署质押合约
    console.log("部署 StakingContract 合约...");
    const StakingContract = await hre.ethers.getContractFactory("StakingContract");
    const staking = await StakingContract.deploy(nftAddress, tokenAddress);
    await staking.waitForDeployment();
    const stakingAddress = await staking.getAddress();
    console.log(`StakingContract 部署成功，地址: ${stakingAddress}`);

    // 打印合约信息用于前端配置
    console.log("\n前端配置信息:");
    console.log(`NFT_CONTRACT_ADDRESS="${nftAddress}"`);
    console.log(`STAKING_CONTRACT_ADDRESS="${stakingAddress}"`);
    console.log(`MARIO_TOKEN_ADDRESS="${tokenAddress}"`);
    
    // 测试 NFT 铸造
    console.log("\n测试 NFT 铸造...");
    // 批准 NFT 合约使用代币
    const mintPrice = await nft.mintPrice();
    await mockToken.approve(nftAddress, mintPrice);
    
    // 铸造 NFT
    const tx = await nft.safeMint(deployer.address, "https://example.com/nft/1");
    const receipt = await tx.wait();
    console.log(`NFT 铸造成功，交易哈希: ${receipt.hash}`);
    console.log(`代币 ID: 1, 所有者: ${await nft.ownerOf(1)}`);
    
    console.log("\n部署和测试完成！");
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