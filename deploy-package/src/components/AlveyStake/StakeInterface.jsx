import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import { useWeb3React } from '@web3-react/core';
import { AlveyStakeABI } from '../../contracts/abis/AlveyStakeABI';
import { TokenABI } from '../../contracts/abis/TokenABI';

const StakeInterface = () => {
  const { t } = useTranslation();
  const { account, library } = useWeb3React();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stakingInfo, setStakingInfo] = useState(null);
  const [rewardRate, setRewardRate] = useState('0');
  const [totalStaked, setTotalStaked] = useState('0');

  const STAKE_CONTRACT_ADDRESS = process.env.REACT_APP_STAKE_CONTRACT_ADDRESS;

  useEffect(() => {
    const fetchStakingInfo = async () => {
      if (!library || !account) return;
      const signer = library.getSigner();
      const stakeContract = new ethers.Contract(
        STAKE_CONTRACT_ADDRESS,
        AlveyStakeABI,
        signer
      );

      // 获取质押信息
      const info = await stakeContract.getStakingInfo(account);
      setStakingInfo(info);

      // 获取奖励率
      const rate = await stakeContract.rewardRate();
      setRewardRate(ethers.utils.formatEther(rate));

      // 获取总质押量
      const total = await stakeContract.getTotalStaked();
      setTotalStaked(ethers.utils.formatEther(total));
    };

    fetchStakingInfo();
  }, [library, account]);

  const handleStake = async () => {
    try {
      setLoading(true);
      setError('');

      if (!account || !library) {
        throw new Error('Please connect your wallet');
      }

      const signer = library.getSigner();
      const stakeContract = new ethers.Contract(
        STAKE_CONTRACT_ADDRESS,
        AlveyStakeABI,
        signer
      );

      const stakingToken = await stakeContract.stakingToken();
      const tokenContract = new ethers.Contract(stakingToken, TokenABI, signer);
      const amountWei = ethers.utils.parseEther(amount);

      // 授权代币
      const approveTx = await tokenContract.approve(
        STAKE_CONTRACT_ADDRESS,
        amountWei
      );
      await approveTx.wait();

      // 质押
      const stakeTx = await stakeContract.stake(amountWei);
      await stakeTx.wait();

      setAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    try {
      setLoading(true);
      setError('');

      if (!account || !library) {
        throw new Error('Please connect your wallet');
      }

      const signer = library.getSigner();
      const stakeContract = new ethers.Contract(
        STAKE_CONTRACT_ADDRESS,
        AlveyStakeABI,
        signer
      );

      // 解押
      const unstakeTx = await stakeContract.unstake();
      await unstakeTx.wait();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetReward = async () => {
    try {
      setLoading(true);
      setError('');

      if (!account || !library) {
        throw new Error('Please connect your wallet');
      }

      const signer = library.getSigner();
      const stakeContract = new ethers.Contract(
        STAKE_CONTRACT_ADDRESS,
        AlveyStakeABI,
        signer
      );

      // 领取奖励
      const rewardTx = await stakeContract.getReward();
      await rewardTx.wait();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{t('stake.title')}</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">
              {t('stake.totalStaked')}
            </h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {totalStaked}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">
              {t('stake.rewardRate')}
            </h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {rewardRate} /s
            </p>
          </div>
        </div>

        {stakingInfo && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {t('stake.yourStake')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">
                  {t('stake.amount')}
                </p>
                <p className="text-lg font-semibold">
                  {ethers.utils.formatEther(stakingInfo.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {t('stake.rewards')}
                </p>
                <p className="text-lg font-semibold">
                  {ethers.utils.formatEther(stakingInfo.rewardDebt)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('stake.amount')}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Amount to stake"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={handleStake}
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {loading ? t('common.loading') : t('stake.stake')}
          </button>

          <button
            onClick={handleUnstake}
            disabled={loading || !stakingInfo || stakingInfo.amount.eq(0)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {t('stake.unstake')}
          </button>

          <button
            onClick={handleGetReward}
            disabled={loading || !stakingInfo || stakingInfo.rewardDebt.eq(0)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {t('stake.claimRewards')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StakeInterface; 