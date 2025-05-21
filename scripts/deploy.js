const hre = require("hardhat");
const deployMockERC20 = require("./deploy-mock-erc20");

async function main() {
  console.log("Deploying AlveyNFT contract...");

  // 部署模拟 ERC20 代币并获取其地址
  const paymentTokenAddress = await deployMockERC20();
  console.log("Using payment token address:", paymentTokenAddress);

  const AlveyNFT = await hre.ethers.getContractFactory("AlveyNFT");
  const alveyNFT = await AlveyNFT.deploy(paymentTokenAddress);

  await alveyNFT.waitForDeployment();

  console.log("AlveyNFT deployed to:", await alveyNFT.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });