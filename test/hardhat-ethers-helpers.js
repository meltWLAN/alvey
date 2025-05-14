// 从hardhat导出ethers以便测试文件使用
const hre = require('hardhat');

module.exports = {
  ethers: hre.ethers,
  hre: hre
}; 