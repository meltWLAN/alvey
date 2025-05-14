import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from './addresses';
import { AlveySwapABI } from './abis/AlveySwapABI';
import { AlveyBridgeABI } from './abis/AlveyBridgeABI';
import { AlveyLendABI } from './abis/AlveyLendABI';
import { AlveyStakeABI } from './abis/AlveyStakeABI';
import { AlveyIndexABI } from './abis/AlveyIndexABI';

// Get the current network
const getNetwork = () => {
  // TODO: Implement network detection logic
  return 'development';
};

// Get contract address based on network
const getContractAddress = (contractName) => {
  const network = getNetwork();
  return CONTRACT_ADDRESSES[network][contractName];
};

// Create contract instance
export const getContract = (contractName, signerOrProvider) => {
  const address = getContractAddress(contractName);
  let abi;

  switch (contractName) {
    case 'AlveySwap':
      abi = AlveySwapABI;
      break;
    case 'AlveyBridge':
      abi = AlveyBridgeABI;
      break;
    case 'AlveyLend':
      abi = AlveyLendABI;
      break;
    case 'AlveyStake':
      abi = AlveyStakeABI;
      break;
    case 'AlveyIndex':
      abi = AlveyIndexABI;
      break;
    default:
      throw new Error(`Unknown contract: ${contractName}`);
  }

  return new ethers.Contract(address, abi, signerOrProvider);
};

// Helper function to get contract with signer
export const getContractWithSigner = (contractName, signer) => {
  return getContract(contractName, signer);
};

// Helper function to get contract with provider
export const getContractWithProvider = (contractName, provider) => {
  return getContract(contractName, provider);
};

// Export individual contract getters
export const getAlveySwap = (signerOrProvider) => getContract('AlveySwap', signerOrProvider);
export const getAlveyBridge = (signerOrProvider) => getContract('AlveyBridge', signerOrProvider);
export const getAlveyLend = (signerOrProvider) => getContract('AlveyLend', signerOrProvider);
export const getAlveyStake = (signerOrProvider) => getContract('AlveyStake', signerOrProvider);
export const getAlveyIndex = (signerOrProvider) => getContract('AlveyIndex', signerOrProvider); 