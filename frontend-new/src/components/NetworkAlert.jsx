import React, { useContext, useState, useEffect } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { NETWORK } from '../utils/environment';

const NetworkAlert = () => {
  const { chainId, connected, connecting, switchToCorrectNetwork, environmentName } = useContext(Web3Context);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // 如果没有连接或者已经在正确的网络上，不显示任何内容
  if (!connected || chainId === parseInt(NETWORK.chainId, 16) || !isVisible) {
    return null;
  }
  
  const handleSwitchNetwork = async () => {
    setIsLoading(true);
    try {
      await switchToCorrectNetwork();
    } catch (error) {
      console.error("网络切换失败:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-yellow-900/80 backdrop-blur-md border-t border-yellow-800 px-4 py-3 shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-2 sm:mb-0">
          <div className="text-yellow-400 mr-2 text-xl">⚠️</div>
          <div>
            <p className="text-yellow-200 text-sm font-medium">
              您当前未连接到{NETWORK.chainName}网络 ({environmentName})
              <button 
                className="ml-2 text-yellow-400 underline hover:text-yellow-300 text-xs"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? '隐藏详情' : '查看详情'}
              </button>
            </p>
            
            {showDetails && (
              <div className="mt-2 text-xs text-yellow-300/80">
                <p>当前网络ID: {chainId}</p>
                <p>需要的网络ID: {parseInt(NETWORK.chainId, 16)} ({NETWORK.chainName})</p>
                <p>某些功能可能无法正常工作，请切换到{NETWORK.chainName}以获得最佳体验。</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSwitchNetwork}
            className="bg-yellow-700 hover:bg-yellow-600 text-white text-sm px-4 py-1 rounded-full transition-colors flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                切换中...
              </>
            ) : `切换到${NETWORK.chainName}`}
          </button>
          
          <button 
            onClick={() => setIsVisible(false)}
            className="text-yellow-400 hover:text-yellow-300 text-sm"
            aria-label="关闭提示"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkAlert; 