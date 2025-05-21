import React, { useState } from 'react';
import { 
  FaGamepad, FaShoppingCart, FaMoneyBillWave, FaPalette, FaGlobe, FaUsers,
  FaExchangeAlt, FaChartLine, FaMusic, FaSchool, FaHeadset, FaCoins,
  FaBuilding, FaBriefcase, FaCode, FaRobot, FaHandshake, FaPhotoVideo
} from 'react-icons/fa';

/**
 * DAppsHub组件 - 提供集成第三方应用的中心
 * 这允许用户在平台内使用各种流行的DApps
 */
const DAppsHub = () => {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 可用的第三方应用列表
  const applications = [
    // 现有应用
    {
      id: 'decentraland',
      name: 'Decentraland',
      description: '连接Decentraland元宇宙，并导入/导出您的AlveyChain NFT',
      icon: <FaGlobe className="text-blue-400 text-2xl" />,
      category: '元宇宙',
      url: 'https://decentraland.org',
      comingSoon: false,
      featured: true
    },
    {
      id: 'sandbox',
      name: 'The Sandbox',
      description: '使用您的NFT在Sandbox世界中构建和玩耍',
      icon: <FaGamepad className="text-yellow-400 text-2xl" />,
      category: '元宇宙',
      url: 'https://www.sandbox.game',
      comingSoon: false
    },
    {
      id: 'opensea',
      name: 'OpenSea集成',
      description: '将您的AlveyChain NFT跨链到OpenSea市场',
      icon: <FaShoppingCart className="text-green-400 text-2xl" />,
      category: '市场',
      url: 'https://opensea.io',
      comingSoon: false
    },
    {
      id: 'aave',
      name: 'Aave借贷',
      description: '使用您的NFT作为抵押物进行借贷',
      icon: <FaMoneyBillWave className="text-purple-400 text-2xl" />,
      category: 'DeFi',
      url: 'https://aave.com',
      comingSoon: false
    },
    {
      id: 'ai-generator',
      name: 'AI创作工具',
      description: 'AI辅助生成3D模型和虚拟空间',
      icon: <FaPalette className="text-red-400 text-2xl" />,
      category: '创作工具',
      url: '#',
      comingSoon: false,
      featured: true
    },
    {
      id: 'virtual-events',
      name: '虚拟活动平台',
      description: '在您的虚拟空间中举办社交活动和会议',
      icon: <FaUsers className="text-indigo-400 text-2xl" />,
      category: '社交',
      url: '#',
      comingSoon: false
    },
    
    // 新增元宇宙应用
    {
      id: 'somnium-space',
      name: 'Somnium Space',
      description: '可用您的NFT定制的高级VR元宇宙体验',
      icon: <FaHeadset className="text-blue-500 text-2xl" />,
      category: '元宇宙',
      url: 'https://somniumspace.com',
      comingSoon: false
    },
    {
      id: 'cryptovoxels',
      name: 'Voxels',
      description: '基于体素的虚拟世界，可导入您的3D NFT',
      icon: <FaGlobe className="text-cyan-400 text-2xl" />,
      category: '元宇宙',
      url: 'https://www.voxels.com',
      comingSoon: false
    },
    
    // 新增市场应用
    {
      id: 'rarible',
      name: 'Rarible',
      description: '将您的NFT跨链到Rarible进行销售',
      icon: <FaShoppingCart className="text-orange-400 text-2xl" />,
      category: '市场',
      url: 'https://rarible.com',
      comingSoon: false
    },
    {
      id: 'blur',
      name: 'Blur',
      description: '面向专业交易者的高级NFT交易平台',
      icon: <FaExchangeAlt className="text-indigo-400 text-2xl" />,
      category: '市场',
      url: 'https://blur.io',
      comingSoon: true,
      featured: true
    },
    
    // 新增DeFi应用
    {
      id: 'nftfi',
      name: 'NFTfi',
      description: 'P2P NFT贷款平台，最大化您的NFT价值',
      icon: <FaHandshake className="text-green-500 text-2xl" />,
      category: 'DeFi',
      url: 'https://nftfi.com',
      comingSoon: false
    },
    {
      id: 'uniswap',
      name: 'Uniswap V3 NFT',
      description: '使用您的流动性提供者NFT进行DeFi交易',
      icon: <FaExchangeAlt className="text-pink-400 text-2xl" />,
      category: 'DeFi',
      url: 'https://uniswap.org',
      comingSoon: false
    },
    {
      id: 'paraswap',
      name: 'ParaSwap',
      description: '多链聚合器，为您的NFT交易找到最佳价格',
      icon: <FaCoins className="text-blue-400 text-2xl" />,
      category: 'DeFi',
      url: 'https://paraswap.io',
      comingSoon: false
    },
    
    // 新增创作工具
    {
      id: 'nft-generator',
      name: '批量NFT生成器',
      description: '快速创建NFT系列的工具，包含特征管理',
      icon: <FaPhotoVideo className="text-amber-400 text-2xl" />,
      category: '创作工具',
      url: '#',
      comingSoon: false
    },
    {
      id: 'midjourney-3d',
      name: 'Midjourney 3D',
      description: '从文本生成3D模型的AI工具',
      icon: <FaRobot className="text-emerald-400 text-2xl" />,
      category: '创作工具',
      url: '#',
      comingSoon: true,
      featured: true
    },
    {
      id: 'blender-web',
      name: 'Blender Web',
      description: '浏览器中运行的简化版Blender 3D建模工具',
      icon: <FaCode className="text-orange-400 text-2xl" />,
      category: '创作工具',
      url: '#',
      comingSoon: true
    },
    
    // 新增社交应用
    {
      id: 'nft-social',
      name: 'NFT社交网络',
      description: '专为NFT收藏家和创作者设计的社交平台',
      icon: <FaUsers className="text-purple-400 text-2xl" />,
      category: '社交',
      url: '#',
      comingSoon: false
    },
    {
      id: 'metaverse-chat',
      name: '元宇宙聊天室',
      description: '在虚拟空间内与其他用户实时交流',
      icon: <FaUsers className="text-blue-400 text-2xl" />,
      category: '社交',
      url: '#',
      comingSoon: false
    },
    
    // 新增游戏类别
    {
      id: 'axie-infinity',
      name: 'Axie Infinity',
      description: '导入您的NFT作为游戏角色',
      icon: <FaGamepad className="text-pink-400 text-2xl" />,
      category: '游戏',
      url: 'https://axieinfinity.com',
      comingSoon: false
    },
    {
      id: 'gods-unchained',
      name: 'Gods Unchained',
      description: '基于NFT的数字卡牌游戏',
      icon: <FaGamepad className="text-yellow-500 text-2xl" />,
      category: '游戏',
      url: 'https://godsunchained.com',
      comingSoon: false
    },
    {
      id: 'illuvium',
      name: 'Illuvium',
      description: '开放世界RPG游戏，使用NFT角色',
      icon: <FaGamepad className="text-blue-500 text-2xl" />,
      category: '游戏',
      url: 'https://illuvium.io',
      comingSoon: true,
      featured: true
    },
    
    // 新增数据分析类别
    {
      id: 'nftscoring',
      name: 'NFT评分系统',
      description: '使用AI分析和评估NFT的市场价值',
      icon: <FaChartLine className="text-green-500 text-2xl" />,
      category: '数据分析',
      url: '#',
      comingSoon: false
    },
    {
      id: 'nft-analytics',
      name: 'NFT市场分析',
      description: '跟踪NFT市场趋势、交易量和价格走势',
      icon: <FaChartLine className="text-purple-500 text-2xl" />,
      category: '数据分析',
      url: '#',
      comingSoon: false,
      featured: true
    },
    
    // 新增教育类别
    {
      id: 'nft-academy',
      name: 'NFT学院',
      description: '学习创建、交易和最大化NFT价值的课程',
      icon: <FaSchool className="text-blue-400 text-2xl" />,
      category: '教育',
      url: '#',
      comingSoon: false
    },
    {
      id: '3d-modeling-courses',
      name: '3D建模课程',
      description: '从入门到专业的3D建模和动画教程',
      icon: <FaSchool className="text-amber-400 text-2xl" />,
      category: '教育',
      url: '#',
      comingSoon: false
    },
    
    // 新增商业类别
    {
      id: 'metaverse-office',
      name: '元宇宙办公空间',
      description: '为企业提供的虚拟办公场所和会议室',
      icon: <FaBuilding className="text-indigo-400 text-2xl" />,
      category: '商业',
      url: '#',
      comingSoon: false
    },
    {
      id: 'virtual-storefront',
      name: '虚拟店铺',
      description: '在元宇宙中创建品牌旗舰店和展示间',
      icon: <FaBriefcase className="text-emerald-400 text-2xl" />,
      category: '商业',
      url: '#',
      comingSoon: true
    },
    
    // 新增音乐类别
    {
      id: 'nft-music',
      name: 'NFT音乐平台',
      description: '创建、购买和交易音乐NFT',
      icon: <FaMusic className="text-purple-500 text-2xl" />,
      category: '音乐',
      url: '#',
      comingSoon: false,
      featured: true
    },
    {
      id: 'virtual-concerts',
      name: '虚拟音乐会',
      description: '在元宇宙中举办和参加虚拟音乐会',
      icon: <FaMusic className="text-red-400 text-2xl" />,
      category: '音乐',
      url: '#',
      comingSoon: false
    }
  ];
  
  // 应用类别列表 - 添加新的类别
  const categories = ['全部', '元宇宙', '市场', 'DeFi', '创作工具', '社交', '游戏', '数据分析', '教育', '商业', '音乐'];
  
  // 筛选应用 - 现在加入搜索功能
  const filteredApps = applications
    .filter(app => {
      const matchesCategory = activeCategory === '全部' || app.category === activeCategory;
      const matchesSearch = !searchTerm || 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        app.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
    
  // 获取推荐应用
  const featuredApps = applications.filter(app => app.featured);

  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-2">应用中心</h2>
      <p className="text-gray-300 text-sm mb-6">探索和使用与MetaverseX集成的第三方应用</p>
      
      {/* 搜索栏 */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索应用..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            onClick={() => setSearchTerm('')}
          >
            {searchTerm && "✕"}
          </button>
        </div>
      </div>
      
      {/* 推荐应用 - 仅在"全部"类别和没有搜索词时显示 */}
      {activeCategory === '全部' && !searchTerm && featuredApps.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">推荐应用</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredApps.map(app => (
              <div 
                key={app.id}
                className="bg-gradient-to-br from-gray-700/70 to-gray-800/70 rounded-lg overflow-hidden hover:from-gray-600/70 hover:to-gray-700/70 transition-colors shadow-md border border-gray-600/30"
              >
                <div className="p-4 flex flex-col h-full">
                  <div className="flex items-center mb-3">
                    <div className="mr-3 p-2 bg-gray-800/80 rounded-lg">
                      {app.icon}
                    </div>
                    <div>
                      <h3 className="font-bold">{app.name}</h3>
                      <span className="text-xs text-gray-400">{app.category}</span>
                    </div>
                    {app.comingSoon && (
                      <span className="ml-auto text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">即将推出</span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-4 flex-grow">{app.description}</p>
                  
                  <button
                    onClick={() => !app.comingSoon && window.open(app.url, '_blank')}
                    disabled={app.comingSoon}
                    className={`w-full py-2 rounded-lg transition-colors ${
                      app.comingSoon 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-500 text-white'
                    }`}
                  >
                    {app.comingSoon ? '即将推出' : '启动应用'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 类别导航 */}
      <div className="flex overflow-x-auto pb-2 mb-6 no-scrollbar">
        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* 应用列表 */}
      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map(app => (
            <div 
              key={app.id}
              className="bg-gray-700/50 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
            >
              <div className="p-4 flex flex-col h-full">
                <div className="flex items-center mb-3">
                  <div className="mr-3 p-2 bg-gray-800 rounded-lg">
                    {app.icon}
                  </div>
                  <div>
                    <h3 className="font-bold">{app.name}</h3>
                    <span className="text-xs text-gray-400">{app.category}</span>
                  </div>
                  {app.comingSoon && (
                    <span className="ml-auto text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">即将推出</span>
                  )}
                </div>
                
                <p className="text-sm text-gray-300 mb-4 flex-grow">{app.description}</p>
                
                <button
                  onClick={() => !app.comingSoon && window.open(app.url, '_blank')}
                  disabled={app.comingSoon}
                  className={`w-full py-2 rounded-lg transition-colors ${
                    app.comingSoon 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-500 text-white'
                  }`}
                >
                  {app.comingSoon ? '即将推出' : '启动应用'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 没有找到结果时显示
        <div className="text-center py-10">
          <div className="text-gray-400 mb-2">未找到符合条件的应用</div>
          <button 
            onClick={() => {
              setSearchTerm('');
              setActiveCategory('全部');
            }}
            className="text-primary-500 hover:text-primary-400"
          >
            清除筛选条件
          </button>
        </div>
      )}
    </div>
  );
};

export default DAppsHub;