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
  rpcUrls: ["https://elves-core1.alvey.io/", "https://elves-core2.alvey.io/", "https://elves-core3.alvey.io/"],
  blockExplorerUrls: ["https://alveyscan.com/"]
};

// 合约地址 - 部署后填入实际地址
export const CONTRACT_ADDRESSES = {
  // 示例合约地址 - 请在实际部署后替换
  nftContract: "0x8Cf96EB392F942D3a1DFa181C87BA074F510B00a",
  paymentToken: "0x22f49bcb3dad370a9268ba3fca33cb037ca3d022",
  stakingContract: "0x3935D642b1B3b0aca5F6518600057655378bdff7"
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