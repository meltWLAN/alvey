import sampleData from '../assets/3d/models.json';
import { ipfsUriToHttpUrl } from './ipfs';

/**
 * Load sample models data
 * @returns {Array} Array of model objects
 */
export const loadSampleModels = () => {
  return sampleData.sampleModels.map(model => ({
    id: model.id,
    name: model.name,
    description: model.description,
    thumbnailURI: model.thumbnailUrl,
    modelURI: model.modelUrl,
    format: model.format,
    vrCompatible: model.vrCompatible,
    creator: '0x1234567890123456789012345678901234567890',
    price: Math.floor(Math.random() * 200) + 50,
    tags: generateRandomTags(model.name)
  }));
};

/**
 * Load sample spaces data
 * @returns {Array} Array of space objects
 */
export const loadSampleSpaces = () => {
  return sampleData.sampleSpaces.map(space => {
    const isForSale = Math.random() > 0.5;
    
    return {
      id: space.id,
      name: space.name,
      description: space.description,
      thumbnailURI: space.thumbnailUrl,
      spaceURI: space.modelUrl,
      spaceType: Math.floor(Math.random() * 4),
      spaceSize: Math.floor(Math.random() * 3),
      owner: isForSale ? '0x0000000000000000000000000000000000000000' : '0x1234567890123456789012345678901234567890',
      tenant: null,
      price: isForSale ? (Math.floor(Math.random() * 400) + 100) : 0,
      rentalPrice: Math.floor(Math.random() * 30) + 10,
      isRentable: true,
      isActive: true
    };
  });
};

/**
 * Generate thumbnail URL for model or space
 * @param {string} uri - IPFS URI or HTTP URL
 * @returns {string} HTTP URL
 */
export const getThumbnailUrl = (uri) => {
  if (!uri) return 'https://via.placeholder.com/400/2c3e50/ffffff?text=No+Image';
  
  if (uri.startsWith('http')) {
    return uri;
  }
  
  return ipfsUriToHttpUrl(uri);
};

/**
 * Generate random tags based on name
 * @param {string} name - Name to generate tags from
 * @returns {Array} Array of tags
 * @private
 */
const generateRandomTags = (name) => {
  const allTags = [
    '3D', 'VR', '艺术', '游戏', '科幻', '建筑', 
    '角色', '场景', '魔法', '未来', '科技', '动漫',
    '宇宙', '自然', '动物', '花园', '机械', '车辆'
  ];
  
  // Always include name as a tag
  const nameTag = name.split(' ')[0].toLowerCase();
  
  // Get 1-3 random tags
  const count = Math.floor(Math.random() * 3) + 1;
  const randomTags = [];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * allTags.length);
    const tag = allTags[randomIndex];
    
    if (!randomTags.includes(tag)) {
      randomTags.push(tag);
    }
  }
  
  return [...randomTags, nameTag];
}; 