import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaExchangeAlt, FaChartBar, FaGamepad, FaPalette, FaCoins, FaGlobe, FaShoppingCart, 
  FaBook, FaHandshake, FaLink, FaStar, FaExternalLinkAlt, FaUsers, FaTools } from 'react-icons/fa';
import { ethers } from 'ethers';

// 导入组件
import AppGrid from '../components/AppGrid';
import AppFilter from '../components/AppFilter';

// 导入应用数据和连接器
import { applications, categories, getFeaturedApps, searchApps } from '../data/applications';
import { createConnectors } from '../utils/appConnectors';

/**
 * AlveyChain应用中心 - 增强版
 * 集成了AlveyChain生态系统和第三方热门应用
 */
const AppHub = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appConnectors, setAppConnectors] = useState({});

  // 初始化应用连接器
  useEffect(() => {
    const connectors = createConnectors(applications);
    setAppConnectors(connectors);
  }, []);

  // 检查钱包连接状态
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setConnected(true);
            setAccount(accounts[0]);
            loadRecentApps(accounts[0]);
          }
        } catch (error) {
          console.error("Failed to check connection:", error);
        }
      }
    };

    checkConnection();
  }, []);

  // 加载用户最近使用的应用
  const loadRecentApps = (address) => {
    setLoading(true);
    try {
      const recentAppIds = JSON.parse(localStorage.getItem('recentApps') || '[]');
      const recent = recentAppIds
        .map(id => applications.find(app => app.id === id))
        .filter(app => app);
      
      if (recent.length > 0) {
        setRecentApps(recent);
      } else {
        // 默认推荐
        const defaultApps = [
          applications.find(app => app.id === 'alveyswap'),
          applications.find(app => app.id === 'alveylend'),
          applications.find(app => app.id === 'alveynft')
        ].filter(Boolean);
        setRecentApps(defaultApps);
      }
    } catch (e) {
      console.error('Failed to load recent apps:', e);
    } finally {
      setLoading(false);
    }
  };

  // 连接钱包
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const accounts = await provider.listAccounts();
        setConnected(true);
        setAccount(accounts[0]);
        loadRecentApps(accounts[0]);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      } finally {
        setLoading(false);
      }
    } else {
      alert(t('appHub.walletNotDetected'));
    }
  };

  // 启动应用
  const launchApp = async (app) => {
    if (appConnectors[app.id]) {
      try {
        await appConnectors[app.id].connect();
        await appConnectors[app.id].launch();
        
        // 更新最近使用的应用
        const recentAppIds = JSON.parse(localStorage.getItem('recentApps') || '[]');
        const newRecentApps = [app.id, ...recentAppIds.filter(id => id !== app.id)].slice(0, 5);
        localStorage.setItem('recentApps', JSON.stringify(newRecentApps));
        
        if (!recentApps.find(a => a.id === app.id)) {
          setRecentApps(prev => [app, ...prev].slice(0, 3));
        }
      } catch (error) {
        console.error(`Failed to launch ${app.name}:`, error);
      }
    } else {
      window.open(app.url, '_blank');
    }
  };

  // 获取应用图标
  const getAppIcon = (iconName) => {
    switch (iconName) {
      case 'exchange': return <FaExchangeAlt />;
      case 'chart': return <FaChartBar />;
      case 'gamepad': return <FaGamepad />;
      case 'palette': return <FaPalette />;
      case 'coins': return <FaCoins />;
      case 'globe': return <FaGlobe />;
      case 'shopping': return <FaShoppingCart />;
      case 'book': return <FaBook />;
      case 'handshake': return <FaHandshake />;
      case 'link': return <FaLink />;
      case 'users': return <FaUsers />;
      case 'tools': return <FaTools />;
      default: return <FaGlobe />;
    }
  };

  // 过滤应用
  const filteredApps = searchTerm 
    ? searchApps(searchTerm, activeCategory)
    : activeCategory === 'all' 
      ? applications 
      : applications.filter(app => app.category === activeCategory);

  // 精选应用
  const featuredApps = getFeaturedApps();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t('appHub.title')}</h1>
      <p className="text-gray-400 mb-6">{t('appHub.subtitle')}</p>
      
      {/* 连接钱包提示 */}
      {!connected && (
        <div className="mb-8 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl p-6 border border-blue-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-semibold mb-2">{t('appHub.connectWalletHeading')}</h3>
              <p className="text-gray-300">{t('appHub.connectWalletDescription')}</p>
            </div>
            <button
              onClick={connectWallet}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all flex items-center"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {t('appHub.connectWallet')}
            </button>
          </div>
        </div>
      )}
      
      {/* 最近使用的应用 */}
      {connected && recentApps.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{t('appHub.recentlyUsed')}</h2>
          <AppGrid apps={recentApps} onLaunch={launchApp} />
        </div>
      )}
      
      {/* 搜索和过滤 */}
      <AppFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        categories={categories}
      />
      
      {/* 应用列表 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          {activeCategory === 'all' 
            ? t('appHub.allApps')
            : categories.find(c => c.id === activeCategory)?.name}
        </h2>
        <AppGrid apps={filteredApps} onLaunch={launchApp} />
      </div>
    </div>
  );
};

export default AppHub; 