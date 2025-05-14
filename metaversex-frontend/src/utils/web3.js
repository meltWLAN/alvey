/**
 * Format an Ethereum address for display (truncate middle)
 * @param {string} address - The Ethereum address to format
 * @param {number} startChars - Number of characters to show at the start
 * @param {number} endChars - Number of characters to show at the end
 * @returns {string} Formatted address
 */
export const formatAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  if (address.length < startChars + endChars + 3) return address;
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Format a value to Ether (ETH) with a specified precision
 * @param {string|number} value - The value in wei to format
 * @param {number} decimals - Number of decimal places to show
 * @returns {string} Formatted ETH value
 */
export const formatEther = (value, decimals = 4) => {
  if (!value) return '0';
  
  // If the value is already a number, assume it's in ETH
  if (typeof value === 'number') {
    return value.toFixed(decimals);
  }
  
  // Convert wei to ETH (1 ETH = 10^18 wei)
  const eth = parseFloat(value) / 1e18;
  return eth.toFixed(decimals);
};

/**
 * Check if an address is valid
 * @param {string} address - The address to validate
 * @returns {boolean} Whether the address is valid
 */
export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Sleep for a specified duration - useful for debugging and testing
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after the sleep
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Handle Ethereum transaction errors with better messages
 * @param {Error} error - The error from the transaction
 * @returns {string} Human-readable error message
 */
export const getTransactionErrorMessage = (error) => {
  if (!error) return 'Unknown error';
  
  // Check common error patterns
  if (error.code === 4001) {
    return 'Transaction rejected by user';
  }
  
  if (error.message && error.message.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  
  if (error.message && error.message.includes('gas required exceeds allowance')) {
    return 'Transaction would exceed gas limit';
  }
  
  // Return original message if no better message is found
  return error.message || 'Transaction failed';
}; 