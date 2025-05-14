// 导入配置
import { CHAIN_CONFIG, CONTRACT_ADDRESSES, APP_CONFIG } from './config.js';

// 状态变量
let provider, signer, currentAccount;
let nftContract, paymentToken, stakingContract;

// ABI - 简化版，实际使用时需完整ABI
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

const NFT_ABI = [
  "function safeMint(address to, string memory uri) public",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function setApprovalForAll(address operator, bool approved)",
  "function mintPrice() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

const STAKING_ABI = [
  "function stake(uint256 tokenId) external",
  "function unstake(uint256 tokenId) external",
  "function getStakedTokens(address owner) view returns (uint256[])",
  "function getRewards(address owner) view returns (uint256)",
  "function claimRewards() external returns (uint256)",
  "function totalStaked() view returns (uint256)"
];

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  checkIfWalletIsConnected();
});

// 设置事件监听器
function setupEventListeners() {
  // 钱包连接
  document.getElementById('connectWallet').addEventListener('click', connectWallet);
  
  // 切换网络
  document.getElementById('switchNetwork').addEventListener('click', switchToAlveyChain);
  
  // 铸造相关
  document.getElementById('approveBtn').addEventListener('click', approveTokens);
  document.getElementById('mintBtn').addEventListener('click', mintNFT);
}

// 检查钱包连接状态
async function checkIfWalletIsConnected() {
  try {
    // 检查是否有 MetaMask 安装
    if (window.ethereum) {
      // 设置 ethers provider
      provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // 检查网络
      const network = await provider.getNetwork();
      updateNetworkInfo(network);
      
      // 监听账户变化
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
      
      // 检查是否已经授权
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        handleAccountsChanged(accounts);
      }
    } else {
      showNotification('未检测到 MetaMask。请安装 MetaMask 钱包后继续。', 'warning');
    }
  } catch (error) {
    console.error("钱包连接检查出错:", error);
  }
}

// 连接钱包
async function connectWallet() {
  try {
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    currentAccount = await signer.getAddress();
    
    showWalletInfo();
    initializeContracts();
    loadUserData();
    
    showNotification('钱包连接成功！', 'success');
  } catch (error) {
    console.error("连接钱包失败:", error);
    showNotification('连接钱包失败，请重试。', 'error');
  }
}

// 处理账户变化
async function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    currentAccount = null;
    hideWalletInfo();
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    signer = provider.getSigner();
    showWalletInfo();
    initializeContracts();
    loadUserData();
  }
}

// 显示钱包信息
async function showWalletInfo() {
  const addressElem = document.getElementById('walletAddress');
  const balanceElem = document.getElementById('walletBalance');
  const walletInfoElem = document.getElementById('walletInfo');
  
  // 显示地址
  addressElem.textContent = formatAddress(currentAccount);
  
  // 显示余额
  const balance = await provider.getBalance(currentAccount);
  balanceElem.textContent = `${parseFloat(ethers.utils.formatEther(balance)).toFixed(4)} ALV`;
  
  // 显示信息区
  walletInfoElem.style.display = 'inline';
  
  // 隐藏连接按钮
  document.getElementById('connectWallet').style.display = 'none';
}

// 隐藏钱包信息
function hideWalletInfo() {
  document.getElementById('walletInfo').style.display = 'none';
  document.getElementById('connectWallet').style.display = 'inline-block';
}

// 初始化合约
function initializeContracts() {
  paymentToken = new ethers.Contract(CONTRACT_ADDRESSES.paymentToken, ERC20_ABI, signer);
  nftContract = new ethers.Contract(CONTRACT_ADDRESSES.nftContract, NFT_ABI, signer);
  stakingContract = new ethers.Contract(CONTRACT_ADDRESSES.stakingContract, STAKING_ABI, signer);
  
  loadContractData();
}

// 加载合约数据
async function loadContractData() {
  try {
    // 获取铸造价格
    const mintPrice = await nftContract.mintPrice();
    document.getElementById('mintPrice').textContent = ethers.utils.formatEther(mintPrice);
    
    // 检查代币授权
    const allowance = await paymentToken.allowance(currentAccount, CONTRACT_ADDRESSES.nftContract);
    if (allowance.gte(mintPrice)) {
      document.getElementById('approveBtn').textContent = '已授权';
      document.getElementById('approveBtn').disabled = true;
      document.getElementById('mintBtn').disabled = false;
    }
  } catch (error) {
    console.error("加载合约数据失败:", error);
  }
}

// 加载用户数据
async function loadUserData() {
  try {
    loadUserNFTs();
    loadStakingInfo();
  } catch (error) {
    console.error("加载用户数据失败:", error);
  }
}

