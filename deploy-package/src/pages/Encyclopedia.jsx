import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaStar, FaBook, FaCode, FaGlobe, FaListAlt, FaQuestion, FaTools } from 'react-icons/fa';

/**
 * AlveyChain百科全书页面
 * 提供AlveyChain生态系统的详细信息、热门应用指南和教程
 */
const Encyclopedia = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTopic, setActiveTopic] = useState(null);

  // 百科全书类别
  const categories = [
    { id: 'all', name: t('encyclopedia.categories.all'), icon: <FaListAlt /> },
    { id: 'basics', name: t('encyclopedia.categories.basics'), icon: <FaBook /> },
    { id: 'dapps', name: t('encyclopedia.categories.dapps'), icon: <FaGlobe /> },
    { id: 'defi', name: t('encyclopedia.categories.defi'), icon: <FaStar /> },
    { id: 'nft', name: t('encyclopedia.categories.nft'), icon: <FaCode /> },
    { id: 'tools', name: t('encyclopedia.categories.tools'), icon: <FaTools /> },
    { id: 'faq', name: t('encyclopedia.categories.faq'), icon: <FaQuestion /> },
  ];

  // 百科全书条目
  const encyclopediaEntries = [
    {
      id: 'alveychain-intro',
      title: t('encyclopedia.entries.alveyChainIntro.title'),
      description: t('encyclopedia.entries.alveyChainIntro.description'),
      content: t('encyclopedia.entries.alveyChainIntro.content'),
      category: 'basics',
      imageUrl: '/images/encyclopedia/alveychain-basics.png',
      featured: true
    },
    {
      id: 'wallets',
      title: t('encyclopedia.entries.wallets.title'),
      description: t('encyclopedia.entries.wallets.description'),
      content: t('encyclopedia.entries.wallets.content'),
      category: 'basics',
      imageUrl: '/images/encyclopedia/wallets.png'
    },
    {
      id: 'nft-marketplace',
      title: t('encyclopedia.entries.nftMarketplace.title'),
      description: t('encyclopedia.entries.nftMarketplace.description'),
      content: t('encyclopedia.entries.nftMarketplace.content'),
      category: 'nft',
      imageUrl: '/images/encyclopedia/nft-marketplace.png',
      featured: true
    },
    {
      id: 'metaversex',
      title: t('encyclopedia.entries.metaverseX.title'),
      description: t('encyclopedia.entries.metaverseX.description'),
      content: t('encyclopedia.entries.metaverseX.content'),
      category: 'dapps',
      imageUrl: '/images/encyclopedia/metaversex.png',
      featured: true
    },
    {
      id: 'alvey-swap',
      title: t('encyclopedia.entries.alveySwap.title'),
      description: t('encyclopedia.entries.alveySwap.description'),
      content: t('encyclopedia.entries.alveySwap.content'),
      category: 'defi',
      imageUrl: '/images/encyclopedia/alvey-swap.png',
      featured: true
    },
    {
      id: 'alvey-bridge',
      title: t('encyclopedia.entries.alveyBridge.title'),
      description: t('encyclopedia.entries.alveyBridge.description'),
      content: t('encyclopedia.entries.alveyBridge.content'),
      category: 'tools',
      imageUrl: '/images/encyclopedia/alvey-bridge.png'
    },
    {
      id: 'staking',
      title: t('encyclopedia.entries.staking.title'),
      description: t('encyclopedia.entries.staking.description'),
      content: t('encyclopedia.entries.staking.content'),
      category: 'defi',
      imageUrl: '/images/encyclopedia/staking.png'
    },
    {
      id: 'block-explorer',
      title: t('encyclopedia.entries.blockExplorer.title'),
      description: t('encyclopedia.entries.blockExplorer.description'),
      content: t('encyclopedia.entries.blockExplorer.content'),
      category: 'tools',
      imageUrl: '/images/encyclopedia/block-explorer.png'
    },
    {
      id: 'how-to-mint-nft',
      title: t('encyclopedia.entries.mintNFT.title'),
      description: t('encyclopedia.entries.mintNFT.description'),
      content: t('encyclopedia.entries.mintNFT.content'),
      category: 'nft',
      imageUrl: '/images/encyclopedia/mint-nft.png'
    },
    {
      id: 'dynamic-nfts',
      title: t('encyclopedia.entries.dynamicNFTs.title'),
      description: t('encyclopedia.entries.dynamicNFTs.description'),
      content: t('encyclopedia.entries.dynamicNFTs.content'),
      category: 'nft',
      imageUrl: '/images/encyclopedia/dynamic-nft.png'
    },
    {
      id: 'yield-farming',
      title: t('encyclopedia.entries.yieldFarming.title'),
      description: t('encyclopedia.entries.yieldFarming.description'),
      content: t('encyclopedia.entries.yieldFarming.content'),
      category: 'defi',
      imageUrl: '/images/encyclopedia/yield-farming.png'
    },
    {
      id: 'alvey-dao',
      title: t('encyclopedia.entries.alveyDAO.title'),
      description: t('encyclopedia.entries.alveyDAO.description'),
      content: t('encyclopedia.entries.alveyDAO.content'),
      category: 'dapps',
      imageUrl: '/images/encyclopedia/alvey-dao.png'
    },
    {
      id: 'alvey-games',
      title: t('encyclopedia.entries.alveyGames.title'),
      description: t('encyclopedia.entries.alveyGames.description'),
      content: t('encyclopedia.entries.alveyGames.content'),
      category: 'dapps',
      imageUrl: '/images/encyclopedia/alvey-games.png'
    },
    {
      id: 'network-issues',
      title: t('encyclopedia.entries.networkIssues.title'),
      description: t('encyclopedia.entries.networkIssues.description'),
      content: t('encyclopedia.entries.networkIssues.content'),
      category: 'faq',
      imageUrl: '/images/encyclopedia/network-issues.png'
    },
    {
      id: 'tokenomics',
      title: t('encyclopedia.entries.tokenomics.title'),
      description: t('encyclopedia.entries.tokenomics.description'),
      content: t('encyclopedia.entries.tokenomics.content'),
      category: 'basics',
      imageUrl: '/images/encyclopedia/tokenomics.png'
    }
  ];

  // 过滤条目
  const filteredEntries = encyclopediaEntries.filter(entry => {
    const matchesCategory = activeCategory === 'all' || entry.category === activeCategory;
    const matchesSearch = !searchTerm || 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // 精选条目
  const featuredEntries = encyclopediaEntries.filter(entry => entry.featured);

  // 处理条目点击
  const handleEntryClick = (entryId) => {
    const selectedEntry = encyclopediaEntries.find(entry => entry.id === entryId);
    setActiveTopic(selectedEntry);
    
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 返回到列表
  const handleBackToList = () => {
    setActiveTopic(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t('encyclopedia.title')}</h1>
      <p className="text-gray-400 mb-8">{t('encyclopedia.subtitle')}</p>
      
      {!activeTopic ? (
        <>
          {/* 搜索栏 */}
          <div className="mb-8 relative">
            <div className="flex items-center bg-gray-800 rounded-lg px-4 py-2">
              <FaSearch className="text-gray-400 mr-3" />
              <input
                type="text"
                className="bg-transparent flex-grow text-white focus:outline-none"
                placeholder={t('encyclopedia.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="text-gray-400 hover:text-white"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {/* 分类导航 */}
          <div className="flex overflow-x-auto pb-4 mb-8 no-scrollbar">
            <div className="flex space-x-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                    activeCategory === category.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* 精选条目 - 仅在"全部"类别和没有搜索词时显示 */}
          {activeCategory === 'all' && !searchTerm && featuredEntries.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-4">{t('encyclopedia.featured')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredEntries.map(entry => (
                  <div 
                    key={entry.id}
                    className="bg-gradient-to-br from-gray-700/70 to-gray-800/70 rounded-lg overflow-hidden hover:from-gray-600/70 hover:to-gray-700/70 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer shadow-md border border-gray-600/30"
                    onClick={() => handleEntryClick(entry.id)}
                  >
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={entry.imageUrl} 
                        alt={entry.title}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center mb-3">
                        <h3 className="font-bold text-lg">{entry.title}</h3>
                        <span className="ml-auto text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded">
                          {categories.find(cat => cat.id === entry.category)?.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{entry.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 百科全书条目列表 */}
          {filteredEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntries.map(entry => (
                <div 
                  key={entry.id}
                  className="bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-700/50 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer shadow"
                  onClick={() => handleEntryClick(entry.id)}
                >
                  <div className="h-32 overflow-hidden">
                    <img 
                      src={entry.imageUrl} 
                      alt={entry.title}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <h3 className="font-bold">{entry.title}</h3>
                      <span className="ml-auto text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {categories.find(cat => cat.id === entry.category)?.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">{entry.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-800/30 rounded-lg">
              <FaSearch className="mx-auto text-4xl text-gray-500 mb-4" />
              <p className="text-gray-400 text-lg">{t('encyclopedia.noEntriesFound')}</p>
              <button 
                className="mt-4 px-4 py-2 bg-primary-600 rounded-lg text-white hover:bg-primary-500"
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('all');
                }}
              >
                {t('encyclopedia.resetSearch')}
              </button>
            </div>
          )}
        </>
      ) : (
        // 详细条目页面
        <div className="max-w-4xl mx-auto">
          <button 
            className="flex items-center text-blue-400 hover:text-blue-300 mb-6"
            onClick={handleBackToList}
          >
            ← {t('encyclopedia.backToList')}
          </button>
          
          <div className="bg-gray-800/50 rounded-lg overflow-hidden">
            <div className="h-64 overflow-hidden">
              <img 
                src={activeTopic.imageUrl} 
                alt={activeTopic.title}
                className="w-full h-full object-cover" 
              />
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-bold">{activeTopic.title}</h2>
                <span className="ml-auto text-sm bg-blue-500/30 text-blue-300 px-3 py-1 rounded-full">
                  {categories.find(cat => cat.id === activeTopic.category)?.name}
                </span>
              </div>
              
              <p className="text-gray-300 mb-6 text-lg">{activeTopic.description}</p>
              
              <div className="prose prose-invert max-w-none">
                {activeTopic.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
              
              {/* 相关应用链接 */}
              {activeTopic.relatedApps && (
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <h3 className="text-xl font-bold mb-4">{t('encyclopedia.relatedApps')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeTopic.relatedApps.map(app => (
                      <a 
                        key={app.name}
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="flex items-center p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
                      >
                        <img src={app.logo} alt={app.name} className="w-10 h-10 mr-3 rounded-full" />
                        <div>
                          <h4 className="font-medium">{app.name}</h4>
                          <p className="text-xs text-gray-400">{app.description}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 教程视频 */}
              {activeTopic.tutorialVideo && (
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <h3 className="text-xl font-bold mb-4">{t('encyclopedia.tutorial')}</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      src={activeTopic.tutorialVideo} 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="rounded-lg"
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Encyclopedia; 