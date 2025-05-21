const hre = require("hardhat");

async function main() {
  console.log("Deploying MockERC20 contract...");

  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  // 使用示例参数部署 MockERC20
  const mockERC20 = await MockERC20.deploy("Mock Token", "MOCK", 18);

  await mockERC20.waitForDeployment();

  const deployedAddress = await mockERC20.getAddress();
  console.log("MockERC20 deployed to:", deployedAddress);

  // 返回部署的地址，以便后续脚本使用
  return deployedAddress;
}

module.exports = main;