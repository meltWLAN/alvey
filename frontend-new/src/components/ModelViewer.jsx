import React, { useContext, useState, useEffect, useRef } from 'react';
import { VRContext } from '../contexts/VRContext';

// 通用模型查看器组件
const ModelViewer = ({ modelUrl, thumbnailUrl, format, name }) => {
  const { isVRSupported, preferNonVR, toggleVRPreference } = useContext(VRContext);
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renderer, setRenderer] = useState(null);

  // 初始化查看器
  useEffect(() => {
    if (!containerRef.current) return;
    
    const loadModel = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (preferNonVR) {
          // 使用普通3D查看器加载模型（非VR模式）
          // 这里使用Three.js或其他库来显示3D模型
          // 为简化演示，仅显示缩略图
          const img = document.createElement('img');
          img.src = thumbnailUrl || '/placeholder.png';
          img.alt = name || '3D模型';
          img.style.width = '100%';
          img.style.height = 'auto';
          img.style.borderRadius = '8px';
          img.onload = () => setIsLoading(false);
          
          // 清除容器并添加图片
          while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
          }
          containerRef.current.appendChild(img);
          
          // 添加3D查看视图按钮
          const viewButton = document.createElement('button');
          viewButton.textContent = '查看3D模型';
          viewButton.className = 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded absolute bottom-4 right-4';
          viewButton.onclick = () => {
            // 在此处添加打开3D模型查看器的逻辑
            window.open(modelUrl, '_blank');
          };
          containerRef.current.appendChild(viewButton);
          
        } else {
          // VR模式 - 在支持的浏览器中初始化WebXR
          // 这里应该是WebXR的初始化代码
          setError('VR模式尚未完全实现。请使用普通模式查看。');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('加载模型时出错:', err);
        setError(`无法加载模型: ${err.message}`);
        setIsLoading(false);
      }
    };
    
    loadModel();
    
    // 清理函数
    return () => {
      if (renderer) {
        renderer.dispose && renderer.dispose();
      }
    };
  }, [modelUrl, thumbnailUrl, preferNonVR, name, renderer]);

  return (
    <div className="relative w-full h-full min-h-[300px]">
      {/* VR切换开关 - 仅在支持VR时显示 */}
      {isVRSupported && (
        <div className="absolute top-2 right-2 z-10">
          <button 
            onClick={toggleVRPreference}
            className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded-full text-sm flex items-center"
          >
            <span className="mr-2">{preferNonVR ? '2D' : 'VR'}</span>
            <div className={`w-8 h-4 bg-gray-400 rounded-full p-1 transition duration-300 ease-in-out ${preferNonVR ? '' : 'bg-purple-500'}`}>
              <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${preferNonVR ? '' : 'translate-x-3'}`} />
            </div>
          </button>
        </div>
      )}
      
      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* 错误信息 */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-100 bg-opacity-50 text-red-700 p-4">
          <p className="text-lg font-semibold mb-2">出错了</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* 模型容器 */}
      <div ref={containerRef} className="w-full h-full"></div>
    </div>
  );
};

export default ModelViewer; 