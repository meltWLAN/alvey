import React, { useState, useEffect } from 'react';
import { toggleEnvironment, getEnvironmentName, ENVIRONMENTS } from '../utils/environment';

const EnvironmentSwitch = () => {
  const [environment, setEnvironment] = useState('');

  useEffect(() => {
    setEnvironment(getEnvironmentName());
  }, []);

  const handleToggle = () => {
    toggleEnvironment();
    // 环境切换会导致页面刷新，所以不需要在这里更新状态
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center bg-white bg-opacity-90 dark:bg-gray-800 rounded-full px-3 py-1 shadow-md">
      <span className="text-xs mr-2">{environment}</span>
      <button
        onClick={handleToggle}
        className="w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 transition duration-300 ease-in-out"
      >
        <div
          className={`bg-white dark:bg-gray-600 w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
            environment === '本地测试环境' ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
};

export default EnvironmentSwitch; 