// 加载用户 NFT
async function loadUserNFTs() {
  try {
    const gallery = document.getElementById('nftGallery');
    gallery.innerHTML = '';
    
    const balance = await nftContract.balanceOf(currentAccount);
    
    if (balance.eq(0)) {
      gallery.innerHTML = '<div class="col-12 text-center"><p>您还没有 NFT，立即铸造一个吧！</p></div>';
      return;
    }
    
    for (let i = 0; i < balance; i++) {
      const tokenId = await nftContract.tokenOfOwnerByIndex(currentAccount, i);
      const tokenURI = await nftContract.tokenURI(tokenId);
      
      // 创建 NFT 卡片
      const cardHtml = `
        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="nft-preview">NFT #${tokenId}</div>
            <div class="card-body">
              <h5 class="card-title">NFT #${tokenId}</h5>
              <p class="card-text small">${tokenURI}</p>
              <button class="btn btn-sm btn-success stake-btn" data-token-id="${tokenId}">质押</button>
            </div>
          </div>
        </div>
      `;
      
      gallery.innerHTML += cardHtml;
    }
    
    // 添加质押按钮事件监听
    document.querySelectorAll('.stake-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        stakeNFT(btn.getAttribute('data-token-id'));
      });
    });
    
  } catch (error) {
    console.error("加载用户NFT失败:", error);
    document.getElementById('nftGallery').innerHTML = 
      '<div class="col-12 text-center"><p>加载NFT时出错，请刷新页面重试。</p></div>';
  }
}

// 加载质押信息
async function loadStakingInfo() {
  try {
    const stakingInfo = document.getElementById('stakingInfo');
    
    // 获取已质押的代币
    const stakedTokens = await stakingContract.getStakedTokens(currentAccount);
    
    // 获取可领取的奖励
    const rewards = await stakingContract.getRewards(currentAccount);
    
    if (stakedTokens.length === 0) {
      stakingInfo.innerHTML = '<p>您目前没有质押的 NFT</p>';
      return;
    }
    
    let infoHtml = `
      <div class="alert alert-info">
        <p><strong>已质押数量:</strong> ${stakedTokens.length} 个 NFT</p>
        <p><strong>可领取奖励:</strong> ${ethers.utils.formatEther(rewards)} MARIO</p>
      </div>
      <div class="row">
    `;
    
    for (let i = 0; i < stakedTokens.length; i++) {
      infoHtml += `
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">已质押 NFT #${stakedTokens[i]}</h5>
              <button class="btn btn-sm btn-warning unstake-btn" data-token-id="${stakedTokens[i]}">
                取消质押
              </button>
            </div>
          </div>
        </div>
      `;
    }
    
    infoHtml += `</div>`;
    
    if (rewards.gt(0)) {
      infoHtml += `
        <div class="mt-3">
          <button id="claimRewardsBtn" class="btn btn-info">领取 ${ethers.utils.formatEther(rewards)} MARIO 奖励</button>
        </div>
      `;
    }
    
    stakingInfo.innerHTML = infoHtml;
    
    // 添加事件监听
    document.querySelectorAll('.unstake-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        unstakeNFT(btn.getAttribute('data-token-id'));
      });
    });
    
    const claimBtn = document.getElementById('claimRewardsBtn');
    if (claimBtn) {
      claimBtn.addEventListener('click', claimRewards);
    }
    
  } catch (error) {
    console.error("加载质押信息失败:", error);
    document.getElementById('stakingInfo').innerHTML = 
      '<p>加载质押信息时出错，请刷新页面重试。</p>';
  }
}

// 授权代币
async function approveTokens() {
  try {
    const mintPrice = await nftContract.mintPrice();
    const approveBtn = document.getElementById('approveBtn');
    
    approveBtn.disabled = true;
    approveBtn.textContent = '授权中...';
    
    const tx = await paymentToken.approve(CONTRACT_ADDRESSES.nftContract, mintPrice);
    showNotification('授权交易已提交，等待确认...', 'info');
    
    await tx.wait();
    
    approveBtn.textContent = '已授权';
    document.getElementById('mintBtn').disabled = false;
    
    showNotification('代币授权成功！', 'success');
  } catch (error) {
    console.error("授权代币失败:", error);
    document.getElementById('approveBtn').disabled = false;
    document.getElementById('approveBtn').textContent = '授权代币';
    showNotification('授权失败，请重试。', 'error');
  }
}

