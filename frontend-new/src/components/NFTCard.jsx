import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatAddress } from '../utils/web3';
import EnhancedModelViewer from './EnhancedModelViewer';

const NFTCard = ({ nft, onClick }) => {
  const navigate = useNavigate();
  const [showQuickView, setShowQuickView] = useState(false);
  
  const handleClick = () => {
    if (onClick) {
      onClick(nft);
    } else {
      // 如果没有提供onClick处理函数，则导航到NFT详情页
      navigate(`/marketplace/${nft.id}`);
    }
  };
  
  const handleQuickView = (e) => {
    e.stopPropagation();
    setShowQuickView(true);
  };
  
  const closeQuickView = (e) => {
    e.stopPropagation();
    setShowQuickView(false);
  };
  
  return (
    <>
      <div 
        className="card-3d hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
        onClick={handleClick}
      >
        <div className="aspect-square overflow-hidden relative">
          <img 
            src={nft.thumbnailURI || '/placeholder-nft.jpg'} 
            alt={nft.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {nft.vrCompatible && (
            <div className="absolute top-2 right-2 bg-virtual-500/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              VR
            </div>
          )}
          
          {/* 悬停时显示的覆盖层 */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
            <button 
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
              onClick={handleQuickView}
            >
              快速查看
            </button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 truncate">{nft.name}</h3>
          <p className="text-gray-400 text-sm mb-2 line-clamp-2">{nft.description}</p>
          
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">创作者</span>
              <span className="text-sm truncate max-w-[120px]">
                {nft.creator ? formatAddress(nft.creator) : 'Unknown'}
              </span>
            </div>
            
            {nft.price && (
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400">价格</span>
                <span className="text-primary-400 font-medium">{nft.price} MVX</span>
              </div>
            )}
          </div>
          
          {nft.tags && nft.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {nft.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="bg-gray-700/50 text-gray-300 text-xs px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {nft.tags.length > 3 && (
                <span className="text-gray-400 text-xs">+{nft.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 快速查看模态框 */}
      {showQuickView && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" 
          onClick={closeQuickView}
        >
          <div 
            className="bg-gray-800 rounded-xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">{nft.name}</h3>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={closeQuickView}
              >
                ✕
              </button>
            </div>
            
            <div className="flex-grow overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="aspect-square">
                  <EnhancedModelViewer 
                    modelUrl={nft.modelURI} 
                    format={nft.format} 
                    vrCompatible={nft.vrCompatible}
                  />
                </div>
                
                <div>
                  <p className="text-gray-300 mb-4">{nft.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-xs text-gray-400 block">创作者</span>
                      <span>{nft.creator ? formatAddress(nft.creator) : 'Unknown'}</span>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-400 block">价格</span>
                      <span className="text-primary-400 font-medium">{nft.price} MVX</span>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-400 block">格式</span>
                      <span>{nft.format?.toUpperCase()}</span>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-400 block">VR兼容</span>
                      <span>{nft.vrCompatible ? '是' : '否'}</span>
                    </div>
                  </div>
                  
                  {nft.tags && nft.tags.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-400 block mb-2">标签</span>
                      <div className="flex flex-wrap gap-1">
                        {nft.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="bg-gray-700/50 text-gray-300 text-xs px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button 
                className="btn-gradient px-6 py-2 rounded-full"
                onClick={handleClick}
              >
                查看详情
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NFTCard; 