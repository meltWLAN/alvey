const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. 部署 AlveySwap
  const AlveySwap = await hre.ethers.getContractFactory("AlveySwap");
  const alveySwap = await AlveySwap.deploy();
  await alveySwap.deployed();
  console.log("AlveySwap deployed to:", alveySwap.address);

  // 2. 部署 AlveyBridge
  const AlveyBridge = await hre.ethers.getContractFactory("AlveyBridge");
  const alveyBridge = await AlveyBridge.deploy();
  await alveyBridge.deployed();
  console.log("AlveyBridge deployed to:", alveyBridge.address);

  // 3. 部署 AlveyLend
  const AlveyLend = await hre.ethers.getContractFactory("AlveyLend");
  const alveyLend = await AlveyLend.deploy();
  await alveyLend.deployed();
  console.log("AlveyLend deployed to:", alveyLend.address);

  // 4. 部署 AlveyStake
  // 这里假设需要传入 stakingToken, rewardToken, rewardRate, stakingPeriod
  // 请根据实际合约构造参数调整
  const stakingToken = "0x0000000000000000000000000000000000000000"; // 占位符
  const rewardToken = "0x0000000000000000000000000000000000000000"; // 占位符
  const rewardRate = hre.ethers.utils.parseEther("1"); // 每秒1个奖励
  const stakingPeriod = 30 * 24 * 60 * 60; // 30天
  const AlveyStake = await hre.ethers.getContractFactory("AlveyStake");
  const alveyStake = await AlveyStake.deploy(stakingToken, rewardToken, rewardRate, stakingPeriod);
  await alveyStake.deployed();
  console.log("AlveyStake deployed to:", alveyStake.address);

  // 5. 部署 AlveyIndex
  const AlveyIndex = await hre.ethers.getContractFactory("AlveyIndex");
  const alveyIndex = await AlveyIndex.deploy();
  await alveyIndex.deployed();
  console.log("AlveyIndex deployed to:", alveyIndex.address);

  // 输出到前端 addresses.js
  const addresses = {
    AlveySwap: alveySwap.address,
    AlveyBridge: alveyBridge.address,
    AlveyLend: alveyLend.address,
    AlveyStake: alveyStake.address,
    AlveyIndex: alveyIndex.address,
  };
  const output = `export const CONTRACT_ADDRESSES = {\n  mainnet: ${JSON.stringify(addresses, null, 2)},\n  testnet: ${JSON.stringify(addresses, null, 2)},\n  development: ${JSON.stringify(addresses, null, 2)}\n};\n`;
  fs.writeFileSync(
    path.join(__dirname, "../frontend-new/src/contracts/addresses.js"),
    output
  );
  console.log("合约地址已写入 frontend-new/src/contracts/addresses.js");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 