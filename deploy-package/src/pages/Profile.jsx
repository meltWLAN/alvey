import React, { useState, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import NFTCard from '../components/NFTCard';
import SpaceCard from '../components/SpaceCard';

// 示例用户NFT数据
const mockUserNFTs = [
  {
    id: 1,
    name: "Dragon Rider",
    description: "史诗级龙骑士3D模型，适合在虚拟世界中使用。",
    thumbnailURI: "https://via.placeholder.com/300/2980b9/ffffff?text=Dragon+Rider",
    modelURI: "https://example.com/models/dragon-rider.glb",
    creator: "0x1234567890123456789012345678901234567890",
    price: 0,
    format: "glb",
    vrCompatible: true,
    tags: ["角色", "龙", "奇幻"]
  },
  {
    id: 2,
    name: "未来科技头盔",
    description: "高度详细的未来科技头盔模型，具有可定制的灯光效果。",
    thumbnailURI: "https://via.placeholder.com/300/27ae60/ffffff?text=科技头盔",
    modelURI: "https://example.com/models/helmet.glb",
    creator: "0x1234567890123456789012345678901234567890",
    price: 0, 
    format: "glb",
    vrCompatible: true,
    tags: ["装备", "科技", "未来"]
  }
];

// 示例用户空间数据
const mockUserSpaces = [
  {
    id: 1, 
    name: "我的VR展览馆",
    description: "个人收藏的展示空间，现代设计风格。",
    thumbnailURI: "https://via.placeholder.com/600x400/2c3e50/ffffff?text=VR展览馆",
    spaceURI: "https://example.com/spaces/my-gallery.json",
    spaceType: 0, // Gallery
    spaceSize: 1, // Medium
    owner: "0x1234567890123456789012345678901234567890",
    tenant: null,
    price: 0,
    rentalPrice: 0,
    isRentable: false,
    isActive: true
  }
];

const Profile = () => {
  const { account, connected, balance } = useContext(Web3Context);
  const [activeTab, setActiveTab] = useState('nfts');
  
  // 格式化地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  };
  
  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">个人资料</h1>
        <p className="text-xl text-gray-400 mb-6">请连接钱包以查看您的个人资料</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">个人资料</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="bg-gray-800/50 p-2 px-4 rounded-full inline-flex items-center">
            <span className="text-gray-400 mr-2">钱包地址:</span>
            <span>{formatAddress(account)}</span>
          </div>
          <div className="flex gap-4">
            <div className="bg-gray-800/50 p-2 px-4 rounded-full">
              <span className="text-gray-400 mr-2">ALVEY:</span>
              <span>{parseFloat(balance.alvey).toFixed(4)}</span>
            </div>
            <div className="bg-gray-800/50 p-2 px-4 rounded-full">
              <span className="text-gray-400 mr-2">MVX:</span>
              <span>{parseFloat(balance.mvx).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 选项卡 */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'nfts' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('nfts')}
        >
          我的NFT
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'spaces' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('spaces')}
        >
          我的虚拟空间
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'activity' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('activity')}
        >
          活动记录
        </button>
      </div>
      
      {/* NFT内容 */}
      {activeTab === 'nfts' && (
        <div>
          {mockUserNFTs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockUserNFTs.map(nft => (
                <NFTCard 
                  key={nft.id} 
                  nft={nft} 
                  onClick={() => console.log('Clicked NFT:', nft)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-400 mb-4">您还没有任何NFT</p>
              <a 
                href="/create" 
                className="btn-gradient px-6 py-2 rounded-full inline-block"
              >
                创建您的第一个NFT
              </a>
            </div>
          )}
        </div>
      )}
      
      {/* 虚拟空间内容 */}
      {activeTab === 'spaces' && (
        <div>
          {mockUserSpaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockUserSpaces.map(space => (
                <SpaceCard 
                  key={space.id} 
                  space={space} 
                  onClick={() => console.log('Clicked space:', space)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-400 mb-4">您还没有任何虚拟空间</p>
              <a 
                href="/spaces" 
                className="btn-gradient px-6 py-2 rounded-full inline-block"
              >
                购买您的第一个虚拟空间
              </a>
            </div>
          )}
        </div>
      )}
      
      {/* 活动记录内容 */}
      {activeTab === 'activity' && (
        <div className="bg-gray-800/30 rounded-lg p-6">
          <div className="text-center">
            <p className="text-xl text-gray-400">暂无活动记录</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 