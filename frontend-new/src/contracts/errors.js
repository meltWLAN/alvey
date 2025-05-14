// Common error messages
export const ERROR_MESSAGES = {
  // General errors
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INSUFFICIENT_ALLOWANCE: 'Insufficient allowance',
  INVALID_AMOUNT: 'Invalid amount',
  INVALID_ADDRESS: 'Invalid address',
  TRANSACTION_FAILED: 'Transaction failed',
  NETWORK_ERROR: 'Network error',
  USER_REJECTED: 'User rejected the transaction',
  CONTRACT_NOT_INITIALIZED: 'Contract not initialized',

  // AlveySwap errors
  INSUFFICIENT_LIQUIDITY: 'Insufficient liquidity',
  INVALID_SLIPPAGE: 'Invalid slippage',
  PAIR_EXISTS: 'Pair already exists',
  PAIR_NOT_EXISTS: 'Pair does not exist',
  INVALID_TOKEN_PAIR: 'Invalid token pair',

  // AlveyBridge errors
  INVALID_CHAIN: 'Invalid chain',
  BRIDGE_NOT_SUPPORTED: 'Bridge not supported for this token',
  BRIDGE_AMOUNT_TOO_LOW: 'Bridge amount too low',
  BRIDGE_AMOUNT_TOO_HIGH: 'Bridge amount too high',
  BRIDGE_REQUEST_NOT_FOUND: 'Bridge request not found',
  BRIDGE_ALREADY_COMPLETED: 'Bridge already completed',

  // AlveyLend errors
  INSUFFICIENT_COLLATERAL: 'Insufficient collateral',
  BORROW_LIMIT_EXCEEDED: 'Borrow limit exceeded',
  LIQUIDATION_THRESHOLD_NOT_REACHED: 'Liquidation threshold not reached',
  MARKET_NOT_SUPPORTED: 'Market not supported',
  INVALID_INTEREST_RATE: 'Invalid interest rate',
  INVALID_COLLATERAL_RATIO: 'Invalid collateral ratio',

  // AlveyStake errors
  STAKE_AMOUNT_TOO_LOW: 'Stake amount too low',
  STAKE_PERIOD_NOT_ENDED: 'Stake period not ended',
  NO_REWARDS_AVAILABLE: 'No rewards available',
  INVALID_REWARD_RATE: 'Invalid reward rate',
  INVALID_STAKING_PERIOD: 'Invalid staking period',

  // AlveyIndex errors
  INVALID_WEIGHT: 'Invalid weight',
  INSUFFICIENT_SHARES: 'Insufficient shares',
  TOKEN_NOT_SUPPORTED: 'Token not supported',
  REBALANCE_NOT_NEEDED: 'Rebalance not needed',
  INVESTMENT_AMOUNT_TOO_LOW: 'Investment amount too low'
};

// Error handler class
export class ContractError extends Error {
  constructor(message, code, data = {}) {
    super(message);
    this.name = 'ContractError';
    this.code = code;
    this.data = data;
  }
}

// Error handler function
export const handleContractError = (error) => {
  // Handle user rejection
  if (error.code === 4001) {
    throw new ContractError(ERROR_MESSAGES.USER_REJECTED, 'USER_REJECTED');
  }

  // Handle network errors
  if (error.code === 'NETWORK_ERROR') {
    throw new ContractError(ERROR_MESSAGES.NETWORK_ERROR, 'NETWORK_ERROR');
  }

  // Handle contract errors
  if (error.data) {
    const errorMessage = error.data.message || error.message;
    
    // Check for common error patterns
    if (errorMessage.includes('insufficient balance')) {
      throw new ContractError(ERROR_MESSAGES.INSUFFICIENT_BALANCE, 'INSUFFICIENT_BALANCE');
    }
    if (errorMessage.includes('insufficient allowance')) {
      throw new ContractError(ERROR_MESSAGES.INSUFFICIENT_ALLOWANCE, 'INSUFFICIENT_ALLOWANCE');
    }
    if (errorMessage.includes('invalid amount')) {
      throw new ContractError(ERROR_MESSAGES.INVALID_AMOUNT, 'INVALID_AMOUNT');
    }
    if (errorMessage.includes('invalid address')) {
      throw new ContractError(ERROR_MESSAGES.INVALID_ADDRESS, 'INVALID_ADDRESS');
    }
    if (errorMessage.includes('insufficient liquidity')) {
      throw new ContractError(ERROR_MESSAGES.INSUFFICIENT_LIQUIDITY, 'INSUFFICIENT_LIQUIDITY');
    }
    if (errorMessage.includes('pair exists')) {
      throw new ContractError(ERROR_MESSAGES.PAIR_EXISTS, 'PAIR_EXISTS');
    }
    if (errorMessage.includes('pair not exists')) {
      throw new ContractError(ERROR_MESSAGES.PAIR_NOT_EXISTS, 'PAIR_NOT_EXISTS');
    }
    if (errorMessage.includes('invalid chain')) {
      throw new ContractError(ERROR_MESSAGES.INVALID_CHAIN, 'INVALID_CHAIN');
    }
    if (errorMessage.includes('bridge not supported')) {
      throw new ContractError(ERROR_MESSAGES.BRIDGE_NOT_SUPPORTED, 'BRIDGE_NOT_SUPPORTED');
    }
    if (errorMessage.includes('insufficient collateral')) {
      throw new ContractError(ERROR_MESSAGES.INSUFFICIENT_COLLATERAL, 'INSUFFICIENT_COLLATERAL');
    }
    if (errorMessage.includes('borrow limit exceeded')) {
      throw new ContractError(ERROR_MESSAGES.BORROW_LIMIT_EXCEEDED, 'BORROW_LIMIT_EXCEEDED');
    }
    if (errorMessage.includes('stake period not ended')) {
      throw new ContractError(ERROR_MESSAGES.STAKE_PERIOD_NOT_ENDED, 'STAKE_PERIOD_NOT_ENDED');
    }
    if (errorMessage.includes('no rewards available')) {
      throw new ContractError(ERROR_MESSAGES.NO_REWARDS_AVAILABLE, 'NO_REWARDS_AVAILABLE');
    }
    if (errorMessage.includes('invalid weight')) {
      throw new ContractError(ERROR_MESSAGES.INVALID_WEIGHT, 'INVALID_WEIGHT');
    }
    if (errorMessage.includes('insufficient shares')) {
      throw new ContractError(ERROR_MESSAGES.INSUFFICIENT_SHARES, 'INSUFFICIENT_SHARES');
    }
  }

  // Handle unknown errors
  throw new ContractError(ERROR_MESSAGES.TRANSACTION_FAILED, 'UNKNOWN_ERROR', { originalError: error });
};

// Error message formatter
export const formatErrorMessage = (error) => {
  if (error instanceof ContractError) {
    return error.message;
  }
  return ERROR_MESSAGES.TRANSACTION_FAILED;
};

// Error code checker
export const hasErrorCode = (error, code) => {
  if (error instanceof ContractError) {
    return error.code === code;
  }
  return false;
}; 