import { Chain } from 'wagmi';
import { ethers } from 'ethers';

// 定义NFT合约ABI
const nftAbi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function setApprovalForAll(address operator, bool approved)",
  "function safeMint(address to, string memory uri)",
  "function totalSupply() view returns (uint256)",
  "function maxTotalSupply() view returns (uint256)",
  "function mintPrice() view returns (uint256)"
];

// 定义质押合约ABI
const stakingAbi = [
  "function stake(uint256 tokenId)",
  "function unstake(uint256 tokenId)",
  "function claimReward(uint256 tokenId)",
  "function totalStakedNFTs() view returns (uint256)",
  "function getUserStakes(address user) view returns (uint256[])",
  "function stakes(uint256 tokenId) view returns (uint256 tokenId, uint256 stakedAt, uint256 lastClaimed, uint256 accumulated, address staker)",
  "function getPendingReward(uint256 tokenId) view returns (uint256)",
  "function baseRewardRate() view returns (uint256)"
];

// 定义支付代币ABI
const marioAbi = [
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

// 获取合约实例的函数
const getContract = (address, abi, provider) => {
  if (!address || !provider) return null;
  return new ethers.Contract(address, abi, provider);
};

// 获取provider
const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider('https://elves-core1.alvey.io');
};

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
      abi: nftAbi,
      get contract() {
        return getContract(this.address, this.abi, getProvider());
      }
    },
    staking: {
      address: '0x97Df0C0bEd02E368976aC1F9F8729CD9858E4FC9',
      abi: stakingAbi,
      get contract() {
        return getContract(this.address, this.abi, getProvider());
      }
    },
    mario: {
      address: '0x0d8318c1c2c36A1f614cA17af77cb3d5c0Cc7e10',
      abi: marioAbi,
      get contract() {
        return getContract(this.address, this.abi, getProvider());
      }
    },
  },
}; 