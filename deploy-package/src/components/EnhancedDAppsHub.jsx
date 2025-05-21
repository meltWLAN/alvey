import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaGamepad, FaShoppingCart, FaMoneyBillWave, FaPalette, FaGlobe, FaUsers,
  FaExchangeAlt, FaChartLine, FaMusic, FaSchool, FaHeadset, FaCoins,
  FaBuilding, FaBriefcase, FaCode, FaRobot, FaHandshake, FaPhotoVideo
} from 'react-icons/fa';

/**
 * EnhancedDAppsHub组件 - 提供集成第三方应用的增强中心
 * 这允许用户在平台内使用各种流行的DApps
 * 相比原版DAppsHub，增加了更多应用类别和搜索功能
 */
const EnhancedDAppsHub = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(t('dappsHub.allCategories'));
  const [searchTerm, setSearchTerm] = useState('');
  
  // 可用的第三方应用列表
  const applications = [
    // 现有应用
    {
      id: 'decentraland',
      name: 'Decentraland',
      description: t('dappsHub.apps.decentraland.description'),
      icon: <FaGlobe className="text-blue-400 text-2xl" />,
      category: t('dappsHub.categories.metaverse'),
      url: 'https://decentraland.org',
      comingSoon: false,
      featured: true
    },
    {
      id: 'sandbox',
      name: 'The Sandbox',
      description: t('dappsHub.apps.sandbox.description'),
      icon: <FaGamepad className="text-yellow-400 text-2xl" />,
      category: t('dappsHub.categories.metaverse'),
      url: 'https://www.sandbox.game',
      comingSoon: false
    },
    {
      id: 'opensea',
      name: 'OpenSea',
      description: t('dappsHub.apps.opensea.description'),
      icon: <FaShoppingCart className="text-green-400 text-2xl" />,
      category: t('dappsHub.categories.nft'),
      url: 'https://opensea.io',
      comingSoon: false
    },
    {
      id: 'aave',
      name: 'Aave',
      description: t('dappsHub.apps.aave.description'),
      icon: <FaMoneyBillWave className="text-purple-400 text-2xl" />,
      category: t('dappsHub.categories.defi'),
      url: 'https://aave.com',
      comingSoon: false
    },
    {
      id: 'ai-generator',
      name: t('dappsHub.apps.aiGenerator.name'),
      description: t('dappsHub.apps.aiGenerator.description'),
      icon: <FaPalette className="text-red-400 text-2xl" />,
      category: t('dappsHub.categories.creator'),
      url: '#',
      comingSoon: false,
      featured: true
    },
    {
      id: 'virtual-events',
      name: t('dappsHub.apps.virtualEvents.name'),
      description: t('dappsHub.apps.virtualEvents.description'),
      icon: <FaUsers className="text-indigo-400 text-2xl" />,
      category: t('dappsHub.categories.social'),
      url: '#',
      comingSoon: false
    },
    
    // 新增元宇宙应用
    {
      id: 'somnium-space',
      name: 'Somnium Space',
      description: t('dappsHub.apps.somniumSpace.description'),
      icon: <FaHeadset className="text-blue-500 text-2xl" />,
      category: t('dappsHub.categories.metaverse'),
      url: 'https://somniumspace.com',
      comingSoon: false
    },
    {
      id: 'cryptovoxels',
      name: 'Voxels',
      description: t('dappsHub.apps.voxels.description'),
      icon: <FaGlobe className="text-cyan-400 text-2xl" />,
      category: t('dappsHub.categories.metaverse'),
      url: 'https://www.voxels.com',
      comingSoon: false
    },
    
    // 新增市场应用
    {
      id: 'rarible',
      name: 'Rarible',
      description: t('dappsHub.apps.rarible.description'),
      icon: <FaShoppingCart className="text-orange-400 text-2xl" />,
      category: t('dappsHub.categories.nft'),
      url: 'https://rarible.com',
      comingSoon: false
    },
    {
      id: 'blur',
      name: 'Blur',
      description: t('dappsHub.apps.blur.description'),
      icon: <FaExchangeAlt className="text-indigo-400 text-2xl" />,
      category: t('dappsHub.categories.nft'),
      url: 'https://blur.io',
      comingSoon: true,
      featured: true
    },
    
    // 新增DeFi应用
    {
      id: 'nftfi',
      name: 'NFTfi',
      description: t('dappsHub.apps.nftfi.description'),
      icon: <FaHandshake className="text-green-500 text-2xl" />,
      category: t('dappsHub.categories.defi'),
      url: 'https://nftfi.com',
      comingSoon: false
    },
    {
      id: 'uniswap',
      name: 'Uniswap V3',
      description: t('dappsHub.apps.uniswap.description'),
      icon: <FaExchangeAlt className="text-pink-400 text-2xl" />,
      category: t('dappsHub.categories.defi'),
      url: 'https://uniswap.org',
      comingSoon: false
    },
    {
      id: 'paraswap',
      name: 'ParaSwap',
      description: t('dappsHub.apps.paraswap.description'),
      icon: <FaCoins className="text-blue-400 text-2xl" />,
      category: t('dappsHub.categories.defi'),
      url: 'https://paraswap.io',
      comingSoon: false
    },
    
    // 新增创作工具
    {
      id: 'nft-generator',
      name: t('dappsHub.apps.nftGenerator.name'),
      description: t('dappsHub.apps.nftGenerator.description'),
      icon: <FaPhotoVideo className="text-amber-400 text-2xl" />,
      category: t('dappsHub.categories.creator'),
      url: '#',
      comingSoon: false
    },
    {
      id: 'midjourney-3d',
      name: 'Midjourney 3D',
      description: t('dappsHub.apps.midjourney.description'),
      icon: <FaRobot className="text-emerald-400 text-2xl" />,
      category: t('dappsHub.categories.creator'),
      url: '#',
      comingSoon: true,
      featured: true
    },
    {
      id: 'blender-web',
      name: 'Blender Web',
      description: t('dappsHub.apps.blenderWeb.description'),
      icon: <FaCode className="text-orange-400 text-2xl" />,
      category: t('dappsHub.categories.creator'),
      url: '#',
      comingSoon: true
    },
    
    // 新增社交应用
    {
      id: 'nft-social',
      name: t('dappsHub.apps.nftSocial.name'),
      description: t('dappsHub.apps.nftSocial.description'),
      icon: <FaUsers className="text-purple-400 text-2xl" />,
      category: t('dappsHub.categories.social'),
      url: '#',
      comingSoon: false
    },
    {
      id: 'metaverse-chat',
      name: t('dappsHub.apps.metaverseChat.name'),
      description: t('dappsHub.apps.metaverseChat.description'),
      icon: <FaUsers className="text-blue-400 text-2xl" />,
      category: t('dappsHub.categories.social'),
      url: '#',
      comingSoon: false
    },
    
    // 新增游戏类别
    {
      id: 'axie-infinity',
      name: 'Axie Infinity',
      description: t('dappsHub.apps.axieInfinity.description'),
      icon: <FaGamepad className="text-pink-400 text-2xl" />,
      category: t('dappsHub.categories.games'),
      url: 'https://axieinfinity.com',
      comingSoon: false
    },
    {
      id: 'gods-unchained',
      name: 'Gods Unchained',
      description: t('dappsHub.apps.godsUnchained.description'),
      icon: <FaGamepad className="text-yellow-500 text-2xl" />,
      category: t('dappsHub.categories.games'),
      url: 'https://godsunchained.com',
      comingSoon: false
    },
    {
      id: 'illuvium',
      name: 'Illuvium',
      description: t('dappsHub.apps.illuvium.description'),
      icon: <FaGamepad className="text-blue-500 text-2xl" />,
      category: t('dappsHub.categories.games'),
      url: 'https://illuvium.io',
      comingSoon: true,
      featured: true
    },
    
    // 新增数据分析类别
    {
      id: 'nftscoring',
      name: t('dappsHub.apps.nftScoring.name'),
      description: t('dappsHub.apps.nftScoring.description'),
      icon: <FaChartLine className="text-green-500 text-2xl" />,
      category: t('dappsHub.categories.analytics'),
      url: '#',
      comingSoon: false
    },
    {
      id: 'nft-analytics',
      name: t('dappsHub.apps.nftAnalytics.name'),
      description: t('dappsHub.apps.nftAnalytics.description'),
      icon: <FaChartLine className="text-purple-500 text-2xl" />,
      category: t('dappsHub.categories.analytics'),
      url: '#',
      comingSoon: false,
      featured: true
    },
    
    // 新增教育类别
    {
      id: 'nft-academy',
      name: t('dappsHub.apps.nftAcademy.name'),
      description: t('dappsHub.apps.nftAcademy.description'),
      icon: <FaSchool className="text-blue-400 text-2xl" />,
      category: t('dappsHub.categories.education'),
      url: '#',
      comingSoon: false
    },
    {
      id: '3d-modeling-courses',
      name: t('dappsHub.apps.modelingCourses.name'),
      description: t('dappsHub.apps.modelingCourses.description'),
      icon: <FaSchool className="text-amber-400 text-2xl" />,
      category: t('dappsHub.categories.education'),
      url: '#',
      comingSoon: false
    },
    
    // 新增商业类别
    {
      id: 'metaverse-office',
      name: t('dappsHub.apps.metaverseOffice.name'),
      description: t('dappsHub.apps.metaverseOffice.description'),
      icon: <FaBuilding className="text-indigo-400 text-2xl" />,
      category: t('dappsHub.categories.governance'),
      url: '#',
      comingSoon: false
    },
    {
      id: 'virtual-storefront',
      name: t('dappsHub.apps.virtualStorefront.name'),
      description: t('dappsHub.apps.virtualStorefront.description'),
      icon: <FaBriefcase className="text-emerald-400 text-2xl" />,
      category: t('dappsHub.categories.governance'),
      url: '#',
      comingSoon: true
    },
    
    // 新增音乐类别
    {
      id: 'nft-music',
      name: t('dappsHub.apps.nftMusic.name'),
      description: t('dappsHub.apps.nftMusic.description'),
      icon: <FaMusic className="text-purple-500 text-2xl" />,
      category: t('dappsHub.categories.creator'),
      url: '#',
      comingSoon: false,
      featured: true
    },
    {
      id: 'virtual-concerts',
      name: t('dappsHub.apps.virtualConcerts.name'),
      description: t('dappsHub.apps.virtualConcerts.description'),
      icon: <FaMusic className="text-red-400 text-2xl" />,
      category: t('dappsHub.categories.creator'),
      url: '#',
      comingSoon: false
    }
  ];
  
  // 应用类别列表 - 添加新的类别
  const categories = [
    t('dappsHub.allCategories'), 
    t('dappsHub.categories.metaverse'), 
    t('dappsHub.categories.nft'), 
    t('dappsHub.categories.defi'), 
    t('dappsHub.categories.creator'),
    t('dappsHub.categories.social'),
    t('dappsHub.categories.games'),
    t('dappsHub.categories.analytics'),
    t('dappsHub.categories.education'),
    t('dappsHub.categories.governance'),
    t('dappsHub.categories.bridges')
  ];
  
  // 筛选应用 - 现在加入搜索功能
  const filteredApps = applications
    .filter(app => {
      const matchesCategory = activeCategory === t('dappsHub.allCategories') || app.category === activeCategory;
      const matchesSearch = !searchTerm || 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        app.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
    
  // 获取推荐应用
  const featuredApps = applications.filter(app => app.featured);

  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-2">{t('dappsHub.title')}</h2>
      <p className="text-gray-300 text-sm mb-6">{t('dappsHub.subtitle')}</p>
      
      {/* 搜索栏 */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={t('dappsHub.searchPlaceholder')}
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
      {activeCategory === t('dappsHub.allCategories') && !searchTerm && featuredApps.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">{t('dappsHub.featured')}</h3>
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
                      <span className="ml-auto text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">{t('dappsHub.appCard.comingSoon')}</span>
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
                    {app.comingSoon ? t('dappsHub.appCard.comingSoon') : t('dappsHub.appCard.launch')}
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
                    <span className="ml-auto text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">{t('dappsHub.appCard.comingSoon')}</span>
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
                  {app.comingSoon ? t('dappsHub.appCard.comingSoon') : t('dappsHub.appCard.launch')}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">{t('dappsHub.noAppsFound')}</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedDAppsHub; 