import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Contract ABIs
import tokenABI from '../contracts/PaymentToken.json';
import nftABI from '../contracts/MetaverseXNFT.json';
import spaceABI from '../contracts/MetaverseSpace.json';
import marketABI from '../contracts/MetaverseMarket.json';

// Import from environment settings
import { NETWORK, CONTRACT_ADDRESSES, getEnvironmentName } from '../utils/environment';
import { addAlveyChainNetwork } from '../utils/web3';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [contracts, setContracts] = useState({
    token: null,
    nft: null,
    space: null,
    market: null
  });
  const [balance, setBalance] = useState({
    alvey: '0',
    mvx: '0'
  });
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [environmentName, setEnvironmentName] = useState('');

  useEffect(() => {
    setEnvironmentName(getEnvironmentName());
  }, []);

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    try {
      setConnecting(true);
      setConnectionError(null);
      
      if (window.ethereum) {
        // 使用Ethers v6的新方式创建provider和signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        
        // Check if we're on the correct network
        if (chainId !== parseInt(NETWORK.chainId, 16)) {
          const switched = await switchToCorrectNetwork();
          if (!switched) {
            setConnectionError(`请切换到${NETWORK.chainName}网络`);
            setConnecting(false);
            return;
          }
        }
        
        setProvider(provider);
        setSigner(signer);
        setAccount(accounts[0]);
        setChainId(chainId);
        setConnected(true);
        
        // 检查合约地址是否配置
        if (!CONTRACT_ADDRESSES.PAYMENT_TOKEN || CONTRACT_ADDRESSES.PAYMENT_TOKEN === '') {
          setConnectionError('合约地址未配置，请先部署合约');
          setConnecting(false);
          return;
        }
        
        // Initialize contracts
        const tokenContract = new ethers.Contract(
          CONTRACT_ADDRESSES.PAYMENT_TOKEN,
          tokenABI.abi,
          signer
        );
        
        const nftContract = new ethers.Contract(
          CONTRACT_ADDRESSES.NFT_CONTRACT,
          nftABI.abi,
          signer
        );
        
        const spaceContract = new ethers.Contract(
          CONTRACT_ADDRESSES.SPACE_CONTRACT,
          spaceABI.abi,
          signer
        );
        
        const marketContract = new ethers.Contract(
          CONTRACT_ADDRESSES.MARKET_CONTRACT,
          marketABI.abi,
          signer
        );
        
        setContracts({
          token: tokenContract,
          nft: nftContract,
          space: spaceContract,
          market: marketContract
        });
        
        // Get balances
        await updateBalances(accounts[0], provider, tokenContract);
      } else {
        setConnectionError('MetaMask未安装');
        console.error('MetaMask is not installed');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setConnectionError(error.message || '连接钱包时出错');
    } finally {
      setConnecting(false);
    }
  }, []);

  // Switch to correct network based on environment
  const switchToCorrectNetwork = async () => {
    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK.chainId }],
      });
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          // For AlveyChain use the helper, for local network add directly
          if (NETWORK.chainName === 'AlveyChain') {
            return await addAlveyChainNetwork();
          } else {
            // Add the network to MetaMask
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
            return true;
          }
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      }
      // User rejected the request
      console.error('Error switching network:', switchError);
      return false;
    }
  };

  // Update balances
  const updateBalances = async (address, provider, tokenContract) => {
    try {
      const nativeBalance = await provider.getBalance(address);
      const mvxBalance = tokenContract ? await tokenContract.balanceOf(address) : ethers.parseEther("0");
      
      setBalance({
        alvey: ethers.formatEther(nativeBalance),
        mvx: ethers.formatEther(mvxBalance)
      });
    } catch (error) {
      console.error('Error updating balances:', error);
    }
  };

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount('');
    setChainId(null);
    setConnected(false);
    setContracts({
      token: null,
      nft: null,
      space: null,
      market: null
    });
    setBalance({
      alvey: '0',
      mvx: '0'
    });
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (provider && contracts.token) {
            updateBalances(accounts[0], provider, contracts.token);
          }
        } else {
          // Disconnected
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, [provider, contracts.token, disconnectWallet]);

  const value = {
    provider,
    signer,
    account,
    chainId,
    connected,
    contracts,
    balance,
    connecting,
    connectionError,
    environmentName,
    connectWallet,
    disconnectWallet,
    updateBalances,
    switchToCorrectNetwork
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}; 