import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaUnlock, FaInfoCircle, FaCoins, FaFire, FaPlusCircle, FaHistory } from 'react-icons/fa';
import { useWeb3 } from '../contexts/Web3Context';
import { useNotification } from '../contexts/NotificationContext';
import NFTStakingCard from '../components/DeFi/NFTStakingCard';
import LoadingState from '../components/LoadingState';

// 模拟数据
const MOCK_NFTS = [
  {
    id: '1',
    name: 'Cosmic Explorer',
    description: '一个令人惊叹的3D宇宙飞船，专为元宇宙设计。',
    image: 'https://via.placeholder.com/500x500/5D3FD3/FFFFFF?text=Cosmic+Explorer',
    price: '0.25',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenId: 42,
    owner: '0x9876543210abcdef1234567890abcdef12345678'
  },
  {
    id: '2',
    name: 'Digital Realm',
    description: '一个拥有自定义建筑和交互元素的虚拟空间。',
    image: 'https://via.placeholder.com/500x500/E74C3C/FFFFFF?text=Digital+Realm',
    price: '0.75',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenId: 43,
    owner: '0x9876543210abcdef1234567890abcdef12345678'
  },
  {
    id: '3',
    name: 'Cyber Guardian',
    description: '一个具有可定制属性的未来派角色模型。',
    image: 'https://via.placeholder.com/500x500/3498DB/FFFFFF?text=Cyber+Guardian',
    price: '0.4',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenId: 44,
    owner: '0x9876543210abcdef1234567890abcdef12345678'
  }
];

// 模拟质押池数据
const MOCK_POOLS = [
  {
    id: '1',
    name: 'MetaverseX普通池',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    apr: 120,
    totalStaked: 25,
    rewardToken: 'MVEX',
    minStakeDuration: 7 * 86400, // 7天
    isActive: true
  },
  {
    id: '2',
    name: 'MetaverseX高级池',
    contractAddress: '0x2345678901abcdef1234567890abcdef12345678',
    apr: 200,
    totalStaked: 15,
    rewardToken: 'MVEX',
    minStakeDuration: 30 * 86400, // 30天
    isActive: true
  }
];

