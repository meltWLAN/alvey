require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

// 使用环境变量存储私钥和助记词，提高安全性
const MNEMONIC = process.env.MNEMONIC || "test test test test test test test test test test test junk";

// 使用本地测试私钥，真实部署时使用环境变量
const TEST_PRIVATE_KEY = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Hardhat默认账户#0
const PRIVATE_KEY = process.env.PRIVATE_KEY || TEST_PRIVATE_KEY;

// 验证私钥是否已设置
if (!process.env.PRIVATE_KEY && process.env.NODE_ENV === 'production') {
  console.error("警告: 未设置PRIVATE_KEY环境变量，请在.env文件中设置");
}

// 配置网络
const networks = {
  hardhat: {
    chainId: 31337
  },
  localhost: {
    url: "http://127.0.0.1:8545",
    chainId: 31337
  },
  // AlveyChain主网
  alveychain: {
    url: process.env.ALVEY_RPC_URL || "https://elves-core1.alvey.io/",
    chainId: 3797,
    accounts: [PRIVATE_KEY],
    gasPrice: 20000000000 // 20 gwei
  },
  // AlveyChain测试网
  alveychainTestnet: {
    url: "https://devchain.alvey.io/",
    chainId: 3798,
    accounts: [PRIVATE_KEY],
    gasPrice: 20000000000 // 20 gwei
  }
};

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks,
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
