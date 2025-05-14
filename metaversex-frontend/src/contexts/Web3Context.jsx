import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

// MetaverseX合约ABIs
import NFTContractABI from '../utils/abis/MetaverseXNFT.json';
import SpaceContractABI from '../utils/abis/MetaverseSpace.json';
import MarketContractABI from '../utils/abis/MetaverseMarket.json';
import TokenContractABI from '../utils/abis/MockERC20.json';

// 合约地址（来自部署）
const CONTRACT_ADDRESSES = {
  PAYMENT_TOKEN: "0xF88c032e746E3E701B316C8052bF271DB540871E",
  NFT_CONTRACT: "0xA3FD15143C6d59b12D8A3ec6aBc4aFbFc9717783",
  SPACE_CONTRACT: "0x1E14dA01C70845AEA03b2AC8D582538Ff48239af",
  MARKET_CONTRACT: "0x1A36D5019fc61cc9628ABabBBed137b2b4BD6f11"
};

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [networkName, setNetworkName] = useState(null);
  const [contracts, setContracts] = useState({
    token: null,
    nft: null,
    space: null,
    market: null
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState({ native: '0', token: '0' });

  // 连接到钱包
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsConnecting(true);
        setError(null);

        // 请求账户访问
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        const network = await newProvider.getNetwork();
        
        // 设置状态
        setAccount(accounts[0]);
        setProvider(newProvider);
        setSigner(newSigner);
        setNetworkName(network.name);
        
        // 初始化合约
        await initializeContracts(newProvider, newSigner);
        
        // 获取余额
        await updateBalances(accounts[0], newProvider);
        
        console.log('Wallet connected:', accounts[0]);
      } catch (err) {
        console.error('Error connecting to wallet:', err);
        setError('连接钱包时出错: ' + (err.message || err));
      } finally {
        setIsConnecting(false);
      }
    } else {
      setError('请安装MetaMask钱包');
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setContracts({
      token: null,
      nft: null,
      space: null,
      market: null
    });
    setBalance({ native: '0', token: '0' });
  };

  // 初始化合约实例
  const initializeContracts = async (provider, signer) => {
    try {
      // 创建合约实例
      const tokenContract = new ethers.Contract(
        CONTRACT_ADDRESSES.PAYMENT_TOKEN,
        TokenContractABI.abi,
        signer
      );
      
      const nftContract = new ethers.Contract(
        CONTRACT_ADDRESSES.NFT_CONTRACT,
        NFTContractABI.abi,
        signer
      );
      
      const spaceContract = new ethers.Contract(
        CONTRACT_ADDRESSES.SPACE_CONTRACT,
        SpaceContractABI.abi,
        signer
      );
      
      const marketContract = new ethers.Contract(
        CONTRACT_ADDRESSES.MARKET_CONTRACT,
        MarketContractABI.abi,
        signer
      );
      
      // 更新状态
      setContracts({
        token: tokenContract,
        nft: nftContract,
        space: spaceContract,
        market: marketContract
      });
      
      console.log('Contracts initialized');
    } catch (err) {
      console.error('Error initializing contracts:', err);
      setError('初始化合约时出错: ' + (err.message || err));
    }
  };

  // 更新账户余额
  const updateBalances = async (address, provider) => {
    try {
      if (!address || !provider) return;
      
      // 获取原生代币余额
      const nativeBalance = await provider.getBalance(address);
      const formattedNativeBalance = ethers.formatEther(nativeBalance);
      
      // 获取代币余额
      const tokenContract = new ethers.Contract(
        CONTRACT_ADDRESSES.PAYMENT_TOKEN,
        TokenContractABI.abi,
        provider
      );
      const tokenBalance = await tokenContract.balanceOf(address);
      const formattedTokenBalance = ethers.formatEther(tokenBalance);
      
      setBalance({
        native: formattedNativeBalance,
        token: formattedTokenBalance
      });
    } catch (err) {
      console.error('Error fetching balances:', err);
    }
  };

  // 处理账户变更
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          // 用户断开了所有账户
          disconnectWallet();
        } else if (accounts[0] !== account) {
          // 用户切换了账户
          setAccount(accounts[0]);
          if (provider) {
            const newSigner = await provider.getSigner();
            setSigner(newSigner);
            await initializeContracts(provider, newSigner);
            await updateBalances(accounts[0], provider);
          }
        }
      };

      const handleChainChanged = () => {
        // 链ID改变时，我们需要重新加载页面
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // 清理函数
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, provider]);

  // 自动连接钱包（如果用户已授权）
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error('Auto connect error:', error);
        }
      }
    };

    autoConnect();
  }, []);

  // 提供函数和状态给子组件
  const value = {
    account,
    provider,
    signer,
    networkName,
    contracts,
    balance,
    isConnected: !!account,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    updateBalances,
    contractAddresses: CONTRACT_ADDRESSES
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Hook用于访问Web3Context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3必须在Web3Provider中使用');
  }
  return context;
};

export default Web3Context; 