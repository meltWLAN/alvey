import React from 'react';

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      <div className="relative w-24 h-24">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-indigo-600/20 rounded-full"></div>
        
        {/* Inner Spinning Ring */}
        <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
        
        {/* Inner Pulsing Circle */}
        <div className="absolute inset-4 bg-gradient-to-br from-purple-600 to-indigo-800 rounded-full animate-pulse"></div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-400">
          {message}
        </p>
        <p className="mt-2 text-gray-500 max-w-xs">
          Exploring the metaverse takes a moment...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen; 