// 铸造NFT
async function mintNFT() {
  try {
    const nftURI = document.getElementById('nftURI').value;
    if (!nftURI) {
      showNotification('请输入有效的 NFT URI', 'warning');
      return;
    }
    
    const mintBtn = document.getElementById('mintBtn');
    mintBtn.disabled = true;
    mintBtn.textContent = '铸造中...';
    
    const mintStatus = document.getElementById('mintStatus');
    const mintStatusText = document.getElementById('mintStatusText');
    mintStatus.style.display = 'block';
    mintStatusText.textContent = '交易正在处理中...';
    
    const tx = await nftContract.safeMint(currentAccount, nftURI);
    showNotification('铸造交易已提交，等待确认...', 'info');
    
    const receipt = await tx.wait();
    
    // 尝试从事件中获取铸造的tokenId
    let tokenId = null;
    for (const event of receipt.events) {
      if (event.event === 'Transfer') {
        tokenId = event.args[2].toString();
        break;
      }
    }
    
    mintBtn.textContent = '铸造NFT';
    mintBtn.disabled = false;
    mintStatus.style.display = 'none';
    
    showNotification('NFT铸造成功！', 'success');
    
    // 重新加载用户NFT
    loadUserNFTs();
    
  } catch (error) {
    console.error("铸造NFT失败:", error);
    document.getElementById('mintBtn').disabled = false;
    document.getElementById('mintBtn').textContent = '铸造NFT';
    document.getElementById('mintStatus').style.display = 'none';
    showNotification('铸造失败，请重试。', 'error');
  }
}

// 质押NFT
async function stakeNFT(tokenId) {
  try {
    // 首先检查是否已授权
    const isApproved = await nftContract.isApprovedForAll(currentAccount, CONTRACT_ADDRESSES.stakingContract);
    
    if (!isApproved) {
      showNotification('质押前需要先授权NFT合约...', 'info');
      const approveTx = await nftContract.setApprovalForAll(CONTRACT_ADDRESSES.stakingContract, true);
      await approveTx.wait();
    }
    
    showNotification('正在质押NFT...', 'info');
    const tx = await stakingContract.stake(tokenId);
    await tx.wait();
    
    showNotification(`NFT #${tokenId} 质押成功！`, 'success');
    
    // 重新加载NFT和质押信息
    loadUserNFTs();
    loadStakingInfo();
  } catch (error) {
    console.error(`质押NFT #${tokenId} 失败:`, error);
    showNotification('质押NFT失败，请重试。', 'error');
  }
}

// 取消质押NFT
async function unstakeNFT(tokenId) {
  try {
    showNotification('正在取消质押NFT...', 'info');
    const tx = await stakingContract.unstake(tokenId);
    await tx.wait();
    
    showNotification(`NFT #${tokenId} 已取消质押！`, 'success');
    
    // 重新加载NFT和质押信息
    loadUserNFTs();
    loadStakingInfo();
  } catch (error) {
    console.error(`取消质押NFT #${tokenId} 失败:`, error);
    showNotification('取消质押失败，请重试。', 'error');
  }
}

// 领取奖励
async function claimRewards() {
  try {
    showNotification('正在领取质押奖励...', 'info');
    const tx = await stakingContract.claimRewards();
    await tx.wait();
    
    showNotification('质押奖励领取成功！', 'success');
    
    // 重新加载质押信息
    loadStakingInfo();
  } catch (error) {
    console.error("领取奖励失败:", error);
    showNotification('领取奖励失败，请重试。', 'error');
  }
}

// 切换到AlveyChain网络
async function switchToAlveyChain() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${CHAIN_CONFIG.chainId.toString(16)}` }],
    });
  } catch (error) {
    // 如果错误码为4902，表示需要添加网络
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${CHAIN_CONFIG.chainId.toString(16)}`,
              chainName: CHAIN_CONFIG.chainName,
              nativeCurrency: CHAIN_CONFIG.nativeCurrency,
              rpcUrls: CHAIN_CONFIG.rpcUrls,
              blockExplorerUrls: CHAIN_CONFIG.blockExplorerUrls
            },
          ],
        });
      } catch (addError) {
        console.error("添加网络失败:", addError);
        showNotification('添加AlveyChain网络失败，请手动添加。', 'error');
      }
    } else {
      console.error("切换网络失败:", error);
      showNotification('切换网络失败，请重试。', 'error');
    }
  }
}

// 更新网络信息
function updateNetworkInfo(network) {
  const networkStatusElem = document.getElementById('currentNetwork');
  const switchNetworkBtn = document.getElementById('switchNetwork');
  
  if (network.chainId === CHAIN_CONFIG.chainId) {
    networkStatusElem.textContent = CHAIN_CONFIG.chainName;
    networkStatusElem.className = 'text-success';
    switchNetworkBtn.style.display = 'none';
  } else {
    networkStatusElem.textContent = `${network.name} (不是AlveyChain)`;
    networkStatusElem.className = 'text-danger';
    switchNetworkBtn.style.display = 'inline-block';
  }
}

// 辅助函数: 格式化地址
function formatAddress(address) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// 辅助函数: 显示通知
function showNotification(message, type) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = type;
  notification.style.display = 'block';
  
  setTimeout(() => {
    notification.style.display = 'none';
  }, 5000);
} 