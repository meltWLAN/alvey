import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Web3Context } from '../contexts/Web3Context';
import { useNotification } from '../contexts/NotificationContext';
import EnhancedModelViewer from '../components/EnhancedModelViewer';
import VRControls from '../components/VRControls';
import LoadingState from '../components/LoadingState';
import SocialFeatures from '../components/SocialFeatures';
import { loadSampleModels } from '../utils/modelLoader';
import { formatAddress } from '../utils/web3';

const NFTDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { connected, contracts } = useContext(Web3Context);
  const { showSuccess, showError, showInfo } = useNotification();
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyingNft, setBuyingNft] = useState(false);

  useEffect(() => {
    const loadNFTDetail = async () => {
      setLoading(true);
      try {
        // 如果合约可用，从合约加载数据
        if (contracts.nft) {
          console.log('Loading NFT from contract...');
          // 此处添加实际合约调用
          // 由于现在没有实际连接到链，我们使用示例数据
        }
        
        // 加载示例数据
        const allNfts = loadSampleModels();
        const foundNft = allNfts.find(nft => nft.id.toString() === id);
        
        if (foundNft) {
          setNft(foundNft);
        } else {
          setError('NFT not found');
        }
      } catch (err) {
        console.error('Error loading NFT:', err);
        setError(err.message || 'Error loading NFT');
        showError(`加载NFT数据失败: ${err.message || '未知错误'}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadNFTDetail();
  }, [id, contracts.nft, showError]);

  // 购买NFT
  const handleBuyNFT = async () => {
    if (!connected) {
      showInfo('请先连接钱包后再进行购买');
      return;
    }
    
    try {
      setBuyingNft(true);
      console.log('Buying NFT:', nft);
      // 实际应用中，这里应该调用合约的购买方法
      
      // 模拟购买成功
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSuccess(`成功购买 ${nft.name}！`);
      navigate('/profile');
    } catch (err) {
      console.error('Error buying NFT:', err);
      showError(`购买失败: ${err.message || '未知错误'}`);
    } finally {
      setBuyingNft(false);
    }
  };

  if (loading) {
    return <LoadingState message="加载NFT数据中..." />;
  }

  if (error || !nft) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">无法加载NFT</h1>
        <p className="text-gray-400 mb-6">{error || 'NFT不存在或已被移除'}</p>
        <button 
          onClick={() => navigate('/marketplace')}
          className="btn-gradient px-6 py-2 rounded-full"
        >
          返回市场
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white flex items-center"
        >
          ← 返回
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
            <EnhancedModelViewer 
              modelUrl={nft.modelURI}
              format={nft.format}
              vrCompatible={nft.vrCompatible}
              className="rounded-lg overflow-hidden"
              style={{ height: '400px' }}
            />
          </div>
          
          {nft.vrCompatible && (
            <div className="mt-4">
              <VRControls />
            </div>
          )}
          
          {/* 社交功能组件 */}
          <SocialFeatures nftId={nft.id} initialLikes={Math.floor(Math.random() * 50) + 5} />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">{nft.name}</h1>
          
          <div className="flex items-center mb-6">
            <div className="text-sm text-gray-400 mr-4">创作者: {formatAddress(nft.creator)}</div>
            {nft.vrCompatible && (
              <div className="bg-virtual-500/20 text-virtual-400 px-2 py-1 rounded-full text-sm">
                VR兼容
              </div>
            )}
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-2">描述</h2>
            <p className="text-gray-300">{nft.description}</p>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-2">详情</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">ID</p>
                <p>{nft.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">格式</p>
                <p>{nft.format.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">创建日期</p>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">区块链</p>
                <p>AlveyChain</p>
              </div>
            </div>
          </div>
          
          {nft.tags && nft.tags.length > 0 && (
            <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-2">标签</h2>
              <div className="flex flex-wrap gap-2">
                {nft.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">价格</p>
                <p className="text-2xl text-primary-400 font-bold">{nft.price} MVX</p>
              </div>
              
              <button
                onClick={handleBuyNFT}
                className="btn-gradient px-6 py-2 rounded-full shine-effect"
                disabled={buyingNft || !connected}
              >
                {buyingNft ? (
                  <span className="flex items-center">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    处理中...
                  </span>
                ) : !connected ? '请先连接钱包' : '购买NFT'}
              </button>
            </div>
          </div>
          
          {/* 生态系统集成 */}
          <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-4">生态系统集成</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center">
                <img src="https://decentraland.org/favicon.ico" alt="Decentraland" className="w-5 h-5 mr-2" />
                导出到Decentraland
              </button>
              <button className="bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-700 hover:to-amber-600 text-white px-4 py-3 rounded-lg flex items-center justify-center">
                <img src="https://www.sandbox.game/img/favicon.ico" alt="The Sandbox" className="w-5 h-5 mr-2" />
                导出到Sandbox
              </button>
              <button className="bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-700 hover:to-teal-600 text-white px-4 py-3 rounded-lg flex items-center justify-center">
                <img src="https://static.opensea.io/favicon.ico" alt="OpenSea" className="w-5 h-5 mr-2" />
                在OpenSea上查看
              </button>
              <button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-4 py-3 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <path d="M13 7h-2v5.41l3.29 3.29 1.41-1.41-2.7-2.7V7z"/>
                </svg>
                使用AR查看
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetail; 