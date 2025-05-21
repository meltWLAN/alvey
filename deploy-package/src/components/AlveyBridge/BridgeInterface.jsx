import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import { useWeb3React } from '@web3-react/core';
import { AlveyBridgeABI } from '../../contracts/abis/AlveyBridgeABI';
import { TokenABI } from '../../contracts/abis/TokenABI';

const BridgeInterface = () => {
  const { t } = useTranslation();
  const { account, library } = useWeb3React();
  const [token, setToken] = useState('');
  const [amount, setAmount] = useState('');
  const [targetChainId, setTargetChainId] = useState('');
  const [targetAddress, setTargetAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [supportedChains, setSupportedChains] = useState([]);
  const [supportedTokens, setSupportedTokens] = useState([]);

  const BRIDGE_CONTRACT_ADDRESS = process.env.REACT_APP_BRIDGE_CONTRACT_ADDRESS;

  useEffect(() => {
    const fetchSupportedChains = async () => {
      if (!library) return;
      const signer = library.getSigner();
      const bridgeContract = new ethers.Contract(
        BRIDGE_CONTRACT_ADDRESS,
        AlveyBridgeABI,
        signer
      );

      // 获取支持的链列表
      const chains = await bridgeContract.getSupportedChains();
      setSupportedChains(chains);
    };

    fetchSupportedChains();
  }, [library]);

  const handleBridge = async () => {
    try {
      setLoading(true);
      setError('');

      if (!account || !library) {
        throw new Error('Please connect your wallet');
      }

      const signer = library.getSigner();
      const bridgeContract = new ethers.Contract(
        BRIDGE_CONTRACT_ADDRESS,
        AlveyBridgeABI,
        signer
      );

      const tokenContract = new ethers.Contract(token, TokenABI, signer);
      const amountWei = ethers.utils.parseEther(amount);

      // 授权代币
      const approveTx = await tokenContract.approve(
        BRIDGE_CONTRACT_ADDRESS,
        amountWei
      );
      await approveTx.wait();

      // 发起跨链请求
      const bridgeTx = await bridgeContract.bridge(
        token,
        amountWei,
        targetChainId,
        targetAddress
      );
      await bridgeTx.wait();

      setAmount('');
      setTargetAddress('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (requestId) => {
    try {
      setLoading(true);
      setError('');

      if (!library) {
        throw new Error('Please connect your wallet');
      }

      const signer = library.getSigner();
      const bridgeContract = new ethers.Contract(
        BRIDGE_CONTRACT_ADDRESS,
        AlveyBridgeABI,
        signer
      );

      const request = await bridgeContract.getBridgeRequest(requestId);
      console.log('Bridge Request:', request);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{t('bridge.title')}</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('bridge.token')}
          </label>
          <select
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">{t('bridge.selectToken')}</option>
            {supportedTokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('bridge.amount')}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Amount"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('bridge.targetChain')}
          </label>
          <select
            value={targetChainId}
            onChange={(e) => setTargetChainId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">{t('bridge.selectChain')}</option>
            {supportedChains.map((chainId) => (
              <option key={chainId} value={chainId}>
                Chain ID: {chainId}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('bridge.targetAddress')}
          </label>
          <input
            type="text"
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Target Address"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={handleBridge}
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {loading ? t('common.loading') : t('bridge.bridge')}
          </button>

          <button
            onClick={() => handleCheckStatus('requestId')}
            disabled={loading}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {t('bridge.checkStatus')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BridgeInterface; 