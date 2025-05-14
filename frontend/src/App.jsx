import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import AlveyLendPage from './pages/AlveyLendPage';
import AlveyLendPageV2 from './pages/AlveyLendPageV2';
import NFTLendingABI from '../../artifacts/contracts/metaversex/NFTLending.sol/NFTLending.json';
import NFTLendingV2ABI from '../../artifacts/contracts/metaversex/NFTLendingV2.sol/NFTLendingV2.json';

// NFT合约ABI
const contractABI = [
  "function safeMint(address to, string memory uri) public",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function mintPrice() public view returns (uint256)"
];

// ERC20代币ABI
const tokenABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)"
];

// 质押合约ABI
const stakingABI = [
  "function stake(uint256 tokenId) public",
  "function unstake(uint256 tokenId) public",
  "function claimReward() public",
  "function getPendingReward(address user) public view returns (uint256)",
  "function getStakedTokens(address user) public view returns (uint256[] memory)"
];

const contractAddress = "0xA3FD15143C6d59b12D8A3ec6aBc4aFbFc9717783"; // NFT合约地址
const tokenAddress = "0xF88c032e746E3E701B316C8052bF271DB540871E"; // Mario代币地址
const stakingContractAddress = "0x1A36D5019fc61cc9628ABabBBed137b2b4BD6f11"; // 质押合约地址
const alveyLendContractAddress = "0xYOUR_ALVEYLEND_CONTRACT_ADDRESS_HERE"; // TODO: 替换为真实的AlveyLend合约地址
const alveyLendV2ContractAddress = "0xYOUR_ALVEYLENDV2_CONTRACT_ADDRESS_HERE"; // TODO: 替换为真实的AlveyLendV2合约地址

