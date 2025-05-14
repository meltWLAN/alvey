import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Web3Context } from '../contexts/Web3Context';
import { FaStar, FaBook, FaThLarge } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Box, Button, Flex, Menu, MenuButton, MenuItem, MenuList, Spacer, useColorMode } from '@chakra-ui/react';
import { useWeb3Modal } from '@web3modal/react';
import { useAccount } from 'wagmi';

const Navbar = () => {
  const location = useLocation();
  const { connected, account, connectWallet, disconnectWallet, balance } = useContext(Web3Context);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  
  // 导航菜单项
  const menuItems = [
    { name: t('navbar.home'), path: '/' },
    { name: t('navbar.marketplace'), path: '/marketplace' },
    { name: t('navbar.spaces'), path: '/spaces' },
    { name: t('navbar.create'), path: '/create' },
    { name: t('appHub.title'), path: '/apps', icon: <FaThLarge />, isNew: true },
    { name: t('navbar.explore'), path: '/explore', isNew: false },
    { name: t('encyclopedia.title'), path: '/encyclopedia', icon: <FaBook />, isNew: true }
  ];
  
  // 检查当前页面是否处于激活状态
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // 切换移动端菜单
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
  ];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img className="h-8 w-auto mr-2" src="/logo.png" alt="MetaverseX" />
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                MetaverseX
              </span>
            </Link>
          </div>
          
          {/* 桌面导航 */}
          <div className="hidden md:flex md:items-center">
            <div className="flex space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium relative flex items-center ${
                    isActive(item.path)
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.name}
                  {item.isNew && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <FaStar className="text-yellow-400" />
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
          
          {/* 钱包连接 */}
          <div className="hidden md:flex md:items-center">
            {connected ? (
              <div className="flex items-center">
                <div className="mr-4 text-right">
                  <div className="text-gray-300 text-xs">
                    {balance.native?.substring(0, 6)} ALV
                  </div>
                  <div className="text-gray-400 text-xs">
                    {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  {t('navbar.disconnect')}
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded"
              >
                {t('navbar.connect')}
              </button>
            )}
          </div>
          
          {/* 移动端菜单按钮 */}
          <div className="flex md:hidden items-center">
            <button
              className="text-gray-400 hover:text-white p-2"
              onClick={toggleMobileMenu}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={toggleMobileMenu}
              >
                <div className="flex items-center">
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.name}
                  {item.isNew && (
                    <FaStar className="text-yellow-400 ml-2" />
                  )}
                </div>
              </Link>
            ))}
            
            <div className="pt-4 pb-2 border-t border-gray-700">
              {connected ? (
                <div className="px-3">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="text-gray-300 text-sm">
                        {balance.native?.substring(0, 6)} ALV
                      </div>
                      <div className="text-gray-400 text-xs">
                        {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
                      </div>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                    >
                      {t('navbar.disconnect')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-3">
                  <button
                    onClick={connectWallet}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded text-center"
                  >
                    {t('navbar.connect')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 