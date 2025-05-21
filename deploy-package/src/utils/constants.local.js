// AlveyChain network settings
export const NETWORK = {
  chainId: '0xED5', // 3797 in decimal (AlveyChain)
  chainName: 'AlveyChain',
  nativeCurrency: {
    name: 'ALV',
    symbol: 'ALV',
    decimals: 18
  },
  rpcUrls: ['https://elves-core1.alvey.io/', 'https://elves-core2.alvey.io/', 'https://elves-core3.alvey.io/'],
  blockExplorerUrls: ['https://alveyscan.com/']
};

// Contract addresses updated from mock deployment
export const CONTRACT_ADDRESSES = {
  PAYMENT_TOKEN: '0xF88c032e746E3E701B316C8052bF271DB540871E',
  NFT_CONTRACT: '0xA3FD15143C6d59b12D8A3ec6aBc4aFbFc9717783',
  SPACE_CONTRACT: '0x1E14dA01C70845AEA03b2AC8D582538Ff48239af',
  MARKET_CONTRACT: '0x1A36D5019fc61cc9628ABabBBed137b2b4BD6f11'
};

// File upload limits
export const UPLOAD_LIMITS = {
  MODEL_SIZE_MB: 50,
  THUMBNAIL_SIZE_MB: 5
};

// Supported 3D model formats
export const SUPPORTED_FORMATS = [
  { value: 'glb', label: 'GLB', mime: 'model/gltf-binary' },
  { value: 'gltf', label: 'GLTF', mime: 'model/gltf+json' },
  { value: 'obj', label: 'OBJ', mime: 'model/obj' },
  { value: 'fbx', label: 'FBX', mime: 'application/octet-stream' }
];

// Space types and sizes mappings
export const SPACE_TYPES = {
  0: 'Gallery',
  1: 'Showroom',
  2: 'Game',
  3: 'Social'
};

export const SPACE_SIZES = {
  0: 'Small',
  1: 'Medium',
  2: 'Large'
};

// Default metadata for new NFTs
export const DEFAULT_NFT_METADATA = {
  name: '',
  description: '',
  modelURI: '',
  thumbnailURI: '',
  format: 'glb',
  vrCompatible: true,
  tags: [],
  createdAt: 0,
  updatedAt: 0,
  creator: ''
}; 