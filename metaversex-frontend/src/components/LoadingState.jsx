import React from 'react';

const LoadingState = ({ message = '加载中...' }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-indigo-600/20 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState; 