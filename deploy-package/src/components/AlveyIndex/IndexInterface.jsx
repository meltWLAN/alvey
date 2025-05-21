import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import { useWeb3React } from '@web3-react/core';
import { AlveyIndexABI } from '../../contracts/abis/AlveyIndexABI';
import { TokenABI } from '../../contracts/abis/TokenABI';

const IndexInterface = () => {
  const { t } = useTranslation();
  const { account, library } = useWeb3React();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokens, setTokens] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [totalShares, setTotalShares] = useState('0');

  const INDEX_CONTRACT_ADDRESS = process.env.REACT_APP_INDEX_CONTRACT_ADDRESS;

  useEffect(() => {
    const fetchIndexInfo = async () => {
      if (!library || !account) return;
      const signer = library.getSigner();
      const indexContract = new ethers.Contract(
        INDEX_CONTRACT_ADDRESS,
        AlveyIndexABI,
        signer
      );

      // 获取代币列表
      const tokenAddresses = await indexContract.getTokens();
      const tokenDetails = await Promise.all(
        tokenAddresses.map(async (address) => {
          const tokenContract = new ethers.Contract(address, TokenABI, signer);
          const symbol = await tokenContract.symbol();
          const info = await indexContract.getTokenInfo(address);
          return {
            address,
            symbol,
            weight: info.weight,
            balance: info.balance
          };
        })
      );
      setTokens(tokenDetails);

      // 获取用户信息
      const info = await indexContract.getUserInfo(account);
      setUserInfo(info);

      // 获取总份额
      const total = await indexContract.getTotalShares();
      setTotalShares(ethers.utils.formatEther(total));
    };

    fetchIndexInfo();
  }, [library, account]);

  const handleInvest = async () => {
    try {
      setLoading(true);
      setError('');

      if (!account || !library) {
        throw new Error('Please connect your wallet');
      }

      const signer = library.getSigner();
      const indexContract = new ethers.Contract(
        INDEX_CONTRACT_ADDRESS,
        AlveyIndexABI,
        signer
      );

      // 投资
      const investTx = await indexContract.invest({
        value: ethers.utils.parseEther(amount)
      });
      await investTx.wait();

      setAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    try {
      setLoading(true);
      setError('');

      if (!account || !library) {
        throw new Error('Please connect your wallet');
      }

      const signer = library.getSigner();
      const indexContract = new ethers.Contract(
        INDEX_CONTRACT_ADDRESS,
        AlveyIndexABI,
        signer
      );

      // 赎回
      const redeemTx = await indexContract.redeem(
        ethers.utils.parseEther(amount)
      );
      await redeemTx.wait();

      setAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{t('index.title')}</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {t('index.totalShares')}
          </h3>
          <p className="text-2xl font-semibold text-gray-900">
            {totalShares}
          </p>
        </div>

        {userInfo && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {t('index.yourShares')}
            </h3>
            <p className="text-lg font-semibold">
              {ethers.utils.formatEther(userInfo.shares)}
            </p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {t('index.portfolio')}
          </h3>
          <div className="space-y-2">
            {tokens.map((token) => (
              <div key={token.address} className="flex justify-between">
                <span className="text-sm text-gray-600">{token.symbol}</span>
                <span className="text-sm font-medium">
                  {ethers.utils.formatEther(token.balance)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('index.amount')}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Amount"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={handleInvest}
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {loading ? t('common.loading') : t('index.invest')}
          </button>

          <button
            onClick={handleRedeem}
            disabled={loading || !userInfo || userInfo.shares.eq(0)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {t('index.redeem')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndexInterface; 