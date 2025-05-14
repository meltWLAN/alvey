import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaGithub, FaDiscord, FaTelegram, FaCubes } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-8">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center">
              <FaCubes className="h-8 w-8 text-indigo-500" />
              <span className="ml-2 text-xl font-bold">MetaverseX</span>
            </Link>
            <p className="mt-2 text-sm text-gray-400">
              探索、创建和交易虚拟世界中独特的3D资产NFT，通过DeFi功能释放NFT的价值。
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">平台</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/marketplace" className="hover:text-white">
                  市场
                </Link>
              </li>
              <li>
                <Link to="/lending" className="hover:text-white">
                  NFT借贷
                </Link>
              </li>
              <li>
                <Link to="/staking" className="hover:text-white">
                  NFT质押
                </Link>
              </li>
              <li>
                <Link to="/create" className="hover:text-white">
                  创建NFT
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">资源</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  开发文档
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  教程中心
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  白皮书
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">社区</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaDiscord className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaTelegram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaGithub className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} MetaverseX. 保留所有权利。</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">
              隐私政策
            </a>
            <a href="#" className="hover:text-white">
              服务条款
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 