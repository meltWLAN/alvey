import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaMagic, FaImage, FaCube, FaInfoCircle, FaChevronRight } from 'react-icons/fa';

/**
 * AIAssistant组件 - 提供AI辅助功能
 * 包括生成3D模型、AI对话、创意建议等
 */
const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      content: '欢迎使用MetaverseX AI助手！我可以帮助您生成3D模型、提供创意建议，或回答关于NFT和元宇宙的问题。',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  // AI功能选项
  const aiFeatures = [
    {
      id: 'model-gen',
      title: '3D模型生成',
      icon: <FaCube />,
      description: '通过文本描述生成独特的3D模型',
      prompt: '生成一个未来风格的太空战舰3D模型'
    },
    {
      id: 'scene-gen',
      title: '场景创建',
      icon: <FaImage />,
      description: '创建完整的3D场景和环境',
      prompt: '为我创建一个赛博朋克风格的城市场景'
    },
    {
      id: 'creative',
      title: '创意建议',
      icon: <FaMagic />,
      description: '获取NFT创作和营销建议',
      prompt: '给我一些关于如何推广我的3D艺术作品的建议'
    },
    {
      id: 'market',
      title: '市场分析',
      icon: <FaInfoCircle />,
      description: '获取NFT市场趋势和分析',
      prompt: '分析当前元宇宙地产NFT的市场趋势'
    }
  ];

  // 预设模型模板
  const modelTemplates = [
    {
      id: 'spaceship',
      name: '太空飞船',
      thumbnail: 'https://via.placeholder.com/80?text=飞船',
      description: '未来科幻风格的太空飞船'
    },
    {
      id: 'character',
      name: '游戏角色',
      thumbnail: 'https://via.placeholder.com/80?text=角色',
      description: '可定制的游戏角色模型'
    },
    {
      id: 'building',
      name: '建筑物',
      thumbnail: 'https://via.placeholder.com/80?text=建筑',
      description: '各种风格的建筑物模型'
    },
    {
      id: 'vehicle',
      name: '交通工具',
      thumbnail: 'https://via.placeholder.com/80?text=交通',
      description: '未来或复古风格的交通工具'
    }
  ];

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 模拟AI回复
  const simulateAIResponse = (userMessage) => {
    setIsTyping(true);
    
    // 模拟延迟，真实环境中这里会调用AI API
    setTimeout(() => {
      let response;
      const lowercaseMsg = userMessage.toLowerCase();
      
      if (lowercaseMsg.includes('模型') || lowercaseMsg.includes('3d') || lowercaseMsg.includes('生成')) {
        response = '我可以帮您生成3D模型。请描述您想要的模型外观、风格和用途，我会为您创建一个定制模型。或者您可以选择预设模板开始创建。';
      } else if (lowercaseMsg.includes('nft') || lowercaseMsg.includes('市场')) {
        response = '根据最新分析，元宇宙NFT市场正在向实用性和互操作性方向发展。虚拟房地产和可穿戴NFT最受欢迎。建议关注社交功能和可玩性以提高您NFT的价值。';
      } else if (lowercaseMsg.includes('建议') || lowercaseMsg.includes('创意')) {
        response = '为您的NFT作品增加互动性可以提高吸引力。考虑添加动画效果、声音，或者将多个NFT设计成可以组合的系列。利用社交媒体讲述您作品背后的故事也很重要。';
      } else {
        response = '感谢您的问题！我可以帮助您生成3D模型、提供创意建议，分析市场趋势，或回答关于NFT和元宇宙的问题。请告诉我您需要什么帮助？';
      }
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'ai',
        content: response,
        timestamp: new Date().toISOString()
      }]);
      
      setIsTyping(false);
    }, 1500);
  };

  // 处理消息发送
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // 模拟AI回复
    simulateAIResponse(input);
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
      content: `我想基于"${template.name}"模板创建一个3D模型`,
      timestamp: new Date().toISOString()
    }]);
    
    // 模拟AI回复
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'ai',
        content: `我已为您选择了"${template.name}"模板。请添加更多细节描述，如颜色、材质、特殊功能等，我将为您生成定制3D模型。`,
        timestamp: new Date().toISOString()
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* AI助手按钮 */}
      <button 
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
          isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
        } text-white transition-all duration-300`}
        onClick={() => setIsOpen(!isOpen)}
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
              <h3 className="font-bold text-white">MetaverseX AI助手</h3>
            </div>
            
            {/* 功能切换标签 */}
            <div className="flex space-x-1">
              <button 
                className={`px-2 py-1 rounded text-xs ${activeTab === 'chat' ? 'bg-white text-purple-800' : 'text-white'}`}
                onClick={() => setActiveTab('chat')}
              >
                对话
              </button>
              <button 
                className={`px-2 py-1 rounded text-xs ${activeTab === 'create' ? 'bg-white text-purple-800' : 'text-white'}`}
                onClick={() => setActiveTab('create')}
              >
                创建
              </button>
            </div>
          </div>
          
          {activeTab === 'chat' ? (
            <>
              {/* 聊天区域 */}
              <div className="h-80 overflow-y-auto p-4 bg-gray-800/50 space-y-4">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-3/4 rounded-lg px-4 py-2 ${
                        message.sender === 'user' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      {message.content}
                    </div>
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
                  placeholder="询问AI或输入创作指令..."
                  className="flex-grow bg-gray-800 text-white px-3 py-2 rounded-l focus:outline-none"
                />
                <button 
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-r flex items-center"
                >
                  <FaChevronRight />
                </button>
              </form>
            </>
          ) : (
            <>
              {/* 模型创建区域 */}
              <div className="p-4 bg-gray-800/50">
                <h4 className="font-bold mb-3">选择模型模板开始创建</h4>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {modelTemplates.map(template => (
                    <div 
                      key={template.id}
                      className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors"
                      onClick={() => selectTemplate(template)}
                    >
                      <div className="flex items-center mb-2">
                        <img 
                          src={template.thumbnail} 
                          alt={template.name}
                          className="w-10 h-10 rounded-lg mr-2"
                        />
                        <h5 className="font-medium">{template.name}</h5>
                      </div>
                      <p className="text-xs text-gray-300">{template.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-700 rounded-lg p-3">
                  <h5 className="font-medium mb-2">自定义创建</h5>
                  <p className="text-sm text-gray-300 mb-3">
                    通过详细的文本描述创建完全定制化的3D模型
                  </p>
                  <button 
                    onClick={() => {
                      setActiveTab('chat');
                      usePrompt("我想创建一个自定义3D模型，具体要求是...");
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded"
                  >
                    开始创建
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

export default AIAssistant; 