import {
  getAlveySwap,
  getAlveyBridge,
  getAlveyLend,
  getAlveyStake,
  getAlveyIndex
} from './contracts';

// AlveySwap events
export const listenToSwapEvents = (provider, callback) => {
  const contract = getAlveySwap(provider);
  contract.on('Swap', (sender, tokenIn, tokenOut, amountIn, amountOut, event) => {
    callback({
      type: 'Swap',
      sender,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      transactionHash: event.transactionHash
    });
  });
};

export const listenToLiquidityEvents = (provider, callback) => {
  const contract = getAlveySwap(provider);
  contract.on('AddLiquidity', (provider, tokenA, tokenB, amountA, amountB, event) => {
    callback({
      type: 'AddLiquidity',
      provider,
      tokenA,
      tokenB,
      amountA,
      amountB,
      transactionHash: event.transactionHash
    });
  });

  contract.on('RemoveLiquidity', (provider, tokenA, tokenB, amountA, amountB, event) => {
    callback({
      type: 'RemoveLiquidity',
      provider,
      tokenA,
      tokenB,
      amountA,
      amountB,
      transactionHash: event.transactionHash
    });
  });
};

// AlveyBridge events
export const listenToBridgeEvents = (provider, callback) => {
  const contract = getAlveyBridge(provider);
  contract.on('BridgeInitiated', (requestId, token, sender, recipient, amount, sourceChainId, targetChainId, event) => {
    callback({
      type: 'BridgeInitiated',
      requestId,
      token,
      sender,
      recipient,
      amount,
      sourceChainId,
      targetChainId,
      transactionHash: event.transactionHash
    });
  });

  contract.on('BridgeCompleted', (requestId, token, sender, recipient, amount, sourceChainId, targetChainId, event) => {
    callback({
      type: 'BridgeCompleted',
      requestId,
      token,
      sender,
      recipient,
      amount,
      sourceChainId,
      targetChainId,
      transactionHash: event.transactionHash
    });
  });
};

// AlveyLend events
export const listenToLendEvents = (provider, callback) => {
  const contract = getAlveyLend(provider);
  contract.on('Deposit', (user, token, amount, event) => {
    callback({
      type: 'Deposit',
      user,
      token,
      amount,
      transactionHash: event.transactionHash
    });
  });

  contract.on('Withdraw', (user, token, amount, event) => {
    callback({
      type: 'Withdraw',
      user,
      token,
      amount,
      transactionHash: event.transactionHash
    });
  });

  contract.on('Borrow', (user, token, amount, event) => {
    callback({
      type: 'Borrow',
      user,
      token,
      amount,
      transactionHash: event.transactionHash
    });
  });

  contract.on('Repay', (user, token, amount, event) => {
    callback({
      type: 'Repay',
      user,
      token,
      amount,
      transactionHash: event.transactionHash
    });
  });

  contract.on('Liquidate', (liquidator, user, token, amount, event) => {
    callback({
      type: 'Liquidate',
      liquidator,
      user,
      token,
      amount,
      transactionHash: event.transactionHash
    });
  });
};

// AlveyStake events
export const listenToStakeEvents = (provider, callback) => {
  const contract = getAlveyStake(provider);
  contract.on('Staked', (user, amount, event) => {
    callback({
      type: 'Staked',
      user,
      amount,
      transactionHash: event.transactionHash
    });
  });

  contract.on('Unstaked', (user, amount, event) => {
    callback({
      type: 'Unstaked',
      user,
      amount,
      transactionHash: event.transactionHash
    });
  });

  contract.on('RewardPaid', (user, amount, event) => {
    callback({
      type: 'RewardPaid',
      user,
      amount,
      transactionHash: event.transactionHash
    });
  });
};

// AlveyIndex events
export const listenToIndexEvents = (provider, callback) => {
  const contract = getAlveyIndex(provider);
  contract.on('Invested', (user, amount, shares, event) => {
    callback({
      type: 'Invested',
      user,
      amount,
      shares,
      transactionHash: event.transactionHash
    });
  });

  contract.on('Redeemed', (user, shares, amount, event) => {
    callback({
      type: 'Redeemed',
      user,
      shares,
      amount,
      transactionHash: event.transactionHash
    });
  });

  contract.on('Rebalanced', (token, oldWeight, newWeight, event) => {
    callback({
      type: 'Rebalanced',
      token,
      oldWeight,
      newWeight,
      transactionHash: event.transactionHash
    });
  });
};

// Utility function to remove all listeners
export const removeAllListeners = (provider) => {
  const contracts = [
    getAlveySwap(provider),
    getAlveyBridge(provider),
    getAlveyLend(provider),
    getAlveyStake(provider),
    getAlveyIndex(provider)
  ];

  contracts.forEach(contract => {
    contract.removeAllListeners();
  });
}; 