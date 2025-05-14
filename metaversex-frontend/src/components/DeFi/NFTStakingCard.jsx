import React, { useState, useEffect } from 'react';
import { FaLock, FaUnlock, FaInfoCircle, FaClock, FaCoins, FaFire } from 'react-icons/fa';
import { ethers } from 'ethers';
import { useWeb3 } from '../../contexts/Web3Context';
import { useNotification } from '../../contexts/NotificationContext';

const NFTStakingCard = ({ nft, onSuccess }) => {
  const { account, contracts, isConnected } = useWeb3();
  const { showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [isStakingEnabled, setIsStakingEnabled] = useState(false);
  const [poolInfo, setPoolInfo] = useState(null);
  const [stakedNFT, setStakedNFT] = useState(null);
  const [pendingRewards, setPendingRewards] = useState('0');
  const [multiplier, setMultiplier] = useState(1);
  const [stakingAPR, setStakingAPR] = useState(0);
  
  // 检查NFT是否可质押并获取相关信息
  useEffect(() => {
    const checkStakingEligibility = async () => {
      if (!isConnected || !nft) return;
      
      try {
        // 在实际应用中，我们会检查合约中该NFT是否支持质押
        // 并获取其当前估值、池配置等
        
        // 模拟获取数据
        setTimeout(() => {
          // 假设所有NFT都可以质押
          const mockPoolInfo = {
            isActive: true,
            rewardRate: ethers.utils.parseEther('10'), // 每天10个代币
            minStakeDuration: 7 * 86400, // 7天
            earlyWithdrawalPenalty: 2000, // 20%
            poolName: "MetaverseX NFT池"
          };
          
          // 假设该NFT的质押倍数为1.5
          const mockMultiplier = 1.5;
          
          // 假设年化收益率为150%
          const mockAPR = 150;
          
          setPoolInfo(mockPoolInfo);
          setMultiplier(mockMultiplier);
          setStakingAPR(mockAPR);
          setIsStakingEnabled(true);
          
          // 检查该NFT是否已经质押
          const mockIsStaked = false; // 默认未质押
          
          if (mockIsStaked) {
            const mockStakedNFT = {
              startTime: Date.now() / 1000 - 86400 * 3, // 3天前
              lastClaimTime: Date.now() / 1000 - 86400, // 1天前
              rewards: ethers.utils.parseEther('15'), // 15个代币
            };
            setStakedNFT(mockStakedNFT);
            setPendingRewards(ethers.utils.formatEther(mockStakedNFT.rewards));
          } else {
            setStakedNFT(null);
          }
        }, 1000);
        
        // TODO: 实际合约调用
        /*
        const nftStakingContract = contracts.NFTStaking;
        
        // 检查NFT合约是否支持质押
        const poolConfig = await nftStakingContract.poolConfigs(nft.contractAddress);
        setIsStakingEnabled(poolConfig.isActive);
        setPoolInfo(poolConfig);
        
        // 获取NFT估值和奖励倍数
        const nftValue = await nftStakingContract.nftValuations(nft.contractAddress, nft.tokenId);
        // 计算APR
        const rewardRate = poolConfig.rewardRate;
        const dailyReward = rewardRate * 86400;
        const yearlyReward = dailyReward * 365;
        const mockTokenPrice = 0.01; // 代币价格假设为0.01 AVT
        const yearlyRewardValue = yearlyReward * mockTokenPrice;
        const nftValueInAVT = ethers.utils.formatEther(nftValue);
        const apr = (yearlyRewardValue / nftValueInAVT) * 100;
        setStakingAPR(apr);
        
        // 检查该NFT是否已质押
        const stake = await nftStakingContract.stakes(nft.contractAddress, nft.tokenId);
        
        if (stake.owner !== ethers.constants.AddressZero) {
          setStakedNFT(stake);
          
          // 获取待领取奖励
          const rewards = await nftStakingContract.pendingRewards(nft.contractAddress, nft.tokenId);
          setPendingRewards(ethers.utils.formatEther(rewards));
          
          // 获取奖励倍数
          setMultiplier(stake.multiplier / 10000);
        } else {
          setStakedNFT(null);
        }
        */
      } catch (error) {
        console.error('Error checking staking eligibility:', error);
        setIsStakingEnabled(false);
      }
    };
    
    checkStakingEligibility();
    
    // 定期更新待领取奖励（每30秒）
    const interval = setInterval(() => {
      if (stakedNFT) {
        // 模拟奖励累积
        setPendingRewards(prev => {
          const current = parseFloat(prev);
          const increment = 0.1; // 每30秒增加0.1代币
          return (current + increment).toFixed(2);
        });
        
        // TODO: 实际合约调用
        /*
        const updateRewards = async () => {
          try {
            const rewards = await nftStakingContract.pendingRewards(nft.contractAddress, nft.tokenId);
            setPendingRewards(ethers.utils.formatEther(rewards));
          } catch (err) {
            console.error('Error updating rewards:', err);
          }
        };
        updateRewards();
        */
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [nft, isConnected, contracts, stakedNFT]);
  
  // 处理质押NFT
  const handleStakeNFT = async () => {
    if (!isConnected) {
      showError('请先连接钱包');
      return;
    }
    
    try {
      setLoading(true);
      
      // 模拟质押过程
      setTimeout(() => {
        const mockStakedNFT = {
          startTime: Date.now() / 1000,
          lastClaimTime: Date.now() / 1000,
          rewards: ethers.utils.parseEther('0'),
        };
        
        setStakedNFT(mockStakedNFT);
        setPendingRewards('0');
        setLoading(false);
        showSuccess(`${nft.name} 已成功质押！`);
        
        if (onSuccess) {
          onSuccess('stake', nft);
        }
      }, 2000);
      
      // TODO: 实际合约调用
      /*
      const nftStakingContract = contracts.NFTStaking;
      
      // 先检查并授权NFT转移
      const nftContract = new ethers.Contract(
        nft.contractAddress,
        ['function isApprovedForAll(address owner, address operator) view returns (bool)', 'function setApprovalForAll(address operator, bool approved)'],
        web3.signer
      );
      
      const isApproved = await nftContract.isApprovedForAll(account, nftStakingContract.address);
      
      if (!isApproved) {
        const approveTx = await nftContract.setApprovalForAll(nftStakingContract.address, true);
        await approveTx.wait();
      }
      
      // 质押NFT
      const stakeTx = await nftStakingContract.stakeNFT(nft.contractAddress, nft.tokenId);
      await stakeTx.wait();
      
      // 更新状态
      const stake = await nftStakingContract.stakes(nft.contractAddress, nft.tokenId);
      setStakedNFT(stake);
      setPendingRewards('0');
      
      showSuccess(`${nft.name} 已成功质押！`);
      
      if (onSuccess) {
        onSuccess('stake', nft);
      }
      */
      
    } catch (error) {
      console.error('质押NFT错误:', error);
      showError('质押失败: ' + error.message);
      setLoading(false);
    }
  };
  
  // 处理取消质押NFT
  const handleUnstakeNFT = async () => {
    if (!isConnected || !stakedNFT) {
      showError('无法取消质押');
      return;
    }
    
    try {
      setLoading(true);
      
      // 模拟取消质押过程
      setTimeout(() => {
        setStakedNFT(null);
        setPendingRewards('0');
        setLoading(false);
        showSuccess(`${nft.name} 已成功取消质押并收到奖励！`);
        
        if (onSuccess) {
          onSuccess('unstake', nft);
        }
      }, 2000);
      
      // TODO: 实际合约调用
      /*
      const nftStakingContract = contracts.NFTStaking;
      
      // 取消质押NFT
      const unstakeTx = await nftStakingContract.unstakeNFT(nft.contractAddress, nft.tokenId);
      await unstakeTx.wait();
      
      // 更新状态
      setStakedNFT(null);
      setPendingRewards('0');
      
      showSuccess(`${nft.name} 已成功取消质押并收到奖励！`);
      
      if (onSuccess) {
        onSuccess('unstake', nft);
      }
      */
      
    } catch (error) {
      console.error('取消质押NFT错误:', error);
      showError('取消质押失败: ' + error.message);
      setLoading(false);
    }
  };
  
  // 处理领取奖励
  const handleClaimRewards = async () => {
    if (!isConnected || !stakedNFT) {
      showError('无法领取奖励');
      return;
    }
    
    try {
      setLoading(true);
      
      // 模拟领取奖励过程
      setTimeout(() => {
        setPendingRewards('0');
        setLoading(false);
        showSuccess(`成功领取 ${pendingRewards} MVEX 代币！`);
      }, 2000);
      
      // TODO: 实际合约调用
      /*
      const nftStakingContract = contracts.NFTStaking;
      
      // 领取奖励
      const claimTx = await nftStakingContract.claimRewards(nft.contractAddress, nft.tokenId);
      await claimTx.wait();
      
      // 更新状态
      setPendingRewards('0');
      
      // 更新最后领取时间
      const stake = await nftStakingContract.stakes(nft.contractAddress, nft.tokenId);
      setStakedNFT(stake);
      
      showSuccess(`成功领取 ${pendingRewards} MVEX 代币！`);
      */
      
    } catch (error) {
      console.error('领取奖励错误:', error);
      showError('领取奖励失败: ' + error.message);
      setLoading(false);
    }
  };
  
  // 格式化时间
  const formatDuration = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}天 ${hours}小时`;
    } else if (hours > 0) {
      return `${hours}小时 ${minutes}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  };
  
  // 计算质押时长
  const getStakingDuration = () => {
    if (!stakedNFT) return '0';
    const now = Date.now() / 1000;
    const duration = now - stakedNFT.startTime;
    return formatDuration(duration);
  };
  
  // 计算离最小质押期限还有多久
  const getTimeToMinDuration = () => {
    if (!stakedNFT || !poolInfo) return '0';
    const now = Date.now() / 1000;
    const minEndTime = stakedNFT.startTime + poolInfo.minStakeDuration;
    
    if (now >= minEndTime) {
      return '已满足';
    }
    
    const remainingTime = minEndTime - now;
    return formatDuration(remainingTime);
  };
  
  if (!nft) return null;
  
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm p-6 rounded-xl border border-gray-700">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        {stakedNFT ? (
          <>
            <FaLock className="mr-2 text-green-400" />
            已质押
          </>
        ) : (
          <>
            <FaUnlock className="mr-2 text-indigo-400" />
            质押NFT
          </>
        )}
      </h2>
      
      {isStakingEnabled ? (
        <>
          {!stakedNFT ? (
            <>
              <div className="mb-6">
                <div className="bg-gray-700 bg-opacity-40 rounded-lg p-4 mb-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <FaInfoCircle className="mr-2 text-indigo-400" />
                    质押信息
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">质押池</span>
                      <span>{poolInfo?.poolName || 'MetaverseX NFT池'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">APR</span>
                      <span className="text-green-400 font-medium">{stakingAPR}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">奖励倍数</span>
                      <span>{multiplier}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">最低质押期</span>
                      <span>{poolInfo ? formatDuration(poolInfo.minStakeDuration) : '7天'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">提前取出惩罚</span>
                      <span className="text-red-400">{poolInfo ? poolInfo.earlyWithdrawalPenalty / 100 : 20}%</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleStakeNFT}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  <FaLock className="text-lg" />
                  {loading ? '处理中...' : '质押此NFT'}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  质押您的NFT以赚取MVEX代币
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg p-4 mb-4 border border-indigo-700/30">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium flex items-center">
                      <FaCoins className="mr-2 text-indigo-400" />
                      待领取奖励
                    </h3>
                    <span className="text-xl font-bold text-indigo-400">{pendingRewards} MVEX</span>
                  </div>
                  
                  <button
                    onClick={handleClaimRewards}
                    disabled={loading || parseFloat(pendingRewards) === 0}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex justify-center items-center gap-1"
                  >
                    <FaCoins className="text-sm" />
                    {loading ? '处理中...' : '领取奖励'}
                  </button>
                </div>
                
                <div className="bg-gray-700 bg-opacity-40 rounded-lg p-4 mb-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <FaClock className="mr-2 text-indigo-400" />
                    质押状态
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">已质押时长</span>
                      <span>{getStakingDuration()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">最低质押期限</span>
                      <span className={getTimeToMinDuration() === '已满足' ? 'text-green-400' : 'text-yellow-400'}>
                        {getTimeToMinDuration()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">APR</span>
                      <span className="text-green-400">{stakingAPR}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">奖励倍数</span>
                      <span>{multiplier}x</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleUnstakeNFT}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  <FaUnlock className="text-lg" />
                  {loading ? '处理中...' : '取消质押'}
                </button>
                
                {getTimeToMinDuration() !== '已满足' && (
                  <p className="text-xs text-orange-400 text-center mt-2 flex items-center justify-center">
                    <FaExclamationTriangle className="mr-1" />
                    提前取出将损失{poolInfo ? poolInfo.earlyWithdrawalPenalty / 100 : 20}%的奖励
                  </p>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <FaInfoCircle className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">此NFT暂不支持质押</p>
          <p className="text-sm text-gray-500">平台仅支持部分NFT集合进行质押</p>
        </div>
      )}
    </div>
  );
};

export default NFTStakingCard; 