const NFTStakingPage = () => {
  const { account, isConnected } = useWeb3();
  const { showSuccess, showError } = useNotification();
  
  const [activeTab, setActiveTab] = useState('my-nfts'); // 'my-nfts', 'staked', 'pools', 'rewards'
  const [loading, setLoading] = useState(true);
  const [myNFTs, setMyNFTs] = useState([]);
  const [stakedNFTs, setStakedNFTs] = useState([]);
  const [pools, setPools] = useState([]);
  const [totalRewards, setTotalRewards] = useState('0');
  const [rewardHistory, setRewardHistory] = useState([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  
  // 获取用户NFT和质押数据
  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // 在实际应用中，我们会从合约中获取数据
        // 这里使用模拟数据
        
        // 模拟延迟
        setTimeout(() => {
          // 过滤当前用户拥有的NFT
          const userNFTs = MOCK_NFTS.filter(nft => 
            account && nft.owner.toLowerCase() === account.toLowerCase()
          );
          
          // 模拟已质押的NFT
          const mockStakedNFTs = [
            {
              id: '4',
              name: 'Virtual Residence',
              description: '一个精心设计的虚拟住宅，拥有独特的建筑特色。',
              image: 'https://via.placeholder.com/500x500/27AE60/FFFFFF?text=Virtual+Residence',
              contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
              tokenId: 45,
              owner: account,
              poolId: '1',
              stakingInfo: {
                startTime: Math.floor(Date.now() / 1000) - 864000, // 10天前
                lastClaimTime: Math.floor(Date.now() / 1000) - 172800, // 2天前
                pendingRewards: '12.5',
                multiplier: 1.25
              }
            }
          ];
          
          // 设置质押池数据
          setPools(MOCK_POOLS);
          
          // 设置用户NFT和已质押NFT
          setMyNFTs(userNFTs);
          setStakedNFTs(mockStakedNFTs);
          
          // 设置总奖励
          setTotalRewards('15.75');
          
          // 设置奖励历史
          const mockRewardHistory = [
            {
              id: '1',
              timestamp: Math.floor(Date.now() / 1000) - 604800, // 7天前
              amount: '8.3',
              nftName: 'Virtual Residence',
              txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
            },
            {
              id: '2',
              timestamp: Math.floor(Date.now() / 1000) - 1209600, // 14天前
              amount: '5.7',
              nftName: 'Cyber Guardian',
              txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
            }
          ];
          setRewardHistory(mockRewardHistory);
          
          setLoading(false);
        }, 1500);
        
      } catch (error) {
        console.error('获取NFT质押数据错误:', error);
        showError('加载NFT质押数据失败');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [account, isConnected]);
  
  // 处理质押或取消质押成功
  const handleStakingAction = (action, nft) => {
    if (action === 'stake') {
      // 从myNFTs中移除，添加到stakedNFTs
      setMyNFTs(prev => prev.filter(item => item.id !== nft.id));
      
      const newStakedNFT = {
        ...nft,
        poolId: '1', // 假设质押到池1
        stakingInfo: {
          startTime: Math.floor(Date.now() / 1000),
          lastClaimTime: Math.floor(Date.now() / 1000),
          pendingRewards: '0',
          multiplier: 1.5
        }
      };
      
      setStakedNFTs(prev => [newStakedNFT, ...prev]);
    } else if (action === 'unstake') {
      // 从stakedNFTs中移除，添加到myNFTs
      const stakedNFT = stakedNFTs.find(item => item.id === nft.id);
      setStakedNFTs(prev => prev.filter(item => item.id !== nft.id));
      
      if (stakedNFT) {
        const returnedNFT = {
          ...stakedNFT,
          owner: account
        };
        delete returnedNFT.poolId;
        delete returnedNFT.stakingInfo;
        
        setMyNFTs(prev => [returnedNFT, ...prev]);
      }
    }
  };
  
  // 处理领取所有奖励
  const handleClaimAllRewards = async () => {
    if (!isConnected || parseFloat(totalRewards) === 0) {
      showError('没有可领取的奖励');
      return;
    }
    
    try {
      setRewardsLoading(true);
      
      // 模拟领取奖励过程
      setTimeout(() => {
        // 添加到奖励历史
        const newRewardHistory = {
          id: Date.now().toString(),
          timestamp: Math.floor(Date.now() / 1000),
          amount: totalRewards,
          nftName: '批量领取',
          txHash: '0x' + Math.random().toString(16).substring(2, 62)
        };
        
        setRewardHistory(prev => [newRewardHistory, ...prev]);
        
        // 更新质押NFT的待领取奖励
        setStakedNFTs(prev => prev.map(nft => ({
          ...nft,
          stakingInfo: {
            ...nft.stakingInfo,
            pendingRewards: '0',
            lastClaimTime: Math.floor(Date.now() / 1000)
          }
        })));
        
        // 重置总奖励
        setTotalRewards('0');
        
        setRewardsLoading(false);
        showSuccess(`成功领取 ${totalRewards} MVEX 代币！`);
      }, 2000);
      
      // TODO: 实际合约调用
      /*
      const nftStakingContract = contracts.NFTStaking;
      
      // 获取用户质押的所有NFT
      const userStakedNfts = await Promise.all(
        pools.map(async pool => {
          const tokenIds = await nftStakingContract.getUserStakedTokens(account, pool.contractAddress);
          return { poolAddress: pool.contractAddress, tokenIds };
        })
      );
      
      // 批量领取奖励
      for (const pool of userStakedNfts) {
        if (pool.tokenIds.length > 0) {
          const claimTx = await nftStakingContract.batchClaimRewards(pool.poolAddress, pool.tokenIds);
          await claimTx.wait();
        }
      }
      
      // 更新UI状态
      // ...
      */
      
    } catch (error) {
      console.error('领取所有奖励错误:', error);
      showError('领取奖励失败: ' + error.message);
      setRewardsLoading(false);
    }
  };
  
  // 格式化时间戳为日期
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };
  
  // 截断地址
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <FaLock className="text-5xl text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">连接钱包</h2>
        <p className="text-gray-400 mb-6">请连接您的钱包以访问NFT质押功能。</p>
      </div>
    );
  }
  
  if (loading) {
    return <LoadingState message="加载NFT质押数据..." />;
  }
  
  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">NFT质押</h1>
        <p className="text-gray-400">质押您的NFT以赚取MVEX代币，价值更高的NFT将获得更多奖励。</p>
      </div>
      
      {/* 质押概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <FaLock className="mr-2 text-indigo-400" />
            已质押NFT
          </h3>
          <p className="text-3xl font-bold">{stakedNFTs.length}</p>
          <p className="text-gray-400 text-sm">在 {pools.length} 个活跃池中</p>
        </div>
        
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <FaCoins className="mr-2 text-yellow-400" />
            待领取奖励
          </h3>
          <p className="text-3xl font-bold text-yellow-400">{totalRewards} MVEX</p>
          <button
            onClick={handleClaimAllRewards}
            disabled={rewardsLoading || parseFloat(totalRewards) === 0}
            className="mt-2 py-1 px-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center w-full justify-center"
          >
            {rewardsLoading ? '处理中...' : '领取所有奖励'}
          </button>
        </div>
        
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <FaFire className="mr-2 text-orange-400" />
            平均APR
          </h3>
          <p className="text-3xl font-bold text-green-400">
            {pools.length > 0 ? `${Math.round(pools.reduce((sum, pool) => sum + pool.apr, 0) / pools.length)}%` : '0%'}
          </p>
          <p className="text-gray-400 text-sm">质押更多NFT可提高总收益</p>
        </div>
      </div>
      
      {/* 标签页 */}
      <div className="flex flex-wrap border-b border-gray-700 mb-8">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'my-nfts' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('my-nfts')}
        >
          我的NFT
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'staked' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('staked')}
        >
          已质押NFT
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'pools' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('pools')}
        >
          质押池
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'rewards' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('rewards')}
        >
          奖励历史
        </button>
      </div>
      
      {/* 我的NFT标签 */}
      {activeTab === 'my-nfts' && (
        <div>
          <h2 className="text-xl font-bold mb-4">我的NFT</h2>
          
          {myNFTs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myNFTs.map(nft => (
                <div key={nft.id} className="bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden">
                  <div className="aspect-square relative">
                    <img 
                      src={nft.image} 
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-1">{nft.name}</h3>
                    <div className="flex justify-between mb-4">
                      <span className="text-gray-400 text-sm">Token ID: {nft.tokenId}</span>
                      <span className="text-gray-400 text-sm">{nft.price} AVT</span>
                    </div>
                    
                    <NFTStakingCard nft={nft} onSuccess={handleStakingAction} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-800 bg-opacity-30 rounded-xl">
              <FaInfoCircle className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">没有找到NFT</h3>
              <p className="text-gray-400 mb-4">您的钱包中没有可以质押的NFT。</p>
              <Link 
                to="/marketplace" 
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-block"
              >
                浏览市场
              </Link>
            </div>
          )}
        </div>
      )}
      
      {/* 已质押NFT标签 */}
      {activeTab === 'staked' && (
        <div>
          <h2 className="text-xl font-bold mb-4">已质押NFT</h2>
          
          {stakedNFTs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stakedNFTs.map(nft => (
                <div key={nft.id} className="bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden border border-indigo-700/30">
                  <div className="aspect-square relative">
                    <img 
                      src={nft.image} 
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-indigo-500 bg-opacity-70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        已质押
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-1">{nft.name}</h3>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400 text-sm">Token ID: {nft.tokenId}</span>
                      <span className="text-gray-400 text-sm">池: {pools.find(p => p.id === nft.poolId)?.name || '未知'}</span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg p-3 mb-4 border border-indigo-700/20">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">已质押时间</span>
                        <span>
                          {Math.floor((Date.now() / 1000 - nft.stakingInfo.startTime) / 86400)}天
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">奖励倍数</span>
                        <span className="text-yellow-400">{nft.stakingInfo.multiplier}x</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">待领取奖励</span>
                        <span className="text-green-400 font-medium">{nft.stakingInfo.pendingRewards} MVEX</span>
                      </div>
                    </div>
                    
                    <NFTStakingCard nft={nft} onSuccess={handleStakingAction} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-800 bg-opacity-30 rounded-xl">
              <FaUnlock className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">没有已质押的NFT</h3>
              <p className="text-gray-400 mb-4">您目前没有任何已质押的NFT。</p>
              <button 
                onClick={() => setActiveTab('my-nfts')}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-block"
              >
                质押NFT
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* 质押池标签 */}
      {activeTab === 'pools' && (
        <div>
          <h2 className="text-xl font-bold mb-4">质押池</h2>
          
          {pools.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800 bg-opacity-50">
                    <th className="px-4 py-3 text-left">池名称</th>
                    <th className="px-4 py-3 text-left">APR</th>
                    <th className="px-4 py-3 text-left">已质押NFT</th>
                    <th className="px-4 py-3 text-left">奖励代币</th>
                    <th className="px-4 py-3 text-left">最低质押期</th>
                    <th className="px-4 py-3 text-left">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {pools.map(pool => (
                    <tr key={pool.id} className="hover:bg-gray-800 hover:bg-opacity-30">
                      <td className="px-4 py-3 font-medium">{pool.name}</td>
                      <td className="px-4 py-3 text-green-400">{pool.apr}%</td>
                      <td className="px-4 py-3">{pool.totalStaked}</td>
                      <td className="px-4 py-3">{pool.rewardToken}</td>
                      <td className="px-4 py-3">{pool.minStakeDuration / 86400}天</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          pool.isActive 
                            ? 'bg-green-500 bg-opacity-20 text-green-400' 
                            : 'bg-gray-500 bg-opacity-20 text-gray-400'
                        }`}>
                          {pool.isActive ? '活跃' : '已关闭'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-800 bg-opacity-30 rounded-xl">
              <FaInfoCircle className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">没有可用质押池</h3>
              <p className="text-gray-400">当前没有活跃的质押池。</p>
            </div>
          )}
        </div>
      )}
      
      {/* 奖励历史标签 */}
      {activeTab === 'rewards' && (
        <div>
          <h2 className="text-xl font-bold mb-4">奖励历史</h2>
          
          {rewardHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800 bg-opacity-50">
                    <th className="px-4 py-3 text-left">时间</th>
                    <th className="px-4 py-3 text-left">金额</th>
                    <th className="px-4 py-3 text-left">NFT</th>
                    <th className="px-4 py-3 text-left">交易哈希</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {rewardHistory.map(reward => (
                    <tr key={reward.id} className="hover:bg-gray-800 hover:bg-opacity-30">
                      <td className="px-4 py-3">{formatTimestamp(reward.timestamp)}</td>
                      <td className="px-4 py-3 text-yellow-400">{reward.amount} MVEX</td>
                      <td className="px-4 py-3">{reward.nftName}</td>
                      <td className="px-4 py-3">
                        <a 
                          href={`https://explorer.alveychain.com/tx/${reward.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          {truncateAddress(reward.txHash)}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-800 bg-opacity-30 rounded-xl">
              <FaHistory className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">没有奖励历史</h3>
              <p className="text-gray-400">您的奖励领取记录将显示在这里。</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NFTStakingPage; 