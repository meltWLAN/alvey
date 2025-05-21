import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';
import { useWeb3React } from '@web3-react/core';
import { AlveySwapABI } from '../../contracts/abis/AlveySwapABI';
import { TokenABI } from '../../contracts/abis/TokenABI';

const SwapInterface = () => {
  const { t } = useTranslation();
  const { account, library } = useWeb3React();
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const SWAP_CONTRACT_ADDRESS = process.env.REACT_APP_SWAP_CONTRACT_ADDRESS;

  const handleSwap = async () => {
    try {
      setLoading(true);
      setError('');

      if (!account || !library) {
        throw new Error('Please connect your wallet');
      }

      const signer = library.getSigner();
      const swapContract = new ethers.Contract(
        SWAP_CONTRACT_ADDRESS,
        AlveySwapABI,
        signer
      );

      const tokenAContract = new ethers.Contract(tokenA, TokenABI, signer);
      const amountInWei = ethers.utils.parseEther(amountIn);

      // 授权代币
      const approveTx = await tokenAContract.approve(
        SWAP_CONTRACT_ADDRESS,
        amountInWei
      );
      await approveTx.wait();

      // 执行交换
      const swapTx = await swapContract.swap(
        tokenA,
        tokenB,
        amountInWei,
        ethers.utils.parseEther(amountOut)
      );
      await swapTx.wait();

      setAmountIn('');
      setAmountOut('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLiquidity = async () => {
    try {
      setLoading(true);
      setError('');

      if (!account || !library) {
        throw new Error('Please connect your wallet');
      }

      const signer = library.getSigner();
      const swapContract = new ethers.Contract(
        SWAP_CONTRACT_ADDRESS,
        AlveySwapABI,
        signer
      );

      const tokenAContract = new ethers.Contract(tokenA, TokenABI, signer);
      const tokenBContract = new ethers.Contract(tokenB, TokenABI, signer);

      const amountAWei = ethers.utils.parseEther(amountIn);
      const amountBWei = ethers.utils.parseEther(amountOut);

      // 授权代币
      const approveATx = await tokenAContract.approve(
        SWAP_CONTRACT_ADDRESS,
        amountAWei
      );
      const approveBTx = await tokenBContract.approve(
        SWAP_CONTRACT_ADDRESS,
        amountBWei
      );
      await Promise.all([approveATx.wait(), approveBTx.wait()]);

      // 添加流动性
      const addLiquidityTx = await swapContract.addLiquidity(
        tokenA,
        tokenB,
        amountAWei,
        amountBWei
      );
      await addLiquidityTx.wait();

      setAmountIn('');
      setAmountOut('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{t('swap.title')}</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('swap.tokenA')}
          </label>
          <input
            type="text"
            value={tokenA}
            onChange={(e) => setTokenA(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Token A Address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('swap.tokenB')}
          </label>
          <input
            type="text"
            value={tokenB}
            onChange={(e) => setTokenB(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Token B Address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('swap.amountIn')}
          </label>
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Amount In"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('swap.amountOut')}
          </label>
          <input
            type="number"
            value={amountOut}
            onChange={(e) => setAmountOut(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Amount Out"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('swap.slippage')}
          </label>
          <input
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Slippage %"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={handleSwap}
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {loading ? t('common.loading') : t('swap.swap')}
          </button>

          <button
            onClick={handleAddLiquidity}
            disabled={loading}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {loading ? t('common.loading') : t('swap.addLiquidity')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapInterface; 