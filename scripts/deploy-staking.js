const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 部署奖励代币合约
  const MockERC20 = await hre.ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
  const rewardToken = await MockERC20.deploy("Reward Token", "RWD", 18);
  await rewardToken.waitForDeployment();
  console.log("Reward Token deployed to:", await rewardToken.getAddress());

  // 部署NFT合约
  const NFT = await hre.ethers.getContractFactory("AlveyNFT");
  const nft = await NFT.deploy(await rewardToken.getAddress());
  await nft.waitForDeployment();
  console.log("NFT contract deployed to:", await nft.getAddress());

  // 部署质押合约
  const Staking = await hre.ethers.getContractFactory("StakingContract");
  const staking = await Staking.deploy(await nft.getAddress(), await rewardToken.getAddress());
  await staking.waitForDeployment();
  console.log("Staking contract deployed to:", await staking.getAddress());

  // 铸造一些奖励代币给部署者
  const mintAmount = hre.ethers.parseUnits("1000000", 18);
  await rewardToken.mint(deployer.address, mintAmount);
  console.log("Minted", mintAmount.toString(), "reward tokens to deployer");

  // 转移一些奖励代币到质押合约
  const transferAmount = hre.ethers.parseUnits("100000", 18);
  await rewardToken.transfer(await staking.getAddress(), transferAmount);
  console.log("Transferred", transferAmount.toString(), "reward tokens to staking contract");

  console.log("\nDeployment completed!");
  console.log("Reward Token:", await rewardToken.getAddress());
  console.log("NFT Contract:", await nft.getAddress());
  console.log("Staking Contract:", await staking.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 