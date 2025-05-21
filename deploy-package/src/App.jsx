import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import { VRProvider } from './contexts/VRContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Spaces from './pages/Spaces';
import Create from './pages/Create';
import Profile from './pages/Profile';
import NFTDetail from './pages/NFTDetail';
import SpaceDetail from './pages/SpaceDetail';
import Encyclopedia from './pages/Encyclopedia';
import AppHub from './pages/AppHub';
import Navbar from './components/Navbar';
import NetworkAlert from './components/NetworkAlert';
import EnvironmentSwitch from './components/EnvironmentSwitch';
import ContractAddressSetter from './components/ContractAddressSetter';
import AIAssistant from './components/AIAssistant';
import EnhancedAIAssistant from './components/EnhancedAIAssistant';
import EnhancedDAppsHub from './components/EnhancedDAppsHub';
import EnhancedGameCenter from './components/EnhancedGameCenter';
import GameElements from './components/GameElements';
import { ChakraProvider, Container, VStack } from '@chakra-ui/react';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { alveychain } from './config/chains';
import { config } from './config/env';
import NFTMint from './components/NFTMint';
import NFTStaking from './components/NFTStaking';
import './App.css';
import './i18n';

const VRInfo = () => {
  const { t } = useTranslation();
  
  return (
    <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-sm mb-1">{t('common.platformCompatibility')}</h3>
      <p className="text-xs">
        {t('common.vrSupportInfo')}
      </p>
      <button 
        className="text-xs mt-2 bg-white text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100"
        onClick={() => document.querySelector('.vr-info').classList.add('hidden')}
      >
        {t('common.gotIt')}
      </button>
    </div>
  );
};

const FeatureExplorer = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('explore.title')}</h1>
      
      <div className="mb-12">
        <EnhancedDAppsHub />
      </div>
      
      <div className="mb-12">
        <EnhancedGameCenter userId="current-user" />
      </div>
      
      <div className="mb-12">
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-2">{t('explore.comingSoon')}</h2>
          <p className="text-gray-300">{t('explore.comingSoonDesc')}</p>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800/50 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p>© {currentYear} MetaverseX - {t('footer.platform')}</p>
        <p className="text-sm mt-1 text-gray-400">{t('footer.supportInfo')}</p>
      </div>
    </footer>
  );
};

// 语言切换器组件
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('preferredLanguage', lng);
  };
  
  return (
    <div className="fixed top-20 right-4 z-40 bg-gray-800/80 rounded-lg p-2 backdrop-blur-sm">
      <button 
        className={`px-2 py-1 rounded text-sm mr-1 ${i18n.language === 'en' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
      <button 
        className={`px-2 py-1 rounded text-sm ${i18n.language === 'zh' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        onClick={() => changeLanguage('zh')}
      >
        中文
      </button>
    </div>
  );
};

// 配置链和提供商
const chains = [alveychain];
const projectId = config.WALLET_CONNECT_PROJECT_ID;

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

function App() {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    // 检测用户浏览器语言
    const userLang = navigator.language || navigator.userLanguage;
    i18n.changeLanguage(userLang.split('-')[0]);
  }, [i18n]);
  
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <ChakraProvider>
          <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
              <Navbar />
              <NFTMint />
              <NFTStaking />
            </VStack>
          </Container>
        </ChakraProvider>
      </WagmiConfig>

      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        themeMode="light"
        themeVariables={{
          '--w3m-font-family': 'Roboto, sans-serif',
          '--w3m-accent-color': '#7928CA'
        }}
      />
    </>
  );
}

export default App
