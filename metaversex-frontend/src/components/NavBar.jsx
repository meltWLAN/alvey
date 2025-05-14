import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaCoins, FaLock, FaCubes, FaUserCircle, FaPlusCircle, FaBars, FaTimes } from 'react-icons/fa';
import { useWeb3 } from '../contexts/Web3Context';

const NavBar = () => {
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // 导航项
  const navItems = [
    { name: '首页', path: '/' },
    { name: '市场', path: '/marketplace' },
    { name: '借贷', path: '/lending', icon: <FaLock className="mr-1" /> },
    { name: '质押', path: '/staking', icon: <FaCoins className="mr-1" /> },
    { name: '创建', path: '/create', icon: <FaPlusCircle className="mr-1" /> }
  ];
  
  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <FaCubes className="h-8 w-8 text-indigo-500" />
              <span className="ml-2 text-xl font-bold">MetaverseX</span>
            </Link>
          </div>
          
          {/* 桌面导航 */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    isActive 
                      ? 'bg-gray-900 text-indigo-400' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </div>
          
          {/* 钱包连接 */}
          <div className="hidden md:flex md:items-center md:ml-6">
            {isConnected ? (
              <div className="flex items-center gap-4">
                <NavLink
                  to="/profile"
                  className={({ isActive }) => 
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive 
                        ? 'bg-gray-900 text-indigo-400' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <FaUserCircle className="mr-2" />
                  {account.substring(0, 6)}...{account.substring(account.length - 4)}
                </NavLink>
                
                <button
                  onClick={disconnectWallet}
                  className="ml-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  断开连接
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="ml-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              >
                连接钱包
              </button>
            )}
          </div>
          
          {/* 移动端菜单按钮 */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {mobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                    isActive 
                      ? 'bg-gray-900 text-indigo-400' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            {isConnected ? (
              <div className="px-2 space-y-2">
                <NavLink
                  to="/profile"
                  className={({ isActive }) => 
                    `block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                      isActive 
                        ? 'bg-gray-900 text-indigo-400' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaUserCircle className="mr-2" />
                  我的账户
                </NavLink>
                
                <button
                  onClick={() => {
                    disconnectWallet();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700 hover:text-red-300"
                >
                  断开连接
                </button>
              </div>
            ) : (
              <div className="px-2">
                <button
                  onClick={() => {
                    connectWallet();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  连接钱包
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar; 