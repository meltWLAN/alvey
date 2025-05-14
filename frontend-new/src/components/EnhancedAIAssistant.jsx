import React, { useState, useEffect, useRef, useContext } from 'react';
import { FaRobot, FaMagic, FaImage, FaCube, FaInfoCircle, FaChevronRight, FaLanguage, FaMicrophone, FaPalette, FaLink } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Web3Context } from '../contexts/Web3Context';
import { useLocation } from 'react-router-dom';

/**
 * EnhancedAIAssistant组件 - 增强版AI助手
 * 具有上下文感知、多语言支持和预测性建议功能
 */
const EnhancedAIAssistant = () => {
  const { t, i18n } = useTranslation();
  const { connected, account } = useContext(Web3Context);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isListening, setIsListening] = useState(false);
  const [contextualSuggestions, setContextualSuggestions] = useState([]);
  const [userSkillLevel, setUserSkillLevel] = useState('beginner'); // beginner, intermediate, advanced
  const messagesEndRef = useRef(null);
  const recognition = useRef(null);

  // 初始化语音识别
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.lang = i18n.language;
      recognition.current.interimResults = false;
      
      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setTimeout(() => handleSendMessage(null, transcript), 500);
      };
      
      recognition.current.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        setIsListening(false);
      };
      
      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [i18n.language]);

  // 初始化时发送欢迎消息
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      sender: 'ai',
      content: t('aiAssistant.welcomeMessage'),
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, [t]);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 根据用户位置生成上下文建议
  useEffect(() => {
    generateContextualSuggestions();
  }, [location.pathname, connected, account]);

  // 生成基于当前页面的上下文建议
  const generateContextualSuggestions = () => {
    const path = location.pathname;
    const suggestions = [];
    
    // 基于路径生成建议
    if (path === '/') {
      suggestions.push(
        { id: 'tour', text: t('aiAssistant.suggestions.platformTour'), icon: <FaInfoCircle /> },
        { id: 'start', text: t('aiAssistant.suggestions.gettingStarted'), icon: <FaChevronRight /> }
      );
    } else if (path === '/marketplace') {
      suggestions.push(
        { id: 'find-nft', text: t('aiAssistant.suggestions.findNFT'), icon: <FaImage /> },
        { id: 'trends', text: t('aiAssistant.suggestions.marketTrends'), icon: <FaChartLine /> }
      );
    } else if (path === '/create') {
      suggestions.push(
        { id: 'create-help', text: t('aiAssistant.suggestions.createHelp'), icon: <FaPalette /> },
        { id: 'model-tips', text: t('aiAssistant.suggestions.modelTips'), icon: <FaCube /> }
      );
    } else if (path.includes('/marketplace/')) {
      suggestions.push(
        { id: 'valuation', text: t('aiAssistant.suggestions.nftValuation'), icon: <FaInfoCircle /> },
        { id: 'similar', text: t('aiAssistant.suggestions.similarNFTs'), icon: <FaLink /> }
      );
    }
    
    // 基于用户状态生成建议
    if (!connected) {
      suggestions.push({ 
        id: 'connect-wallet', 
        text: t('aiAssistant.suggestions.connectWallet'), 
        icon: <FaWallet /> 
      });
    }
    
    // 设置生成的建议
    setContextualSuggestions(suggestions);
  };

  // 开始语音识别
  const startListening = () => {
    if (recognition.current) {
      try {
        recognition.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('语音识别启动失败:', error);
      }
    }
  };

  // AI功能选项
  const aiFeatures = [
    {
      id: 'model-gen',
      title: t('aiAssistant.features.modelGen.title'),
      icon: <FaCube />,
      description: t('aiAssistant.features.modelGen.description'),
      prompt: t('aiAssistant.features.modelGen.prompt')
    },
    {
      id: 'scene-gen',
      title: t('aiAssistant.features.sceneGen.title'),
      icon: <FaImage />,
      description: t('aiAssistant.features.sceneGen.description'),
      prompt: t('aiAssistant.features.sceneGen.prompt')
    },
    {
      id: 'creative',
      title: t('aiAssistant.features.creative.title'),
      icon: <FaMagic />,
      description: t('aiAssistant.features.creative.description'),
      prompt: t('aiAssistant.features.creative.prompt')
    },
    {
      id: 'market',
      title: t('aiAssistant.features.market.title'),
      icon: <FaInfoCircle />,
      description: t('aiAssistant.features.market.description'),
      prompt: t('aiAssistant.features.market.prompt')
    }
  ];

  // 预设模型模板
  const modelTemplates = [
    {
      id: 'spaceship',
      name: t('aiAssistant.templates.spaceship.name'),
      thumbnail: '/assets/templates/spaceship-thumb.jpg',
      description: t('aiAssistant.templates.spaceship.description')
    },
    {
      id: 'character',
      name: t('aiAssistant.templates.character.name'),
      thumbnail: '/assets/templates/character-thumb.jpg',
      description: t('aiAssistant.templates.character.description')
    },
    {
      id: 'building',
      name: t('aiAssistant.templates.building.name'),
      thumbnail: '/assets/templates/building-thumb.jpg',
      description: t('aiAssistant.templates.building.description')
    },
    {
      id: 'vehicle',
      name: t('aiAssistant.templates.vehicle.name'),
      thumbnail: '/assets/templates/vehicle-thumb.jpg',
      description: t('aiAssistant.templates.vehicle.description')
    }
  ];

  // 智能分析用户问题
  const analyzeUserQuery = (query) => {
    // 简化版示例，实际实现中会使用更复杂的NLP处理
    const lowercaseQuery = query.toLowerCase();
    const topics = {
      '3d': lowercaseQuery.includes('3d') || lowercaseQuery.includes('模型') || lowercaseQuery.includes('建模'),
      'nft': lowercaseQuery.includes('nft') || lowercaseQuery.includes('买') || lowercaseQuery.includes('卖') || lowercaseQuery.includes('交易'),
      'vr': lowercaseQuery.includes('vr') || lowercaseQuery.includes('虚拟现实') || lowercaseQuery.includes('头显'),
      'wallet': lowercaseQuery.includes('钱包') || lowercaseQuery.includes('连接') || lowercaseQuery.includes('metamask'),
      'create': lowercaseQuery.includes('创建') || lowercaseQuery.includes('制作') || lowercaseQuery.includes('生成'),
      'help': lowercaseQuery.includes('帮助') || lowercaseQuery.includes('指导') || lowercaseQuery.includes('如何')
    };
    
    return topics;
  };

  // 根据用户技能水平调整回答复杂度
  const adjustResponseComplexity = (baseResponse, skillLevel) => {
    switch(skillLevel) {
      case 'beginner':
        return `${baseResponse}\n\n${t('aiAssistant.beginnerTip')}`;
      case 'intermediate':
        return baseResponse;
      case 'advanced':
        return `${baseResponse}\n\n${t('aiAssistant.advancedTip')}`;
      default:
        return baseResponse;
    }
  };

  // 模拟AI回复
  const simulateAIResponse = (userMessage) => {
    setIsTyping(true);
    
    // 分析用户查询
    const topics = analyzeUserQuery(userMessage);
    
    // 更新用户技能水平估计（实际系统中会更复杂）
    if (userMessage.length > 100 || userMessage.includes('技术') || userMessage.includes('高级')) {
      setUserSkillLevel('advanced');
    } else if (messages.length > 5) {
      setUserSkillLevel('intermediate');
    }
    
    // 模拟延迟，真实环境中这里会调用AI API
    setTimeout(() => {
      let baseResponse;
      
      if (topics['3d'] && topics['create']) {
        baseResponse = t('aiAssistant.responses.createModel');
      } else if (topics['nft']) {
        baseResponse = t('aiAssistant.responses.nftInfo');
      } else if (topics['vr']) {
        baseResponse = t('aiAssistant.responses.vrHelp');
      } else if (topics['wallet']) {
        baseResponse = t('aiAssistant.responses.walletHelp');
      } else if (topics['help']) {
        baseResponse = t('aiAssistant.responses.generalHelp');
      } else {
        baseResponse = t('aiAssistant.responses.default');
      }
      
      // 根据用户技能水平调整回答
      const adjustedResponse = adjustResponseComplexity(baseResponse, userSkillLevel);
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'ai',
        content: adjustedResponse,
        timestamp: new Date().toISOString()
      }]);
      
      setIsTyping(false);
    }, 1500);
  };

  // 处理消息发送
  const handleSendMessage = (e, voiceInput = null) => {
    if (e) e.preventDefault();
    
    const message = voiceInput || input;
    if (!message.trim()) return;
    
    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // 模拟AI回复
    simulateAIResponse(message);
  };

  // 使用预设提示
  const usePrompt = (prompt) => {
    setInput(prompt);
  };

  // 选择模板
  const selectTemplate = (template) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      content: t('aiAssistant.templateSelection', { template: template.name }),
      timestamp: new Date().toISOString()
    }]);
    
    // 模拟AI回复
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'ai',
        content: t('aiAssistant.templateConfirmation', { template: template.name }),
        timestamp: new Date().toISOString()
      }]);
    }, 1000);
  };

  // 切换语言
  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
    
    // 更新语音识别语言
    if (recognition.current) {
      recognition.current.lang = newLang;
    }
    
    // 添加系统消息通知语言切换
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'system',
      content: t('aiAssistant.languageChanged', { language: newLang === 'zh' ? '中文' : 'English' }),
      timestamp: new Date().toISOString()
    }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* AI助手按钮 */}
      <button 
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
          isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
        } text-white transition-all duration-300`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? t('aiAssistant.close') : t('aiAssistant.open')}
      >
        {isOpen ? 'X' : <FaRobot className="text-2xl" />}
      </button>
      
      {/* AI助手面板 */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-gray-900 rounded-lg shadow-xl border border-gray-700 overflow-hidden transition-all duration-300 transform origin-bottom-right">
          {/* 标题栏 */}
          <div className="bg-gradient-to-r from-purple-800 to-indigo-800 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <FaRobot className="text-white mr-2" />
              <h3 className="font-bold text-white">{t('aiAssistant.title')}</h3>
            </div>
            
            {/* 功能切换和语言切换 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleLanguage}
                className="text-white hover:text-gray-200 p-1"
                aria-label={t('aiAssistant.toggleLanguage')}
              >
                <FaLanguage className="text-xl" />
              </button>
              
              <div className="flex space-x-1">
                <button 
                  className={`px-2 py-1 rounded text-xs ${activeTab === 'chat' ? 'bg-white text-purple-800' : 'text-white'}`}
                  onClick={() => setActiveTab('chat')}
                >
                  {t('aiAssistant.tabs.chat')}
                </button>
                <button 
                  className={`px-2 py-1 rounded text-xs ${activeTab === 'create' ? 'bg-white text-purple-800' : 'text-white'}`}
                  onClick={() => setActiveTab('create')}
                >
                  {t('aiAssistant.tabs.create')}
                </button>
              </div>
            </div>
          </div>
          
          {activeTab === 'chat' ? (
            <>
              {/* 上下文建议 */}
              {contextualSuggestions.length > 0 && (
                <div className="p-3 bg-gray-800/80 border-b border-gray-700">
                  <p className="text-xs text-gray-400 mb-2">{t('aiAssistant.contextualSuggestions')}</p>
                  <div className="flex flex-wrap gap-2">
                    {contextualSuggestions.map(suggestion => (
                      <button
                        key={suggestion.id}
                        onClick={() => usePrompt(suggestion.text)}
                        className="flex items-center bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded-full"
                      >
                        <span className="mr-1">{suggestion.icon}</span>
                        {suggestion.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 聊天区域 */}
              <div className="h-80 overflow-y-auto p-4 bg-gray-800/50 space-y-4">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${
                      message.sender === 'user' 
                        ? 'justify-end' 
                        : message.sender === 'system' 
                          ? 'justify-center' 
                          : 'justify-start'
                    }`}
                  >
                    {message.sender === 'system' ? (
                      <div className="bg-gray-700/50 text-gray-300 text-xs px-3 py-1 rounded-full">
                        {message.content}
                      </div>
                    ) : (
                      <div 
                        className={`max-w-3/4 rounded-lg px-4 py-2 ${
                          message.sender === 'user' 
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                            : 'bg-gray-700 text-gray-100'
                        }`}
                      >
                        {message.content}
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-white rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-75"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* 快速功能 */}
              <div className="p-2 bg-gray-800 flex space-x-2 overflow-x-auto">
                {aiFeatures.map(feature => (
                  <button
                    key={feature.id}
                    className="min-w-max px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-xs flex items-center"
                    onClick={() => usePrompt(feature.prompt)}
                    title={feature.description}
                  >
                    <span className="mr-1">{feature.icon}</span>
                    {feature.title}
                  </button>
                ))}
              </div>
              
              {/* 输入框 */}
              <form onSubmit={handleSendMessage} className="p-3 bg-gray-900 border-t border-gray-700 flex">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('aiAssistant.inputPlaceholder')}
                  className="flex-grow bg-gray-800 text-white px-3 py-2 rounded-l focus:outline-none"
                />
                <button
                  type="button"
                  onClick={startListening}
                  className={`px-3 py-2 ${
                    isListening 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  } text-white`}
                  disabled={!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)}
                  title={t('aiAssistant.voiceInput')}
                >
                  <FaMicrophone className={isListening ? 'animate-pulse' : ''} />
                </button>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-r flex items-center"
                >
                  <FaChevronRight />
                </button>
              </form>
            </>
          ) : (
            <>
              {/* 模型创建区域 */}
              <div className="p-4 bg-gray-800/50">
                <h4 className="font-bold mb-3">{t('aiAssistant.createModelTitle')}</h4>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {modelTemplates.map(template => (
                    <div 
                      key={template.id}
                      className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors"
                      onClick={() => selectTemplate(template)}
                    >
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gray-600 mr-2 overflow-hidden">
                          <img 
                            src={template.thumbnail} 
                            alt={template.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/80?text=' + template.name;
                            }}
                          />
                        </div>
                        <h5 className="font-medium">{template.name}</h5>
                      </div>
                      <p className="text-xs text-gray-300">{template.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-700 rounded-lg p-3">
                  <h5 className="font-medium mb-2">{t('aiAssistant.customCreationTitle')}</h5>
                  <p className="text-sm text-gray-300 mb-3">
                    {t('aiAssistant.customCreationDescription')}
                  </p>
                  <button 
                    onClick={() => {
                      setActiveTab('chat');
                      usePrompt(t('aiAssistant.customCreationPrompt'));
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 rounded"
                  >
                    {t('aiAssistant.startCreating')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// 需要导入的图标
const FaChartLine = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M496 384H64V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v336c0 17.67 14.33 32 32 32h464c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM464 96H345.94c-21.38 0-32.09 25.85-16.97 40.97l32.4 32.4L288 242.75l-73.37-73.37c-12.5-12.5-32.76-12.5-45.25 0l-68.69 68.69c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L192 237.25l73.37 73.37c12.5 12.5 32.76 12.5 45.25 0l96-96 32.4 32.4c15.12 15.12 40.97 4.41 40.97-16.97V112c.01-8.84-7.15-16-15.99-16z"></path>
  </svg>
);

const FaWallet = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M461.2 128H80c-8.84 0-16-7.16-16-16s7.16-16 16-16h384c8.84 0 16-7.16 16-16 0-26.51-21.49-48-48-48H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h397.2c28.02 0 50.8-21.53 50.8-48V176c0-26.47-22.78-48-50.8-48zM416 336c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z"></path>
  </svg>
);

export default EnhancedAIAssistant; 