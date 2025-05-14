/**
 * AlveyNFT 项目前端配置文件
 */

// 链配置
export const CHAIN_CONFIG = {
  chainId: 3797,  // AlveyChain 链ID
  chainName: "AlveyChain", 
  nativeCurrency: {
    name: "ALV",
    symbol: "ALV",
    decimals: 18
  },
  rpcUrls: ["https://elves-core1.alvey.io/"],
  blockExplorerUrls: ["https://alvey.io/"]
};

// 合约地址 - 部署后填入实际地址
export const CONTRACT_ADDRESSES = {
  // 示例合约地址 - 请在实际部署后替换
  nftContract: "0x1234567890123456789012345678901234567890",
  paymentToken: "0x0987654321098765432109876543210987654321",
  stakingContract: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
};

// 应用配置
export const APP_CONFIG = {
  // 应用名称
  appName: "AlveyNFT",
  
  // 最大铸造数量
  maxMintPerTx: 10,
  
  // 社交媒体链接
  socialLinks: {
    twitter: "https://twitter.com/alveychain",
    discord: "https://discord.gg/alveychain",
    telegram: "https://t.me/alveychain"
  }
}; 