const hre = require("hardhat");

async function main() {
  console.log("Deploying AlveyNFT contract...");

  // 假设的 ERC20 代币地址，在本地测试网上不会真实存在
  const dummyTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const AlveyNFT = await hre.ethers.getContractFactory("AlveyNFT");
  const alveyNFT = await AlveyNFT.deploy(dummyTokenAddress);

  await alveyNFT.waitForDeployment();

  console.log("AlveyNFT deployed to:", await alveyNFT.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });