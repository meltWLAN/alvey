import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Web3Context } from '../contexts/Web3Context';
import { useNotification } from '../contexts/NotificationContext';
import NFTCard from '../components/NFTCard';
import VRControls from '../components/VRControls';
import LoadingState from '../components/LoadingState';
import { loadSampleModels } from '../utils/modelLoader';

// 示例NFT数据
const mockNFTs = [
  {
    id: 1,
    name: "Cosmic Explorer",
    description: "一个宇宙探索飞船的3D模型，适合在多元宇宙中展示。",
    thumbnailURI: "https://via.placeholder.com/300/4a90e2/ffffff?text=Cosmic+Explorer",
    modelURI: "https://example.com/models/cosmic-explorer.glb",
    creator: "0x1234567890123456789012345678901234567890",
    price: 120,
    format: "glb",
    vrCompatible: true,
    tags: ["宇宙", "飞船", "科幻"]
  },
  {
    id: 2,
    name: "神秘花园",
    description: "一个充满魔法的神秘花园场景，有各种奇特的植物和小动物。",
    thumbnailURI: "https://via.placeholder.com/300/8e44ad/ffffff?text=神秘花园",
    modelURI: "https://example.com/models/enchanted-garden.glb",
    creator: "0x2345678901234567890123456789012345678901",
    price: 85,
    format: "glb",
    vrCompatible: true,
    tags: ["花园", "魔法", "自然"]
  },
  {
    id: 3,
    name: "未来城市建筑",
    description: "一个未来科技风格的城市建筑，具有独特的结构和照明效果。",
    thumbnailURI: "https://via.placeholder.com/300/e74c3c/ffffff?text=未来建筑",
    modelURI: "https://example.com/models/future-building.glb",
    creator: "0x3456789012345678901234567890123456789012",
    price: 200,
    format: "glb",
    vrCompatible: false,
    tags: ["建筑", "未来", "科技"]
  },
  {
    id: 4,
    name: "龙珠收藏",
    description: "七颗龙珠的精细3D模型套装，每个都有详细的纹理。",
    thumbnailURI: "https://via.placeholder.com/300/f1c40f/ffffff?text=龙珠收藏",
    modelURI: "https://example.com/models/dragon-balls.glb",
    creator: "0x4567890123456789012345678901234567890123",
    price: 150,
    format: "glb",
    vrCompatible: true,
    tags: ["动漫", "收藏品", "龙珠"]
  }
];

// 过滤选项
const filterOptions = {
  sort: [
    { value: 'price-asc', label: '价格: 低到高' },
    { value: 'price-desc', label: '价格: 高到低' },
    { value: 'newest', label: '最新上架' }
  ],
  vrCompatible: [
    { value: 'all', label: '所有资产' },
    { value: 'vr-only', label: '只看VR资产' }
  ]
};

const Marketplace = () => {
  const navigate = useNavigate();
  const { contracts } = useContext(Web3Context);
  const { showError } = useNotification();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState({
    sort: 'newest',
    vrCompatible: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // 加载NFT数据
  useEffect(() => {
    const loadNFTs = async () => {
      setLoading(true);
      try {
        // 如果合约可用，从合约加载数据
        if (contracts.market && contracts.nft) {
          console.log('Loading NFTs from contracts...');
          // 此处添加实际合约调用
          // 由于现在没有实际连接到链，我们使用示例数据
        }
        
        // 加载示例数据
        const sampleNfts = loadSampleModels();
        setNfts(sampleNfts);
      } catch (error) {
        console.error('Error loading NFTs:', error);
        showError(`加载NFT列表失败: ${error.message || '未知错误'}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadNFTs();
  }, [contracts.market, contracts.nft, showError]);

  // 处理NFT点击
  const handleNFTClick = (nft) => {
    navigate(`/marketplace/${nft.id}`);
  };

  // 过滤和排序NFTs
  const getFilteredNFTs = () => {
    if (!nfts || nfts.length === 0) return [];
    
    let filtered = [...nfts];
    
    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(nft => 
        nft.name.toLowerCase().includes(term) || 
        nft.description.toLowerCase().includes(term) ||
        (nft.tags && nft.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    // VR兼容性过滤
    if (activeFilter.vrCompatible === 'vr-only') {
      filtered = filtered.filter(nft => nft.vrCompatible);
    }
    
    // 排序
    switch (activeFilter.sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }
    
    return filtered;
  };
  
  const filteredNFTs = getFilteredNFTs();
  const hasResults = filteredNFTs.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold gradient-text">NFT市场</h1>
        <VRControls />
      </div>
      
      {/* 过滤器和搜索 */}
      <div className="bg-gray-800/50 p-4 rounded-lg mb-8 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索NFT资产..."
                className="input-bordered w-full p-2 pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                🔍
              </div>
              {searchTerm && (
                <button 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              className="input-bordered px-2 py-2"
              value={activeFilter.sort}
              onChange={(e) => setActiveFilter({...activeFilter, sort: e.target.value})}
            >
              {filterOptions.sort.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            
            <select
              className="input-bordered px-2 py-2"
              value={activeFilter.vrCompatible}
              onChange={(e) => setActiveFilter({...activeFilter, vrCompatible: e.target.value})}
            >
              {filterOptions.vrCompatible.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* 加载中状态 */}
      {loading ? (
        <LoadingState message="加载NFT资产中..." />
      ) : (
        /* NFT卡片列表 */
        hasResults ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNFTs.map(nft => (
              <NFTCard 
                key={nft.id} 
                nft={nft} 
                onClick={handleNFTClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800/30 rounded-lg backdrop-blur-sm">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl text-gray-400 mb-2">没有找到符合条件的NFT资产</p>
            <p className="text-gray-500 mb-4">尝试使用不同的搜索词或过滤条件</p>
            <button 
              className="btn-gradient px-4 py-2 rounded-full text-sm"
              onClick={() => {
                setSearchTerm('');
                setActiveFilter({
                  sort: 'newest',
                  vrCompatible: 'all'
                });
              }}
            >
              重置过滤器
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default Marketplace; 