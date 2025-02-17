const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Mario代币合约地址
  const MARIO_TOKEN_ADDRESS = "0x0D8318C1C2C36a1f614Ca17af77Cb3D5c0cC7e10";

  const nft = await hre.ethers.deployContract("AlveyNFT", [MARIO_TOKEN_ADDRESS]);
  await nft.waitForDeployment();

  console.log("AlveyNFT deployed to:", await nft.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });