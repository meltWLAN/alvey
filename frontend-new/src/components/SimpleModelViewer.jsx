import React from 'react';

// 简化版3D查看器，仅显示缩略图和快速访问方式
const SimpleModelViewer = ({ thumbnailUrl, modelUrl, name, format }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* 缩略图显示 */}
      <div className="w-full relative overflow-hidden rounded-lg mb-4">
        <img 
          src={thumbnailUrl || "/placeholder.png"} 
          alt={name || "3D模型预览"} 
          className="w-full object-cover"
          style={{ maxHeight: '300px' }}
        />
        <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-br">
          {format?.toUpperCase() || 'GLB'} 格式
        </div>
      </div>
      
      {/* 交互说明 */}
      <div className="text-center p-2 mb-4 bg-gray-100 rounded w-full">
        <p className="text-sm text-gray-700">该3D模型适用于普通设备查看，无需VR设备</p>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex space-x-4">
        <a 
          href={modelUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
        >
          <span className="mr-1">&#128065;</span> 
          查看3D模型
        </a>
        <button 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded flex items-center"
          onClick={() => window.open(`https://modelviewer.dev/editor/index.html#load=${encodeURIComponent(modelUrl)}`, '_blank')}
        >
          <span className="mr-1">&#127922;</span> 
          在线互动查看
        </button>
      </div>
    </div>
  );
};

export default SimpleModelViewer; 
 