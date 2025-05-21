import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { FaArrowLeft, FaExternalLinkAlt, FaSync, FaCog } from 'react-icons/fa';
import { createConnector } from '../utils/appConnectors';

/**
 * 应用连接器包装器组件
 * 提供第三方应用集成框架，支持iframe嵌入、深度链接和API集成
 */
const AppConnectorWrapper = ({ 
  app, 
  onBack, 
  showHeader = true,
  width = '100%',
  height = '80vh',
  fullScreen = false,
  allowNavigation = true,
  onMessage = null
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connector, setConnector] = useState(null);
  const [connected, setConnected] = useState(false);
  const [integrationMode, setIntegrationMode] = useState(app.integration || 'deep-link');
  const iframeRef = useRef(null);
  
  // 初始化连接器
  useEffect(() => {
    try {
      const newConnector = createConnector(app);
      setConnector(newConnector);
      
      // 尝试初始化连接
      newConnector.initialize().then(result => {
        setConnected(result);
      });
    } catch (err) {
      console.error('初始化应用连接器失败:', err);
      setError(t('common.error'));
    }
  }, [app, t]);
  
  // 跟踪iframe加载状态
  const handleIframeLoad = () => {
    setLoading(false);
  };
  
  // 处理iframe错误
  const handleIframeError = () => {
    setLoading(false);
    setError(t('appConnector.loadError'));
  };
  
  // 连接钱包并启动应用
  const connectAndLaunch = async () => {
    if (!connector) return;
    
    try {
      setLoading(true);
      const result = await connector.connect();
      setConnected(result);
      
      if (result) {
        if (integrationMode === 'deep-link') {
          // 深度链接模式，直接打开应用
          connector.launch();
        }
      }
    } catch (err) {
      console.error('连接应用失败:', err);
      setError(t('appConnector.connectionError'));
    } finally {
      setLoading(false);
    }
  };
  
  // 处理来自iframe的消息
  useEffect(() => {
    if (integrationMode !== 'iframe') return;
    
    const handleMessage = (event) => {
      // 安全检查，确保消息来源于预期的域
      const appUrl = new URL(app.url);
      if (event.origin !== appUrl.origin) return;
      
      // 处理特定类型的消息
      if (event.data && event.data.type) {
        switch (event.data.type) {
          case 'CONNECT_REQUEST':
            // 应用请求连接钱包
            connectAndLaunch();
            break;
          case 'APP_LOADED':
            // 应用已加载完成
            setLoading(false);
            break;
          case 'APP_ERROR':
            // 应用报告错误
            setError(event.data.message || t('appConnector.appError'));
            break;
          default:
            // 自定义消息处理
            if (onMessage) {
              onMessage(event.data);
            }
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [app.url, connectAndLaunch, integrationMode, onMessage, t]);
  
  // 打开外部链接
  const openExternalLink = () => {
    window.open(app.url, '_blank');
  };
  
  // 刷新iframe
  const refreshIframe = () => {
    if (iframeRef.current) {
      setLoading(true);
      iframeRef.current.src = iframeRef.current.src;
    }
  };
  
  // 根据集成模式渲染内容
  const renderContent = () => {
    switch (integrationMode) {
      case 'iframe':
        return (
          <div className="relative w-full h-full">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                <div className="flex flex-col items-center">
                  <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-white">{t('appConnector.loading')}</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                <div className="bg-gray-800 p-6 rounded-xl max-w-md text-center">
                  <div className="text-red-400 text-4xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold mb-2">{t('appConnector.errorTitle')}</h3>
                  <p className="text-gray-300 mb-4">{error}</p>
                  <div className="flex justify-center space-x-3">
                    <button 
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                      onClick={() => setError(null)}
                    >
                      {t('common.cancel')}
                    </button>
                    <button 
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white flex items-center"
                      onClick={refreshIframe}
                    >
                      <FaSync className="mr-2" />
                      {t('appConnector.retry')}
                    </button>
                    <button 
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white flex items-center"
                      onClick={openExternalLink}
                    >
                      <FaExternalLinkAlt className="mr-2" />
                      {t('appConnector.openExternal')}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              src={app.url}
              title={app.name}
              className="w-full h-full border-0 rounded-lg bg-gray-900"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
              loading="lazy"
            />
          </div>
        );
        
      case 'api':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <img 
              src={app.logo || '/images/app-placeholder.png'} 
              alt={app.name} 
              className="w-20 h-20 mb-4 rounded-lg"
            />
            <h3 className="text-xl font-bold mb-2">{app.name}</h3>
            <p className="text-gray-300 mb-6 max-w-md">{t(app.descriptionKey)}</p>
            
            <div className="max-w-md w-full bg-gray-800 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-2">{t('appConnector.integrationInfo')}</h4>
              <p className="text-gray-400 text-sm">{t('appConnector.apiModeDescription')}</p>
            </div>
            
            <button
              onClick={openExternalLink}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center"
            >
              <FaExternalLinkAlt className="mr-2" />
              {t('appConnector.openApp')}
            </button>
          </div>
        );
        
      default: // deep-link
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <img 
              src={app.logo || '/images/app-placeholder.png'} 
              alt={app.name} 
              className="w-20 h-20 mb-4 rounded-lg"
            />
            <h3 className="text-xl font-bold mb-2">{app.name}</h3>
            <p className="text-gray-300 mb-6 max-w-md">{t(app.descriptionKey)}</p>
            
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('appConnector.connecting')}
              </div>
            ) : (
              <button
                onClick={connected ? openExternalLink : connectAndLaunch}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center"
              >
                {connected ? (
                  <>
                    <FaExternalLinkAlt className="mr-2" />
                    {t('appConnector.openApp')}
                  </>
                ) : (
                  <>
                    <FaCog className="mr-2" />
                    {t('appConnector.connectFirst')}
                  </>
                )}
              </button>
            )}
            
            {error && (
              <div className="mt-4 text-red-400">
                {error}
              </div>
            )}
          </div>
        );
    }
  };
  
  return (
    <div 
      className={`bg-gray-900 rounded-xl overflow-hidden ${fullScreen ? 'fixed inset-0 z-50' : ''}`}
      style={{ width: fullScreen ? '100%' : width, height: fullScreen ? '100%' : height }}
    >
      {showHeader && (
        <div className="flex items-center justify-between bg-gray-800 px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-3 text-gray-400 hover:text-white"
            >
              <FaArrowLeft />
            </button>
            <div className="flex items-center">
              <img 
                src={app.logo || '/images/app-placeholder.png'} 
                alt={app.name} 
                className="w-6 h-6 mr-2 rounded"
              />
              <h3 className="font-medium">{app.name}</h3>
              {!app.native && (
                <span className="ml-2 px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                  {t('appHub.thirdParty')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {integrationMode === 'iframe' && (
              <button
                onClick={refreshIframe}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                title={t('appConnector.refresh')}
              >
                <FaSync />
              </button>
            )}
            <button
              onClick={openExternalLink}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title={t('appConnector.openInNewTab')}
            >
              <FaExternalLinkAlt />
            </button>
          </div>
        </div>
      )}
      
      <div className="w-full h-full">
        {renderContent()}
      </div>
    </div>
  );
};

AppConnectorWrapper.propTypes = {
  app: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    logo: PropTypes.string,
    descriptionKey: PropTypes.string.isRequired,
    integration: PropTypes.string,
    native: PropTypes.bool
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  showHeader: PropTypes.bool,
  width: PropTypes.string,
  height: PropTypes.string,
  fullScreen: PropTypes.bool,
  allowNavigation: PropTypes.bool,
  onMessage: PropTypes.func
};

export default AppConnectorWrapper; 