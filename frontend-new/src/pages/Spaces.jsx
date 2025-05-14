import React, { useState } from 'react';
import SpaceCard from '../components/SpaceCard';
import VRControls from '../components/VRControls';

// 示例空间数据
const mockSpaces = [
  {
    id: 1,
    name: "艺术画廊",
    description: "一个高端虚拟艺术画廊，适合展示各类艺术NFT。",
    thumbnailURI: "https://via.placeholder.com/600x400/2c3e50/ffffff?text=艺术画廊",
    spaceURI: "https://example.com/spaces/art-gallery.json",
    spaceType: 0, // Gallery
    spaceSize: 1, // Medium
    owner: "0x0000000000000000000000000000000000000000",
    tenant: null,
    price: 500,
    rentalPrice: 25,
    isRentable: true,
    isActive: true
  },
  {
    id: 2,
    name: "游戏世界",
    description: "一个互动游戏空间，可以容纳多人互动游戏体验。",
    thumbnailURI: "https://via.placeholder.com/600x400/27ae60/ffffff?text=游戏世界",
    spaceURI: "https://example.com/spaces/game-world.json",
    spaceType: 2, // Game
    spaceSize: 2, // Large
    owner: "0x1234567890123456789012345678901234567890",
    tenant: null,
    price: 0,
    rentalPrice: 50,
    isRentable: true,
    isActive: true
  },
  {
    id: 3,
    name: "科技展厅",
    description: "一个展示未来科技产品的虚拟展厅，具有高科技感的环境。",
    thumbnailURI: "https://via.placeholder.com/600x400/3498db/ffffff?text=科技展厅",
    spaceURI: "https://example.com/spaces/tech-showroom.json",
    spaceType: 1, // Showroom
    spaceSize: 1, // Medium
    owner: "0x0000000000000000000000000000000000000000",
    tenant: null,
    price: 300,
    rentalPrice: 15,
    isRentable: true,
    isActive: true
  },
  {
    id: 4,
    name: "社交俱乐部",
    description: "一个虚拟社交空间，适合聚会和社交活动。",
    thumbnailURI: "https://via.placeholder.com/600x400/8e44ad/ffffff?text=社交俱乐部",
    spaceURI: "https://example.com/spaces/social-club.json",
    spaceType: 3, // Social
    spaceSize: 0, // Small
    owner: "0x2345678901234567890123456789012345678901",
    tenant: "0x3456789012345678901234567890123456789012",
    price: 0,
    rentalPrice: 10,
    isRentable: true,
    isActive: true
  }
];

// 过滤选项
const filterOptions = {
  sort: [
    { value: 'price-asc', label: '价格: 低到高' },
    { value: 'price-desc', label: '价格: 高到低' },
    { value: 'newest', label: '最新上架' }
  ],
  spaceType: [
    { value: 'all', label: '所有类型' },
    { value: '0', label: '画廊' },
    { value: '1', label: '展厅' },
    { value: '2', label: '游戏' },
    { value: '3', label: '社交' }
  ],
  availability: [
    { value: 'all', label: '所有空间' },
    { value: 'for-sale', label: '可购买' },
    { value: 'for-rent', label: '可租赁' }
  ]
};

const Spaces = () => {
  const [activeFilter, setActiveFilter] = useState({
    sort: 'newest',
    spaceType: 'all',
    availability: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // 处理空间点击
  const handleSpaceClick = (space) => {
    console.log('Clicked space:', space);
    // TODO: 实现空间详情查看逻辑
  };

  // 过滤和排序空间
  const getFilteredSpaces = () => {
    let filtered = [...mockSpaces];
    
    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(space => 
        space.name.toLowerCase().includes(term) || 
        space.description.toLowerCase().includes(term)
      );
    }
    
    // 空间类型过滤
    if (activeFilter.spaceType !== 'all') {
      filtered = filtered.filter(space => 
        space.spaceType === parseInt(activeFilter.spaceType)
      );
    }
    
    // 可用性过滤
    if (activeFilter.availability === 'for-sale') {
      filtered = filtered.filter(
        space => space.owner === '0x0000000000000000000000000000000000000000'
      );
    } else if (activeFilter.availability === 'for-rent') {
      filtered = filtered.filter(
        space => space.isRentable && (!space.tenant || space.tenant === '0x0000000000000000000000000000000000000000')
      );
    }
    
    // 排序
    switch (activeFilter.sort) {
      case 'price-asc':
        filtered.sort((a, b) => {
          const aPrice = a.owner === '0x0000000000000000000000000000000000000000' ? a.price : a.rentalPrice;
          const bPrice = b.owner === '0x0000000000000000000000000000000000000000' ? b.price : b.rentalPrice;
          return aPrice - bPrice;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const aPrice = a.owner === '0x0000000000000000000000000000000000000000' ? a.price : a.rentalPrice;
          const bPrice = b.owner === '0x0000000000000000000000000000000000000000' ? b.price : b.rentalPrice;
          return bPrice - aPrice;
        });
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }
    
    return filtered;
  };
  
  const filteredSpaces = getFilteredSpaces();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">虚拟空间</h1>
        <VRControls />
      </div>
      
      {/* 过滤器和搜索 */}
      <div className="bg-gray-800/50 p-4 rounded-lg mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="搜索虚拟空间..."
              className="input-bordered w-full p-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
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
              value={activeFilter.spaceType}
              onChange={(e) => setActiveFilter({...activeFilter, spaceType: e.target.value})}
            >
              {filterOptions.spaceType.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            
            <select
              className="input-bordered px-2 py-2"
              value={activeFilter.availability}
              onChange={(e) => setActiveFilter({...activeFilter, availability: e.target.value})}
            >
              {filterOptions.availability.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* 空间卡片列表 */}
      {filteredSpaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpaces.map(space => (
            <SpaceCard 
              key={space.id} 
              space={space} 
              onClick={() => handleSpaceClick(space)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-400">没有找到符合条件的虚拟空间</p>
          <button 
            className="mt-4 text-primary-400 hover:text-primary-300"
            onClick={() => {
              setSearchTerm('');
              setActiveFilter({
                sort: 'newest',
                spaceType: 'all',
                availability: 'all'
              });
            }}
          >
            重置过滤器
          </button>
        </div>
      )}
    </div>
  );
};

export default Spaces; 