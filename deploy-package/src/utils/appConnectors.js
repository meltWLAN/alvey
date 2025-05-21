/**
 * 应用连接器系统
 * 用于管理第三方应用的集成、授权和数据交换
 */

import { ethers } from 'ethers';

// 基础连接器类
class AppConnector {
  constructor(appId, appName, appUrl) {
    this.appId = appId;
    this.appName = appName;
    this.appUrl = appUrl;
    this.connected = false;
    this.provider = null;
    this.account = null;
  }

  // 初始化连接器
  async initialize() {
    if (window.ethereum) {
      try {
        // v6 syntax: Create browser provider first, then wrap with ethers provider
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        this.provider = browserProvider;
        const accounts = await this.provider.listAccounts();
        if (accounts.length > 0) {
          this.account = accounts[0].address; // v6 returns objects with address property
          this.connected = true;
          return true;
        }
      } catch (error) {
        console.error(`初始化${this.appName}连接器失败:`, error);
      }
    }
    return false;
  }

  // 连接应用
  async connect() {
    try {
      if (!this.provider && window.ethereum) {
        // v6 syntax: Create browser provider
        this.provider = new ethers.BrowserProvider(window.ethereum);
      }
      
      if (this.provider) {
        await window.ethereum.request({ method: "eth_requestAccounts" }); // Direct request to window.ethereum
        const accounts = await this.provider.listAccounts();
        if (accounts.length > 0) {
          this.account = accounts[0].address; // v6 returns objects with address property
          this.connected = true;
          console.log(`已连接到${this.appName}`);
          return true;
        }
      }
    } catch (error) {
      console.error(`连接${this.appName}失败:`, error);
    }
    return false;
  }

  // 打开应用
  launch(params = {}) {
    const url = new URL(this.appUrl);
    
    // 添加参数
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });
    
    // 如果已连接，添加账户信息
    if (this.connected && this.account) {
      url.searchParams.append('account', this.account);
    }
    
    // 记录使用情况
    this.logUsage();
    
    // 打开应用
    window.open(url.toString(), '_blank');
  }

  // 记录使用情况
  logUsage() {
    // 这里可以添加使用统计逻辑
    console.log(`用户使用了${this.appName}`);
    
    // 实际项目中，应该发送到后端记录
    try {
      // localStorage记录最近使用的应用
      const recentApps = JSON.parse(localStorage.getItem('recentApps') || '[]');
      const newRecentApps = [
        this.appId,
        ...recentApps.filter(id => id !== this.appId)
      ].slice(0, 5);
      localStorage.setItem('recentApps', JSON.stringify(newRecentApps));
    } catch (e) {
      console.error('保存最近使用应用失败', e);
    }
  }
}

// DeFi应用连接器
class DeFiAppConnector extends AppConnector {
  constructor(appId, appName, appUrl, chainId = 3797) {
    super(appId, appName, appUrl);
    this.chainId = chainId;
  }

  // 检查网络匹配
  async checkNetwork() {
    if (!this.provider) await this.initialize();
    
    if (this.provider) {
      const network = await this.provider.getNetwork();
      return Number(network.chainId) === this.chainId; // v6 returns a bigint, convert to number
    }
    return false;
  }

  // 切换到正确的网络
  async switchNetwork() {
    if (!this.provider) await this.initialize();
    
    if (window.ethereum) {
      try {
        // Direct request to window.ethereum in v6
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${this.chainId.toString(16)}` }]
        });
        return true;
      } catch (error) {
        console.error(`切换到AlveyChain网络失败:`, error);
      }
    }
    return false;
  }

  // 重写launch方法，添加网络检查
  async launch(params = {}) {
    const networkMatches = await this.checkNetwork();
    
    if (!networkMatches) {
      const switched = await this.switchNetwork();
      if (!switched) {
        alert(`请将钱包网络切换到AlveyChain (Chain ID: ${this.chainId})`);
        return;
      }
    }
    
    super.launch(params);
  }
}

// NFT应用连接器
class NFTAppConnector extends AppConnector {
  constructor(appId, appName, appUrl, chainId = 3797) {
    super(appId, appName, appUrl);
    this.chainId = chainId;
  }

  // 推送NFT数据到应用
  async pushNFTData(tokenId, contractAddress) {
    if (!this.connected) await this.connect();
    
    if (this.connected) {
      const params = {
        tokenId,
        contractAddress,
        chainId: this.chainId
      };
      
      super.launch(params);
    }
  }
}

// 元宇宙应用连接器
class MetaverseAppConnector extends AppConnector {
  constructor(appId, appName, appUrl, chainId = 3797) {
    super(appId, appName, appUrl);
    this.chainId = chainId;
  }

  // 跳转到特定坐标
  launchToCoordinates(x, y, z) {
    const params = { position: `${x},${y},${z}` };
    super.launch(params);
  }
  
  // 导入NFT到元宇宙
  importNFT(tokenId, contractAddress) {
    const params = {
      action: 'import',
      tokenId,
      contractAddress
    };
    super.launch(params);
  }
}

// 创建应用连接器实例
const createConnector = (app) => {
  switch (app.category) {
    case 'defi':
    case 'exchange':
      return new DeFiAppConnector(app.id, app.name, app.url, 3797);
    
    case 'nft':
      return new NFTAppConnector(app.id, app.name, app.url, 3797);
    
    case 'metaverse':
    case 'gaming':
      return new MetaverseAppConnector(app.id, app.name, app.url, 3797);
    
    default:
      return new AppConnector(app.id, app.name, app.url);
  }
};

// 创建应用连接器
export const createConnector = (app) => {
  const connector = {
    // 基础信息
    id: app.id,
    name: app.name,
    url: app.url,
    
    // 连接方法
    connect: async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          return provider;
        } catch (error) {
          console.error(`Failed to connect to ${app.name}:`, error);
          throw error;
        }
      }
      throw new Error('MetaMask not installed');
    },

    // 启动应用
    launch: async () => {
      switch (app.integration) {
        case 'deep-link':
          window.open(app.url, '_blank');
          break;
          
        case 'iframe':
          // 在iframe中加载应用
          const iframe = document.createElement('iframe');
          iframe.src = app.url;
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.border = 'none';
          document.getElementById('app-container').appendChild(iframe);
          break;
          
        case 'api':
          // 通过API集成
          try {
            const response = await fetch(`${app.url}/api/connect`);
            const data = await response.json();
            return data;
          } catch (error) {
            console.error(`API integration failed for ${app.name}:`, error);
            throw error;
          }
          break;
          
        default:
          window.open(app.url, '_blank');
      }
    },

    // 获取应用状态
    getStatus: async () => {
      try {
        const response = await fetch(`${app.url}/api/status`);
        return await response.json();
      } catch (error) {
        console.error(`Failed to get status for ${app.name}:`, error);
        return null;
      }
    },

    // 获取用户数据
    getUserData: async (address) => {
      try {
        const response = await fetch(`${app.url}/api/user/${address}`);
        return await response.json();
      } catch (error) {
        console.error(`Failed to get user data for ${app.name}:`, error);
        return null;
      }
    }
  };

  return connector;
};

// 批量创建连接器
export const createConnectors = (apps) => {
  const connectors = {};
  apps.forEach(app => {
    connectors[app.id] = createConnector(app);
  });
  return connectors;
};

export { AppConnector, DeFiAppConnector, NFTAppConnector, MetaverseAppConnector, createConnector }; 