/**
 * 集成应用数据
 * 包含AlveyChain生态系统和集成的热门第三方应用
 */

// 注意：此文件需要与i18n翻译配合使用
// 应用描述应使用翻译键名，而非直接文本
export const applications = [
  // 原生AlveyChain应用
  {
    id: 'alveyswap',
    name: 'AlveySwap',
    descriptionKey: 'appHub.apps.alveyswap.description',
    longDescriptionKey: 'appHub.apps.alveyswap.longDescription',
    category: 'exchange',
    url: 'https://alveyswap.io',
    logo: '/images/apps/alveyswap.png',
    userCount: '245K+',
    tvl: '$124M',
    featured: true,
    mature: true,
    rating: 4.8,
    chainSupport: ['alveychain'],
    tags: ['dex', 'amm', 'farming'],
    native: true
  },
  {
    id: 'alveybridge',
    name: 'AlveyBridge',
    descriptionKey: 'appHub.apps.alveybridge.description',
    longDescriptionKey: 'appHub.apps.alveybridge.longDescription',
    category: 'bridge',
    url: 'https://bridge.alveychain.io',
    logo: '/images/apps/alveybridge.png',
    userCount: '180K+',
    tvl: '$78M',
    featured: true,
    mature: true,
    rating: 4.7,
    chainSupport: ['alveychain', 'ethereum', 'bsc', 'polygon'],
    tags: ['bridge', 'cross-chain'],
    native: true
  },
  {
    id: 'alveylend',
    name: 'AlveyLend',
    descriptionKey: 'appHub.apps.alveylend.description',
    longDescriptionKey: 'appHub.apps.alveylend.longDescription',
    category: 'defi',
    url: 'https://alveylend.finance',
    logo: '/images/apps/alveylend.png',
    userCount: '120K+',
    tvl: '$56M',
    featured: true,
    mature: true,
    rating: 4.6,
    chainSupport: ['alveychain'],
    tags: ['lending', 'borrowing', 'yield'],
    native: true
  },
  {
    id: 'alveynft',
    name: 'AlveyNFT',
    descriptionKey: 'appHub.apps.alveynft.description',
    longDescriptionKey: 'appHub.apps.alveynft.longDescription',
    category: 'nft',
    url: 'https://alveynft.market',
    logo: '/images/apps/alveynft.png',
    userCount: '185K+',
    tvl: '$32M',
    featured: true,
    mature: true,
    rating: 4.7,
    chainSupport: ['alveychain'],
    tags: ['marketplace', 'collectibles'],
    native: true
  },
  {
    id: 'alveymonsters',
    name: 'AlveyMonsters',
    descriptionKey: 'appHub.apps.alveymonsters.description',
    longDescriptionKey: 'appHub.apps.alveymonsters.longDescription',
    category: 'gaming',
    url: 'https://alveymonsters.game',
    logo: '/images/apps/alveymonsters.png',
    userCount: '135K+',
    tvl: '$28M',
    featured: true,
    mature: true,
    rating: 4.5,
    chainSupport: ['alveychain'],
    tags: ['play-to-earn', 'nft-game'],
    native: true
  },
  {
    id: 'alveyscan',
    name: 'AlveyScan',
    descriptionKey: 'appHub.apps.alveyscan.description',
    longDescriptionKey: 'appHub.apps.alveyscan.longDescription',
    category: 'tools',
    url: 'https://alveyscan.io',
    logo: '/images/apps/alveyscan.png',
    userCount: '320K+',
    mature: true,
    rating: 4.9,
    chainSupport: ['alveychain'],
    tags: ['explorer', 'analytics'],
    native: true
  },
  {
    id: 'alveystake',
    name: 'AlveyStake',
    descriptionKey: 'appHub.apps.alveystake.description',
    longDescriptionKey: 'appHub.apps.alveystake.longDescription',
    category: 'defi',
    url: 'https://alveystake.finance',
    logo: '/images/apps/alveystake.png',
    userCount: '95K+',
    tvl: '$67M',
    mature: true,
    rating: 4.6,
    chainSupport: ['alveychain'],
    tags: ['staking', 'yield'],
    native: true
  },
  {
    id: 'alveyindex',
    name: 'AlveyIndex',
    descriptionKey: 'appHub.apps.alveyindex.description',
    longDescriptionKey: 'appHub.apps.alveyindex.longDescription',
    category: 'defi',
    url: 'https://alveyindex.finance',
    logo: '/images/apps/alveyindex.png',
    userCount: '65K+',
    tvl: '$22M',
    mature: true,
    rating: 4.5,
    chainSupport: ['alveychain'],
    tags: ['index', 'defi'],
    native: true
  },
  {
    id: 'alveyart',
    name: 'AlveyArt',
    descriptionKey: 'appHub.apps.alveyart.description',
    longDescriptionKey: 'appHub.apps.alveyart.longDescription',
    category: 'nft',
    url: 'https://alveyart.io',
    logo: '/images/apps/alveyart.png',
    userCount: '78K+',
    tvl: '$14M',
    mature: true,
    rating: 4.6,
    chainSupport: ['alveychain'],
    tags: ['nft', 'art'],
    native: true
  },
  {
    id: 'alveymeta',
    name: 'AlveyMeta',
    descriptionKey: 'appHub.apps.alveymeta.description',
    longDescriptionKey: 'appHub.apps.alveymeta.longDescription',
    category: 'metaverse',
    url: 'https://alveymeta.world',
    logo: '/images/apps/alveymeta.png',
    userCount: '58K+',
    tvl: '$18M',
    mature: true,
    rating: 4.4,
    chainSupport: ['alveychain'],
    tags: ['metaverse', 'virtual-land'],
    native: true
  },

  // 第三方集成应用 - DeFi类
  {
    id: 'uniswap',
    name: 'Uniswap V3',
    descriptionKey: 'appHub.apps.uniswap.description',
    longDescriptionKey: 'appHub.apps.uniswap.longDescription',
    category: 'exchange',
    url: 'https://app.uniswap.org',
    logo: '/images/apps/uniswap.png',
    userCount: '3.5M+',
    tvl: '$5.2B',
    featured: true,
    mature: true,
    rating: 4.9,
    chainSupport: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'alveychain'],
    tags: ['dex', 'concentrated-liquidity', 'multi-chain'],
    native: false,
    integration: 'deep-link'
  },
  {
    id: 'aave',
    name: 'Aave',
    descriptionKey: 'appHub.apps.aave.description',
    longDescriptionKey: 'appHub.apps.aave.longDescription',
    category: 'defi',
    url: 'https://app.aave.com',
    logo: '/images/apps/aave.png',
    userCount: '1.8M+',
    tvl: '$4.7B',
    featured: true,
    mature: true,
    rating: 4.8,
    chainSupport: ['ethereum', 'polygon', 'avalanche', 'arbitrum', 'alveychain'],
    tags: ['lending', 'borrowing', 'flash-loans'],
    native: false,
    integration: 'deep-link'
  },
  {
    id: 'yearn',
    name: 'Yearn Finance',
    descriptionKey: 'appHub.apps.yearn.description',
    longDescriptionKey: 'appHub.apps.yearn.longDescription',
    category: 'defi',
    url: 'https://yearn.finance',
    logo: '/images/apps/yearn.png',
    userCount: '720K+',
    tvl: '$1.2B',
    mature: true,
    rating: 4.7,
    chainSupport: ['ethereum', 'fantom', 'arbitrum', 'alveychain'],
    tags: ['yield', 'aggregator', 'auto-compounding'],
    native: false,
    integration: 'deep-link'
  },
  {
    id: 'nftfi',
    name: 'NFTfi',
    descriptionKey: 'appHub.apps.nftfi.description',
    longDescriptionKey: 'appHub.apps.nftfi.longDescription',
    category: 'defi',
    url: 'https://nftfi.com',
    logo: '/images/apps/nftfi.png',
    userCount: '87K+',
    tvl: '$142M',
    mature: true,
    rating: 4.5,
    chainSupport: ['ethereum', 'polygon', 'alveychain'],
    tags: ['nft-loans', 'p2p-lending'],
    native: false,
    integration: 'iframe'
  },

  // 第三方集成应用 - NFT和元宇宙
  {
    id: 'blur',
    name: 'Blur',
    descriptionKey: 'appHub.apps.blur.description',
    longDescriptionKey: 'appHub.apps.blur.longDescription',
    category: 'nft',
    url: 'https://blur.io',
    logo: '/images/apps/blur.png',
    userCount: '650K+',
    tvl: '$320M',
    featured: true,
    mature: true,
    rating: 4.8,
    chainSupport: ['ethereum', 'alveychain'],
    tags: ['nft-marketplace', 'trading', 'professional'],
    native: false,
    integration: 'deep-link'
  },
  {
    id: 'foundation',
    name: 'Foundation',
    descriptionKey: 'appHub.apps.foundation.description',
    longDescriptionKey: 'appHub.apps.foundation.longDescription',
    category: 'nft',
    url: 'https://foundation.app',
    logo: '/images/apps/foundation.png',
    userCount: '420K+',
    tvl: '$87M',
    mature: true,
    rating: 4.6,
    chainSupport: ['ethereum', 'alveychain'],
    tags: ['nft-marketplace', 'art', 'curated'],
    native: false,
    integration: 'deep-link'
  },
  {
    id: 'sandbox',
    name: 'The Sandbox',
    descriptionKey: 'appHub.apps.sandbox.description',
    longDescriptionKey: 'appHub.apps.sandbox.longDescription',
    category: 'metaverse',
    url: 'https://www.sandbox.game',
    logo: '/images/apps/sandbox.png',
    userCount: '2.2M+',
    tvl: '$520M',
    featured: true,
    mature: true,
    rating: 4.7,
    chainSupport: ['ethereum', 'polygon', 'alveychain'],
    tags: ['metaverse', 'gaming', 'virtual-land'],
    native: false,
    integration: 'iframe'
  },
  {
    id: 'decentraland',
    name: 'Decentraland',
    descriptionKey: 'appHub.apps.decentraland.description',
    longDescriptionKey: 'appHub.apps.decentraland.longDescription',
    category: 'metaverse',
    url: 'https://decentraland.org',
    logo: '/images/apps/decentraland.png',
    userCount: '1.8M+',
    tvl: '$380M',
    mature: true,
    rating: 4.5,
    chainSupport: ['ethereum', 'alveychain'],
    tags: ['metaverse', 'virtual-land', 'events'],
    native: false,
    integration: 'iframe'
  },

  // 第三方集成应用 - 游戏
  {
    id: 'illuvium',
    name: 'Illuvium',
    descriptionKey: 'appHub.apps.illuvium.description',
    longDescriptionKey: 'appHub.apps.illuvium.longDescription',
    category: 'gaming',
    url: 'https://illuvium.io',
    logo: '/images/apps/illuvium.png',
    userCount: '850K+',
    tvl: '$210M',
    featured: true,
    mature: false,
    rating: 4.8,
    chainSupport: ['ethereum', 'immutablex', 'alveychain'],
    tags: ['gaming', 'rpg', 'aaa'],
    native: false,
    integration: 'deep-link'
  },
  {
    id: 'axie',
    name: 'Axie Infinity',
    descriptionKey: 'appHub.apps.axie.description',
    longDescriptionKey: 'appHub.apps.axie.longDescription',
    category: 'gaming',
    url: 'https://axieinfinity.com',
    logo: '/images/apps/axie.png',
    userCount: '3M+',
    tvl: '$150M',
    mature: true,
    rating: 4.6,
    chainSupport: ['ronin', 'ethereum', 'alveychain'],
    tags: ['gaming', 'play-to-earn', 'breeding'],
    native: false,
    integration: 'deep-link'
  },
  
  // 第三方集成应用 - 基础设施
  {
    id: 'layerzero',
    name: 'LayerZero',
    descriptionKey: 'appHub.apps.layerzero.description',
    longDescriptionKey: 'appHub.apps.layerzero.longDescription',
    category: 'bridge',
    url: 'https://layerzero.network',
    logo: '/images/apps/layerzero.png',
    userCount: '1.2M+',
    tvl: '$840M',
    featured: true,
    mature: true,
    rating: 4.9,
    chainSupport: ['ethereum', 'bsc', 'avalanche', 'arbitrum', 'polygon', 'alveychain'],
    tags: ['bridge', 'omnichain', 'messaging'],
    native: false,
    integration: 'deep-link'
  },
  {
    id: 'chainlink',
    name: 'Chainlink',
    descriptionKey: 'appHub.apps.chainlink.description',
    longDescriptionKey: 'appHub.apps.chainlink.longDescription',
    category: 'tools',
    url: 'https://chain.link',
    logo: '/images/apps/chainlink.png',
    userCount: '2.5M+',
    mature: true,
    rating: 4.9,
    chainSupport: ['ethereum', 'bsc', 'polygon', 'avalanche', 'alveychain'],
    tags: ['oracle', 'data-feeds', 'vrf'],
    native: false,
    integration: 'api'
  },
  {
    id: 'lens',
    name: 'Lens Protocol',
    descriptionKey: 'appHub.apps.lens.description',
    longDescriptionKey: 'appHub.apps.lens.longDescription',
    category: 'social',
    url: 'https://lens.xyz',
    logo: '/images/apps/lens.png',
    userCount: '450K+',
    mature: true,
    rating: 4.7,
    chainSupport: ['polygon', 'alveychain'],
    tags: ['social', 'identity', 'web3'],
    native: false,
    integration: 'api'
  },
  {
    id: 'farcaster',
    name: 'Farcaster',
    category: 'social',
    url: 'https://farcaster.xyz',
    icon: 'users',
    descriptionKey: 'app.farcasterDesc',
  },
  {
    id: 'learnweb3',
    name: 'LearnWeb3',
    category: 'education',
    url: 'https://learnweb3.io',
    icon: 'book',
    descriptionKey: 'app.learnweb3Desc',
  },
  {
    id: 'buildspace',
    name: 'Buildspace',
    category: 'education',
    url: 'https://buildspace.so',
    icon: 'book',
    descriptionKey: 'app.buildspaceDesc',
  }
];

