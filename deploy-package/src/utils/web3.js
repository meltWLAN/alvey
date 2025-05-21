import { ethers } from 'ethers';
import { NETWORK } from './environment';

/**
 * Add AlveyChain network to MetaMask
 * @returns {Promise<boolean>} Success status
 */
export const addAlveyChainNetwork = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: NETWORK.chainId,
          chainName: NETWORK.chainName,
          nativeCurrency: NETWORK.nativeCurrency,
          rpcUrls: NETWORK.rpcUrls,
          blockExplorerUrls: NETWORK.blockExplorerUrls
        }
      ]
    });
    
    console.log('AlveyChain network added successfully');
    return true;
  } catch (error) {
    console.error('Failed to add AlveyChain network:', error);
    return false;
  }
};

/**
 * Format ETH value to user-friendly string
 * @param {string|number|bigint} value - The ETH value
 * @param {number} decimals - Number of decimals to display
 * @returns {string} Formatted ETH value
 */
export const formatEth = (value, decimals = 4) => {
  if (!value) return '0';
  
  try {
    // 使用ethers v6的formatEther
    const parsed = ethers.formatEther(value);
    
    // Format to specified decimals
    return parseFloat(parsed).toFixed(decimals);
  } catch (error) {
    console.error('Error formatting ETH value:', error);
    return '0';
  }
};

/**
 * Format address for display
 * @param {string} address - Ethereum address
 * @param {number} startChars - Number of characters to show at start
 * @param {number} endChars - Number of characters to show at end
 * @returns {string} Formatted address
 */
export const formatAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  if (address.length < startChars + endChars + 3) return address;
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Check if a transaction receipt was successful
 * @param {Object} receipt - Transaction receipt
 * @returns {boolean} Success status
 */
export const isTransactionSuccessful = (receipt) => {
  return receipt && receipt.status === 1;
}; 