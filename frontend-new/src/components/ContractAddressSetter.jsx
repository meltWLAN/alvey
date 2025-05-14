import React, { useState, useEffect } from 'react';
import { ENVIRONMENTS, setEnvironment } from '../utils/environment';

const ContractAddressSetter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [addresses, setAddresses] = useState({
    PAYMENT_TOKEN: '',
    NFT_CONTRACT: '',
    SPACE_CONTRACT: '',
    MARKET_CONTRACT: ''
  });

  // 从localStorage中加载已保存的合约地址
  useEffect(() => {
    const savedAddresses = localStorage.getItem('metaversex_local_addresses');
    if (savedAddresses) {
      try {
        setAddresses(JSON.parse(savedAddresses));
      } catch (e) {
        console.error('无法解析保存的合约地址', e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddresses(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // 保存合约地址到localStorage
    localStorage.setItem('metaversex_local_addresses', JSON.stringify(addresses));
    
    // 创建constants.local.js的内容
    const configContent = `// AlveyChain network settings
export const NETWORK = {
  chainId: '0xED5', // 3797 in decimal (AlveyChain)
  chainName: 'AlveyChain',
  nativeCurrency: {
    name: 'ALV',
    symbol: 'ALV',
    decimals: 18
  },
  rpcUrls: ['https://elves-core1.alvey.io/', 'https://elves-core2.alvey.io/', 'https://elves-core3.alvey.io/'],
  blockExplorerUrls: ['https://alveyscan.com/']
};

// Contract addresses updated manually
export const CONTRACT_ADDRESSES = {
  PAYMENT_TOKEN: '${addresses.PAYMENT_TOKEN}',
  NFT_CONTRACT: '${addresses.NFT_CONTRACT}',
  SPACE_CONTRACT: '${addresses.SPACE_CONTRACT}',
  MARKET_CONTRACT: '${addresses.MARKET_CONTRACT}'
};

// File upload limits
export const UPLOAD_LIMITS = {
  MODEL_SIZE_MB: 50,
  THUMBNAIL_SIZE_MB: 5
};

// Supported 3D model formats
export const SUPPORTED_FORMATS = [
  { value: 'glb', label: 'GLB', mime: 'model/gltf-binary' },
  { value: 'gltf', label: 'GLTF', mime: 'model/gltf+json' },
  { value: 'obj', label: 'OBJ', mime: 'model/obj' },
  { value: 'fbx', label: 'FBX', mime: 'application/octet-stream' }
];

// Space types and sizes mappings
export const SPACE_TYPES = {
  0: 'Gallery',
  1: 'Showroom',
  2: 'Game',
  3: 'Social'
};

export const SPACE_SIZES = {
  0: 'Small',
  1: 'Medium',
  2: 'Large'
};

// Default metadata for new NFTs
export const DEFAULT_NFT_METADATA = {
  name: '',
  description: '',
  modelURI: '',
  thumbnailURI: '',
  format: 'glb',
  vrCompatible: true,
  tags: [],
  createdAt: 0,
  updatedAt: 0,
  creator: ''
};`;

    // 使用Blob和URL创建一个临时下载链接
    const blob = new Blob([configContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'constants.local.js';
    document.body.appendChild(a);
    a.click();
    
    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // 切换到本地环境
    setEnvironment(ENVIRONMENTS.LOCAL);
    
    setIsOpen(false);
  };

  const handleCopyToClipboard = () => {
    const text = Object.entries(addresses)
      .map(([key, value]) => `${key}: "${value}"`)
      .join('\n');
    
    navigator.clipboard.writeText(text)
      .then(() => alert('合约地址已复制到剪贴板'))
      .catch(err => console.error('无法复制到剪贴板:', err));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg shadow-lg"
      >
        设置合约地址
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 max-w-2xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">设置AlveyChain测试环境合约地址</h2>
            <p className="text-sm mb-4">
              当您在AlveyChain部署合约后，请在此处输入合约地址。保存后系统将自动切换到本地测试环境。
            </p>

            {Object.keys(addresses).map((key) => (
              <div key={key} className="mb-4">
                <label className="block text-sm font-medium mb-1">{key}</label>
                <input
                  type="text"
                  name={key}
                  value={addresses[key]}
                  onChange={handleChange}
                  placeholder={`输入${key}地址...`}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            ))}

            <div className="flex justify-between mt-6">
              <button
                onClick={handleCopyToClipboard}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                复制到剪贴板
              </button>
              <div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded mr-2"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                  保存并应用
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContractAddressSetter; 