// 应用类别
export const categories = [
  { id: 'all', name: '全部' },
  { id: 'nft', name: 'NFT' },
  { id: 'defi', name: 'DeFi' },
  { id: 'gamefi', name: 'GameFi' },
  { id: 'market', name: '市场' },
  { id: 'dao', name: 'DAO' },
  { id: 'tools', name: '工具' },
  { id: 'bridge', name: '跨链桥' },
  { id: 'social', name: '社交' },
  { id: 'education', name: '教育' }
];

// 获取推荐应用
export const getFeaturedApps = () => {
  return applications.filter(app => app.featured);
};

// 获取特定类别的应用
export const getAppsByCategory = (category) => {
  if (category === 'all') return applications;
  return applications.filter(app => app.category === category);
};

// 通过ID获取应用
export const getAppById = (id) => {
  return applications.find(app => app.id === id);
};

// 搜索应用
export const searchApps = (term, category = 'all') => {
  const lowerTerm = term.toLowerCase();
  return applications.filter(app => {
    const matchesCategory = category === 'all' || app.category === category;
    const matchesName = app.name.toLowerCase().includes(lowerTerm);
    const matchesTags = app.tags && app.tags.some(tag => tag.toLowerCase().includes(lowerTerm));
    
    return matchesCategory && (matchesName || matchesTags);
  });
};

export default applications; 