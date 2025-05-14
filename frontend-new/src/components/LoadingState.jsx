import React from 'react';

const LoadingState = ({ 
  size = 'medium', 
  message = '加载中...', 
  fullPage = false,
  transparent = false
}) => {
  // 根据size参数设置尺寸
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-4',
    large: 'h-20 w-20 border-4'
  };
  
  const spinnerClass = `inline-block ${sizeClasses[size]} rounded-full border-teal-500 border-t-transparent animate-spin`;
  
  // 全屏加载
  if (fullPage) {
    return (
      <div className={`fixed inset-0 ${transparent ? 'bg-black/40 backdrop-blur-sm' : 'bg-gray-900'} z-50 flex flex-col items-center justify-center`}>
        <div className={spinnerClass}></div>
        {message && <p className="mt-4 text-lg text-gray-300">{message}</p>}
      </div>
    );
  }
  
  // 内联加载
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={spinnerClass}></div>
      {message && <p className="mt-4 text-gray-400">{message}</p>}
    </div>
  );
};

export default LoadingState; 