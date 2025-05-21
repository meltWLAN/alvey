import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Web3Context } from '../contexts/Web3Context';
import EnhancedModelViewer from '../components/EnhancedModelViewer';
import VRControls from '../components/VRControls';
import { loadSampleSpaces } from '../utils/modelLoader';
import { formatAddress } from '../utils/web3';
import { SPACE_TYPES, SPACE_SIZES } from '../utils/constants';

const SpaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { connected, contracts } = useContext(Web3Context);
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyingSpace, setBuyingSpace] = useState(false);
  const [rentingSpace, setRentingSpace] = useState(false);
  const [rentDuration, setRentDuration] = useState(7); // 默认租赁7天

  useEffect(() => {
    const loadSpaceDetail = async () => {
      setLoading(true);
      try {
        // 如果合约可用，从合约加载数据
        if (contracts.space) {
          console.log('Loading space from contract...');
          // 此处添加实际合约调用
          // 由于现在没有实际连接到链，我们使用示例数据
        }
        
        // 加载示例数据
        const allSpaces = loadSampleSpaces();
        const foundSpace = allSpaces.find(space => space.id.toString() === id);
        
        if (foundSpace) {
          setSpace(foundSpace);
        } else {
          setError('Space not found');
        }
      } catch (err) {
        console.error('Error loading space:', err);
        setError(err.message || 'Error loading space');
      } finally {
        setLoading(false);
      }
    };
    
    loadSpaceDetail();
  }, [id, contracts.space]);

  // 购买虚拟空间
  const handleBuySpace = async () => {
    if (!connected) {
      alert('请先连接钱包');
      return;
    }
    
    try {
      setBuyingSpace(true);
      console.log('Buying space:', space);
      // 实际应用中，这里应该调用合约的购买方法
      
      // 模拟购买成功
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('购买成功！');
      navigate('/profile');
    } catch (err) {
      console.error('Error buying space:', err);
      alert(`购买失败: ${err.message || '未知错误'}`);
    } finally {
      setBuyingSpace(false);
    }
  };

  // 租赁虚拟空间
  const handleRentSpace = async () => {
    if (!connected) {
      alert('请先连接钱包');
      return;
    }
    
    try {
      setRentingSpace(true);
      console.log('Renting space:', space, 'for', rentDuration, 'days');
      // 实际应用中，这里应该调用合约的租赁方法
      
      // 模拟租赁成功
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`租赁成功！租期${rentDuration}天`);
      navigate('/profile');
    } catch (err) {
      console.error('Error renting space:', err);
      alert(`租赁失败: ${err.message || '未知错误'}`);
    } finally {
      setRentingSpace(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="loading-ring mx-auto"></div>
        <p className="mt-4 text-gray-400">加载虚拟空间数据中...</p>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">无法加载虚拟空间</h1>
        <p className="text-gray-400 mb-6">{error || '虚拟空间不存在或已被移除'}</p>
        <button 
          onClick={() => navigate('/spaces')}
          className="btn-gradient px-6 py-2 rounded-full"
        >
          返回空间列表
        </button>
      </div>
    );
  }

  // 检查空间是否可购买
  const isPurchasable = space.owner === '0x0000000000000000000000000000000000000000';
  
  // 检查空间是否可租赁
  const isRentable = space.isRentable && (!space.tenant || space.tenant === '0x0000000000000000000000000000000000000000');

  // 计算租赁总价
  const totalRentPrice = space.rentalPrice * rentDuration;

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
              modelUrl={space.spaceURI}
              format="glb"
              vrCompatible={true}
              className="rounded-lg overflow-hidden"
              style={{ height: '400px' }}
            />
          </div>
          
          <div className="mt-4">
            <VRControls />
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">{space.name}</h1>
          
          <div className="flex items-center mb-6">
            <div className="bg-gray-700/70 px-2 py-1 rounded-full text-sm mr-2">
              {SPACE_TYPES[space.spaceType] || 'Space'}
            </div>
            <div className="bg-gray-700/70 px-2 py-1 rounded-full text-sm">
              {SPACE_SIZES[space.spaceSize] || 'Medium'}
            </div>
            {!isPurchasable && (
              <div className="ml-auto text-sm text-gray-400">
                拥有者: {formatAddress(space.owner)}
              </div>
            )}
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-2">描述</h2>
            <p className="text-gray-300">{space.description}</p>
          </div>
          
          {isPurchasable && (
            <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-2">购买信息</h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">价格</p>
                  <p className="text-2xl text-primary-400 font-bold">{space.price} MVX</p>
                </div>
                
                <button
                  onClick={handleBuySpace}
                  className="btn-gradient px-6 py-2 rounded-full"
                  disabled={buyingSpace}
                >
                  {buyingSpace ? (
                    <span className="flex items-center">
                      <span className="loading-ring w-4 h-4 mr-2"></span>
                      处理中...
                    </span>
                  ) : '购买空间'}
                </button>
              </div>
            </div>
          )}
          
          {isRentable && (
            <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-2">租赁信息</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">租赁价格</p>
                <p className="text-xl text-secondary-400">{space.rentalPrice} MVX/天</p>
              </div>
              
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">租赁期限 (天)</label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={rentDuration}
                  onChange={(e) => setRentDuration(parseInt(e.target.value))}
                  className="w-full accent-secondary-500"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">1天</span>
                  <span className="text-xs text-gray-400">30天</span>
                </div>
                <p className="text-center mt-2">{rentDuration} 天 - 总计: <span className="text-secondary-400">{totalRentPrice} MVX</span></p>
              </div>
              
              <button
                onClick={handleRentSpace}
                className="w-full bg-secondary-700 hover:bg-secondary-600 text-white py-2 rounded-lg transition-colors"
                disabled={rentingSpace}
              >
                {rentingSpace ? (
                  <span className="flex items-center justify-center">
                    <span className="loading-ring w-4 h-4 mr-2"></span>
                    处理中...
                  </span>
                ) : '租赁空间'}
              </button>
            </div>
          )}
          
          <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-2">详情</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">ID</p>
                <p>{space.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">类型</p>
                <p>{SPACE_TYPES[space.spaceType] || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">大小</p>
                <p>{SPACE_SIZES[space.spaceSize] || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">可租赁</p>
                <p>{space.isRentable ? '是' : '否'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceDetail; 