import { Chain } from 'wagmi';

export const alveychain = {
  id: 3797,
  name: 'Alveychain',
  network: 'alveychain',
  nativeCurrency: {
    decimals: 18,
    name: 'ALV',
    symbol: 'ALV',
  },
  rpcUrls: {
    public: { http: ['https://elves-core1.alvey.io'] },
    default: { http: ['https://elves-core1.alvey.io'] },
  },
  blockExplorers: {
    default: { name: 'AlveyScan', url: 'https://alvey.io' },
  },
  contracts: {
    nft: {
      address: '0xdc8A98387b6BA6a4774ef04bE86f4C68F5BF2415',
      abi: [/* NFT合约ABI */],
    },
    staking: {
      address: '0x97Df0C0bEd02E368976aC1F9F8729CD9858E4FC9',
      abi: [/* 质押合约ABI */],
    },
    mario: {
      address: '0x0d8318c1c2c36A1f614cA17af77cb3d5c0Cc7e10',
      abi: [/* MARIO代币ABI */],
    },
  },
} as const satisfies Chain; 