function App() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [stakingContract, setStakingContract] = useState(null);
  const [alveyLendContract, setAlveyLendContract] = useState(null);
  const [alveyLendV2Contract, setAlveyLendV2Contract] = useState(null);
  const [tokenURI, setTokenURI] = useState('');
  const [minting, setMinting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState({status: '', hash: '', timestamp: 0});
  const [txHistory, setTxHistory] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [stakeTokenId, setStakeTokenId] = useState('');
  const [userStakes, setUserStakes] = useState([]);
  const [stakingLoading, setStakingLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [mintPrice, setMintPrice] = useState('0');
  const [notification, setNotification] = useState('');
  const [chainId, setChainId] = useState('');
  
  // 新增状态
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'marketplace', 'spaces', 'apphub'
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [marketplaceNFTs, setMarketplaceNFTs] = useState([]);
  const [virtualSpaces, setVirtualSpaces] = useState([]);
  const [apps, setApps] = useState([]);
  const [showDemoContent, setShowDemoContent] = useState(false);
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [connectedApps, setConnectedApps] = useState([]);
  const [connectingApp, setConnectingApp] = useState(null);
  const [activeSpace, setActiveSpace] = useState(null);
  const [enteringSpace, setEnteringSpace] = useState(false);
  const [activeDApp, setActiveDApp] = useState(null);
  const [isV2Enabled, setIsV2Enabled] = useState(true); // 新增：控制是否使用V2版本

  useEffect(() => {
    initializeEthers();
    checkMobileWallet();
    
    // 加载示例数据
    if (showDemoContent) {
      loadDemoData();
    }
  }, [showDemoContent]);

  useEffect(() => {
    if (account && tokenContract && contract) {
      updateBalanceAndPrice();
      loadUserNFTs();
    }
  }, [account, tokenContract, contract]);

  const loadDemoData = () => {
    // 加载示例NFT数据
    setMarketplaceNFTs([
      { id: 1, name: "宝石骑士", price: "500", image: "https://ipfs.io/ipfs/QmZ4tj7MQJkry7YJ4ybkXGrGcYsu7fm7qZK8dvbS5k6qpw/gemknight.png" },
      { id: 2, name: "星际探险家", price: "800", image: "https://ipfs.io/ipfs/QmZ4tj7MQJkry7YJ4ybkXGrGcYsu7fm7qZK8dvbS5k6qpw/explorer.png" },
      { id: 3, name: "水晶法师", price: "1200", image: "https://ipfs.io/ipfs/QmZ4tj7MQJkry7YJ4ybkXGrGcYsu7fm7qZK8dvbS5k6qpw/mage.png" },
      { id: 4, name: "龙骑士", price: "2000", image: "https://ipfs.io/ipfs/QmZ4tj7MQJkry7YJ4ybkXGrGcYsu7fm7qZK8dvbS5k6qpw/dragonknight.png" },
      { id: 5, name: "时空猎手", price: "1800", image: "https://ipfs.io/ipfs/QmZ4tj7MQJkry7YJ4ybkXGrGcYsu7fm7qZK8dvbS5k6qpw/hunter.png" }
    ]);
    
    // 加载示例虚拟空间数据
    setVirtualSpaces([
      { id: 1, name: "水晶宫殿", type: "展厅", size: "大型", image: "https://ipfs.io/ipfs/QmZ4tj7MQJkry7YJ4ybkXGrGcYsu7fm7qZK8dvbS5k6qpw/palace.png" },
      { id: 2, name: "未来城市", type: "社交", size: "中型", image: "https://ipfs.io/ipfs/QmZ4tj7MQJkry7YJ4ybkXGrGcYsu7fm7qZK8dvbS5k6qpw/city.png" },
      { id: 3, name: "星际基地", type: "游戏", size: "大型", image: "https://ipfs.io/ipfs/QmZ4tj7MQJkry7YJ4ybkXGrGcYsu7fm7qZK8dvbS5k6qpw/base.png" },
      { id: 4, name: "魔法森林", type: "展厅", size: "中型", image: "https://ipfs.io/ipfs/QmZ4tj7MQJkry7YJ4ybkXGrGcYsu7fm7qZK8dvbS5k6qpw/forest.png" }
    ]);
    
    // 加载示例应用数据
    setApps([
      { id: 1, name: "AlveySwap", category: "DeFi", description: "去中心化交易所", icon: "🔄", type: "simulated" },
      { id: 2, name: "AlveyLend", category: "DeFi", description: "NFT抵押借贷", icon: "💰", type: "dapp" },
      { id: 3, name: "AlveyLendV2", category: "DeFi", description: "升级版NFT抵押借贷", icon: "💎", type: "dapp" },
      { id: 4, name: "元宇宙游戏", category: "游戏", description: "3D NFT游戏世界", icon: "🎮", type: "simulated" },
      { id: 5, name: "AI创作助手", category: "工具", description: "AI辅助NFT创作", icon: "🎨", type: "simulated" },
      { id: 6, name: "NFT市场分析", category: "分析", description: "市场趋势和价格预测", icon: "📊", type: "simulated" },
      { id: 7, name: "多人虚拟世界", category: "社交", description: "与朋友共享虚拟空间", icon: "👥", type: "simulated" },
      { id: 8, name: "NFT拍卖工具", category: "工具", description: "创建高级NFT拍卖", icon: "🔨", type: "simulated" },
      { id: 9, name: "AlveyDAO", category: "治理", description: "链上治理系统", icon: "🏛️", type: "simulated" }
    ]);
    
    // 添加示例交易记录
    if (demoModeEnabled && txHistory.length === 0) {
      setTxHistory([
        {
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          status: 'confirmed',
          timestamp: Date.now() - 3600000, // 1小时前
          type: 'mint'
        },
        {
          hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          status: 'confirmed',
          timestamp: Date.now() - 7200000, // 2小时前
          type: 'stake'
        },
        {
          hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
          status: 'confirmed',
          timestamp: Date.now() - 86400000, // 1天前
          type: 'mint'
        }
      ]);
    }
  };

  const loadUserNFTs = async () => {
    if (account && (contract || demoModeEnabled)) {
      try {
        // 实际项目中应该从合约获取用户NFT
        // 这里使用示例数据
        if (showDemoContent) {
          setOwnedNFTs([
            { id: 101, name: "我的骑士", image: "https://ipfs.io/ipfs/QmZ4tj7MQJkry7YJ4ybkXGrGcYsu7fm7qZK8dvbS5k6qpw/knight.png" },
            { id: 102, name: "我的法师", image: "https://ipfs.io/ipfs/QmZ4tj7MQJkry7YJ4ybkXGrGcYsu7fm7qZK8dvbS5k6qpw/mage.png" },
            { id: 103, name: "我的猎人", image: "https://ipfs.io/ipfs/QmZ4tj7MQJkry7YJ4ybkXGrGcYsu7fm7qZK8dvbS5k6qpw/hunter.png" }
          ]);
          
          // 在演示模式下添加模拟质押记录
          if (demoModeEnabled && userStakes.length === 0) {
            setUserStakes([101, 103]);
          }
        }
      } catch (err) {
        console.error("获取用户NFT失败:", err);
      }
    }
  };

  const checkMobileWallet = () => {
    if (window.ethereum) {
      if (window.ethereum.isMetaMask) {
        setNotification('');
      } else {
        setNotification('推荐使用MetaMask移动端钱包');
      }
    } else {
      setNotification('请安装移动端加密钱包');
    }
  };

  const updateBalanceAndPrice = async () => {
    try {
      const balance = await tokenContract.balanceOf(account);
      setTokenBalance(ethers.formatUnits(balance, 18));
      
      const price = await contract.mintPrice();
      setMintPrice(ethers.formatUnits(price, 18));
    } catch (err) {
      console.error("获取余额和价格失败:", err);
    }
  };

  const initializeEthers = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        const nftContract = new ethers.Contract(contractAddress, contractABI, provider);
        setContract(nftContract);

        const erc20TokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
        setTokenContract(erc20TokenContract);

        const nftStakingContract = new ethers.Contract(stakingContractAddress, stakingABI, provider);
        setStakingContract(nftStakingContract);
        
        // 初始化AlveyLend合约实例
        if (alveyLendContractAddress !== "0xYOUR_ALVEYLEND_CONTRACT_ADDRESS_HERE") {
          const lendContract = new ethers.Contract(alveyLendContractAddress, NFTLendingABI.abi, provider);
          setAlveyLendContract(lendContract);
        } else {
          console.warn("AlveyLend 合约地址未设置，相关功能将不可用。");
        }
        
        // 初始化AlveyLendV2合约实例
        if (alveyLendV2ContractAddress !== "0xYOUR_ALVEYLENDV2_CONTRACT_ADDRESS_HERE") {
          const lendV2Contract = new ethers.Contract(alveyLendV2ContractAddress, NFTLendingV2ABI.abi, provider);
          setAlveyLendV2Contract(lendV2Contract);
        } else {
          console.warn("AlveyLendV2 合约地址未设置，相关功能将使用模拟合约。");
          // 创建模拟合约以便演示
          setAlveyLendV2Contract(alveyLendContract);
        }

        const handleChainChanged = (newChainId) => {
          setChainId(newChainId);
          if (newChainId !== '0xED5') { // AlveyChain主网chainId
            setNotification('请切换到AlveyChain主网');
          } else {
            setNotification('');
          }
        };

        provider.on('chainChanged', handleChainChanged);
        // 获取初始chainID
        const network = await provider.getNetwork();
        handleChainChanged('0x' + network.chainId.toString(16));

      } catch (err) {
        console.error("初始化错误:", err);
        setError("初始化Web3失败");
      }
    } else {
      setError("请安装移动端加密钱包!");
    }
  };

  const connectWallet = async () => {
    try {
      if (demoModeEnabled) {
        // 如果启用了演示模式，不需要真正连接钱包
        setAccount('0xdEm0...1234');
        setShowDemoContent(true);
        return;
      }
      
      if (!provider) {
        setError("Web3未初始化");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      setAccount(accounts[0]);
      setError('');
      
      // 演示目的，连接钱包后自动开启演示内容
      setShowDemoContent(true);
    } catch (err) {
      console.error("连接钱包错误:", err);
      setError("连接钱包失败");
    }
  };

  const toggleDemoMode = () => {
    setDemoModeEnabled(!demoModeEnabled);
    if (!demoModeEnabled) {
      // 当启用演示模式时，自动设置演示数据
      setTokenBalance('1000');
      setMintPrice('10');
      setShowDemoContent(true);
      // 设置一个模拟交易状态
      setTransactionStatus({
        status: 'confirmed', 
        hash: '0xdemo123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 
        timestamp: Date.now()
      });
      // 自动连接一些应用
      setConnectedApps([apps.find(app=>app.id===1)?.id, apps.find(app=>app.id===3)?.id, apps.find(app=>app.id===5)?.id].filter(Boolean));
    } else {
      // 关闭演示模式时，重置数据
      if (!account) {
        setShowDemoContent(false);
        setTransactionStatus({status: '', hash: '', timestamp: 0});
        setTxHistory([]);
        setConnectedApps([]); // 重置已连接应用
      }
    }
  };

  const mintNFT = async (e) => {
    e.preventDefault();
    if (!tokenURI) {
      setError("请输入NFT的URI");
      return;
    }

    setMinting(true);
    setError('');

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const tokenContractWithSigner = tokenContract.connect(signer);

      // 获取铸造价格
      const price = await contract.mintPrice();

      // 设置交易状态为处理中
      setTransactionStatus({
        status: 'pending', 
        hash: '', 
        timestamp: Date.now()
      });

      // 检查代币授权
      const allowance = await tokenContract.allowance(account, contractAddress);
      if (allowance < price) {
        const approveTx = await tokenContractWithSigner.approve(contractAddress, price);
        await approveTx.wait();
      }

      // 铸造NFT
      const tx = await contractWithSigner.safeMint(account, tokenURI);
      
      // 更新交易状态
      setTransactionStatus({
        status: 'processing',
        hash: tx.hash,
        timestamp: Date.now()
      });
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setTransactionStatus({
          status: 'confirmed', 
          hash: tx.hash, 
          timestamp: Date.now()
        });
        
        setTxHistory(prev => [...prev, {
          hash: tx.hash,
          status: 'confirmed',
          timestamp: Date.now(),
          type: 'mint'
        }]);
        
        // 演示目的，成功后显示示例NFT
        setShowDemoContent(true);
        loadUserNFTs();
      }

      setTokenURI('');
    } catch (err) {
      console.error("铸造错误:", err);
      setError("铸造NFT失败");
      setTransactionStatus({
        status: 'failed', 
        hash: '', 
        timestamp: Date.now()
      });
    } finally {
      setMinting(false);
    }
  };

  const handleStake = async (e) => {
    e.preventDefault();
    if (!stakeTokenId) {
      setError("请输入要质押的NFT Token ID");
      return;
    }
    
    setStakingLoading(true);
    try {
      const signer = await provider.getSigner();
      const contractWithSigner = stakingContract.connect(signer);
      
      setTransactionStatus({
        status: 'pending', 
        hash: '', 
        timestamp: Date.now()
      });
      
      const tx = await contractWithSigner.stake(stakeTokenId);
      
      setTransactionStatus({
        status: 'processing',
        hash: tx.hash,
        timestamp: Date.now()
      });
      
      await tx.wait();
      
      setTransactionStatus({
        status: 'confirmed', 
        hash: tx.hash, 
        timestamp: Date.now()
      });
      
      setStakeTokenId('');
      updateStakes();
    } catch (err) {
      console.error("质押操作失败:", err);
      setError("质押操作失败");
      setTransactionStatus({
        status: 'failed', 
        hash: '', 
        timestamp: Date.now()
      });
    } finally {
      setStakingLoading(false);
    }
  };

  const updateStakes = async () => {
    if (account && stakingContract) {
      try {
        const stakedTokens = await stakingContract.getStakedTokens(account);
        setUserStakes(stakedTokens || []);
      } catch (err) {
        console.error("获取质押记录失败:", err);
      }
    }
  };

  const toggleDemoContent = () => {
    setShowDemoContent(!showDemoContent);
  };

  const connectToApp = (app) => {
    if (app.type === 'dapp') {
      if (app.name === "AlveyLend") {
        if (alveyLendContractAddress === "0xYOUR_ALVEYLEND_CONTRACT_ADDRESS_HERE" && !demoModeEnabled) {
          setError("AlveyLend 合约地址未配置，无法打开DApp。");
          return;
        }
        setActiveDApp('AlveyLend');
        setActiveTab('apphub');
      } else if (app.name === "AlveyLendV2") {
        if (alveyLendV2ContractAddress === "0xYOUR_ALVEYLENDV2_CONTRACT_ADDRESS_HERE" && !demoModeEnabled) {
          // 使用演示模式或模拟合约
          setIsV2Enabled(true);
        }
        setActiveDApp('AlveyLendV2');
        setActiveTab('apphub');
      }
    } else {
      setConnectingApp(app.id);
      setTimeout(() => {
        if (connectedApps.includes(app.id)) {
          setConnectedApps(connectedApps.filter(id => id !== app.id));
        } else {
          setConnectedApps([...connectedApps, app.id]);
        }
        setConnectingApp(null);
      }, 1500);
    }
  };

  const exitDAppView = () => {
    setActiveDApp(null);
  };

  const renderNavigation = () => {
    return (
      <div className="navigation">
        <div 
          className={`nav-item ${activeTab === 'basic' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('basic'); setActiveDApp(null); setActiveSpace(null); }}
        >
          基础功能
        </div>
        <div 
          className={`nav-item ${activeTab === 'marketplace' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('marketplace'); setActiveDApp(null); setActiveSpace(null);}}
        >
          NFT市场
        </div>
        <div 
          className={`nav-item ${activeTab === 'spaces' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('spaces'); setActiveDApp(null); }}
        >
          虚拟空间
        </div>
        <div 
          className={`nav-item ${activeTab === 'apphub' ? 'active' : ''}`} 
          onClick={() => { setActiveTab('apphub'); setActiveDApp(null); setActiveSpace(null);}}
        >
          应用中心
        </div>
      </div>
    );
  };

  const renderBasicContent = () => {
    return (
      <div className="content-wrapper">
        <div className="mint-section">
          <h2>NFT铸造</h2>
          <form className="mint-form" onSubmit={mintNFT}>
            <input
              type="text"
              className="uri-input"
              placeholder="输入NFT的URI (https://)"
              value={tokenURI}
              onChange={async (e) => {
                setTokenURI(e.target.value);
                try {
                  if (e.target.value.startsWith('http')) {
                    const response = await fetch(e.target.value);
                    const data = await response.json();
                    setMetadata(data);
                  }
                } catch (err) {
                  setMetadata(null);
                }
              }}
            />
            <div className="sample-uri">
              <small>示例URI: <span onClick={() => setTokenURI('/demo-data/sample-nft.json')}>/demo-data/sample-nft.json</span></small>
            </div>
            {metadata && (
              <div className="metadata-preview">
                <h3>元数据预览</h3>
                {metadata.image && 
                  <img 
                    src={metadata.image} 
                    alt="NFT预览" 
                    className="preview-image" 
                  />
                }
                <pre>{JSON.stringify(metadata, null, 2)}</pre>
              </div>
            )}
            <button
              className="mint-button"
              type="submit"
              disabled={minting}
            >
              {minting ? "铸造中..." : "铸造NFT"}
            </button>
          </form>
        </div>
        
        <div className="stake-section">
          <h2>NFT质押</h2>
          <form onSubmit={handleStake}>
            <input
              type="number"
              placeholder="输入质押NFT的Token ID"
              value={stakeTokenId}
              onChange={(e) => setStakeTokenId(e.target.value)}
            />
            <button type="submit" disabled={stakingLoading}>
              {stakingLoading ? '处理中...' : '质押NFT'}
            </button>
          </form>

          <h3>我的质押记录</h3>
          <div className="stakes-list">
            {userStakes.length > 0 ? (
              userStakes.map((tokenId, index) => (
                <div key={index} className="stake-item">
                  <p>Token ID: {tokenId.toString()}</p>
                </div>
              ))
            ) : (
              <p>暂无质押记录</p>
            )}
          </div>
        </div>
        
        {/* 我的NFT展示区域 */}
        <div className="my-nfts-section">
          <h2>我的NFT</h2>
          {ownedNFTs.length > 0 ? (
            <div className="owned-nfts-grid">
              {ownedNFTs.map(nft => (
                <div key={nft.id} className="owned-nft-item">
                  <img src={nft.image} alt={nft.name} />
                  <div className="nft-details">
                    <h3>{nft.name}</h3>
                    <p>ID: {nft.id}</p>
                    <div className="nft-actions">
                      <button 
                        className="stake-button"
                        onClick={() => setStakeTokenId(nft.id)}
                      >
                        质押
                      </button>
                      <button className="view-button">查看</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-nfts">
              <p>您还没有NFT，请铸造一个或从市场购买</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMarketplace = () => {
    return (
      <div className="marketplace-wrapper">
        <h2>NFT市场</h2>
        <div className="marketplace-filters">
          <select><option>全部分类</option></select>
          <select><option>价格: 全部</option></select>
          <input type="text" placeholder="搜索NFT..." />
        </div>
        {showDemoContent || demoModeEnabled ? (
          <div className="marketplace-items">
            {marketplaceNFTs.map(nft => (
              <div key={nft.id} className="marketplace-item">
                <img src={nft.image} alt={nft.name} />
                <h3>{nft.name}</h3>
                <p className="price">{nft.price} MARIO</p>
                <button className="buy-button">购买</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-content">
            <p>请连接钱包查看市场内容</p>
          </div>
        )}
      </div>
    );
  };

  const enterVirtualSpace = (spaceId) => {
    setEnteringSpace(true);
    
    // 模拟进入空间的过程
    setTimeout(() => {
      setActiveSpace(spaceId);
      setEnteringSpace(false);
    }, 2000);
  };

  const exitVirtualSpace = () => {
    setActiveSpace(null);
  };

  const renderVirtualSpaces = () => {
    // 如果已进入某个虚拟空间，显示该空间的详细内容
    if (activeSpace) {
      const space = virtualSpaces.find(s => s.id === activeSpace);
      
      return (
        <div className="space-detail-wrapper">
          <div className="space-detail-header">
            <button className="back-button" onClick={exitVirtualSpace}>
              ← 返回空间列表
            </button>
            <h2>{space.name}</h2>
            <span className="space-type-badge">{space.type}</span>
          </div>
          
          <div className="space-content">
            <div className="space-preview">
              <img src={space.image} alt={space.name} className="space-full-image" />
              <div className="space-3d-controls">
                <button className="vr-button">进入VR模式</button>
                <button className="ar-button">AR预览</button>
                <button className="rotate-button">旋转查看</button>
              </div>
            </div>
            
            <div className="space-info">
              <div className="info-section">
                <h3>空间信息</h3>
                <p><strong>类型:</strong> {space.type}</p>
                <p><strong>大小:</strong> {space.size}</p>
                <p><strong>创建时间:</strong> 2023-11-16</p>
                <p><strong>上次访问:</strong> 今天</p>
              </div>
              
              <div className="info-section">
                <h3>访客</h3>
                <p>当前在线: 3人</p>
                <div className="visitor-avatars">
                  <span className="avatar">👤</span>
                  <span className="avatar">👤</span>
                  <span className="avatar">👤</span>
                </div>
              </div>
              
              <div className="space-actions">
                <button className="invite-button">邀请好友</button>
                <button className="edit-button">编辑空间</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // 否则显示空间列表
    return (
      <div className="spaces-wrapper">
        <h2>虚拟空间</h2>
        <div className="spaces-controls">
          <div className="tabs">
            <span className="active">我的空间</span>
            <span>探索空间</span>
            <span>创建空间</span>
          </div>
        </div>
        {showDemoContent || demoModeEnabled ? (
          <div className="spaces-items">
            {virtualSpaces.map(space => (
              <div key={space.id} className="space-item">
                <img src={space.image} alt={space.name} />
                <h3>{space.name}</h3>
                <div className="space-details">
                  <span className="space-type">{space.type}</span>
                  <span className="space-size">{space.size}</span>
                </div>
                <button 
                  className="enter-button"
                  onClick={() => enterVirtualSpace(space.id)}
                  disabled={enteringSpace}
                >
                  {enteringSpace ? '进入中...' : '进入空间'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-content">
            <p>请连接钱包查看虚拟空间</p>
          </div>
        )}
      </div>
    );
  };

  const renderAppHub = () => {
    if (activeDApp === 'AlveyLend') {
      return <AlveyLendPage onExit={exitDAppView} alveyLendContract={alveyLendContract} provider={provider} account={account} mainNftContract={contract} />;
    } else if (activeDApp === 'AlveyLendV2') {
      return <AlveyLendPageV2 onExit={exitDAppView} alveyLendContract={alveyLendV2Contract} provider={provider} account={account} mainNftContract={contract} />;
    }
    return (
      <div className="apphub-wrapper">
        <h2>应用中心</h2>
        <div className="app-categories">
          <span className={!apps.find(app => app.category === 'DeFi') ? "active" : ""} onClick={() => { /* filter logic */ }}>全部</span>
          <span className={apps.find(app => app.category === 'DeFi') ? "active" : ""} onClick={() => { /* filter logic */ }}>DeFi</span>
          <span className={apps.find(app => app.category === '游戏') ? "active" : ""} onClick={() => { /* filter logic */ }}>游戏</span>
          <span className={apps.find(app => app.category === '社交') ? "active" : ""} onClick={() => { /* filter logic */ }}>社交</span>
          <span className={apps.find(app => app.category === '工具') ? "active" : ""} onClick={() => { /* filter logic */ }}>工具</span>
        </div>
        {showDemoContent || demoModeEnabled ? (
          <div className="app-items">
            {apps.map(app => (
              <div key={app.id} className="app-item">
                <div className="app-icon">{app.icon}</div>
                <h3>{app.name}</h3>
                <p className="app-category">{app.category}</p>
                <p className="app-description">{app.description}</p>
                <button 
                  className={`connect-app-button ${connectedApps.includes(app.id) && app.type === 'simulated' ? 'connected' : ''} ${app.type === 'dapp' ? 'dapp-button' : ''}`}
                  onClick={() => connectToApp(app)}
                  disabled={connectingApp === app.id && app.type === 'simulated'}
                >
                  {app.type === 'dapp' ? '打开DApp' :
                    (connectingApp === app.id ? 
                    '连接中...' : 
                    connectedApps.includes(app.id) ? '已连接' : '连接应用')}
                </button>
                {connectedApps.includes(app.id) && app.type ==='simulated' && (
                  <div className="app-connected-info">
                    <span className="connected-dot"></span>
                    <span>已连接到您的账户</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-content">
            <p>请连接钱包查看应用中心</p>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (activeDApp === 'AlveyLend' || activeDApp === 'AlveyLendV2') {
      return null;
    }
    switch (activeTab) {
      case 'marketplace':
        return renderMarketplace();
      case 'spaces':
        return renderVirtualSpaces();
      case 'apphub':
        return renderAppHub();
      default:
        return renderBasicContent();
    }
  };

  useEffect(() => {
    if (stakingContract && account) {
      updateStakes();
    }
  }, [stakingContract, account]);

  return (
    <div className="app">
      <h1>Alvey NFT铸造与质押</h1>
      
      {notification && <div className="notification">{notification}</div>}
      
      {error && <div className="error">{error}</div>}
      
      {!account ? (
        <div className="welcome-screen">
          <p className="welcome-text">欢迎来到AlveyChain NFT系统</p>
          <button className="connect-button" onClick={connectWallet}>
            连接钱包
          </button>
          <button className="demo-button" onClick={toggleDemoContent}>
            {showDemoContent ? "隐藏演示内容" : "显示演示内容"}
          </button>
          <div className="demo-mode-toggle">
            <label>
              <input 
                type="checkbox" 
                checked={demoModeEnabled} 
                onChange={toggleDemoMode} 
              />
              启用演示模式（无需真实连接钱包）
            </label>
          </div>
        </div>
      ) : (
        <>
          <div className="account-info">
            <p>当前账户: {account}</p>
            <div className="balance">代币余额: {tokenBalance}</div>
            <div className="price">铸造价格: {mintPrice}</div>
          </div>
          
          {renderNavigation()}
          
          {renderContent()}
          
          {!activeDApp && (
            <div className="transaction-status-wrapper">
              <h2>交易状态</h2>
              {transactionStatus.status && (
                <div className={`transaction-status ${transactionStatus.status}`}>
                  <div className="status-info">
                    <p>状态: {
                      transactionStatus.status === 'pending' ? '等待确认' :
                      transactionStatus.status === 'processing' ? '处理中' :
                      transactionStatus.status === 'confirmed' ? '交易成功' :
                      '交易失败'
                    }</p>
                    {transactionStatus.hash && (
                      <p>交易哈希: {transactionStatus.hash.slice(0,6)}...{transactionStatus.hash.slice(-4)}</p>
                    )}
                  </div>
                </div>
              )}
              
              {txHistory.length > 0 && (
                <div className="tx-history">
                  <h3>历史记录</h3>
                  {txHistory.map((tx, i) => (
                    <div key={i} className="tx-item">
                      <span className={`status-dot ${tx.status}`}></span>
                      <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                      <span>{tx.type === 'mint' ? '铸造NFT' : '其他操作'}</span>
                      <a 
                        href={`https://alveyscan.io/tx/${tx.hash}`} 
                        target="_blank" 
                        rel="noreferrer"
                      >
                        查看详情
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
