import React, { useContext } from 'react';
import { VRContext } from '../contexts/VRContext';

const VRControls = () => {
  const { isVRSupported, inVRMode, enterVR, exitVR, currentDevice, deviceError } = useContext(VRContext);

  // VR模式无法使用
  if (!isVRSupported) {
    return (
      <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 my-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🥽</span>
          <div>
            <h3 className="font-medium">VR模式不可用</h3>
            <p className="text-sm text-gray-400">
              {deviceError || '您的设备或浏览器不支持WebXR功能，请使用支持VR的设备和浏览器。'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 处理VR模式
  const handleVRToggle = async () => {
    if (inVRMode) {
      await exitVR();
    } else {
      await enterVR();
    }
  };

  return (
    <div className="vr-controls">
      <button 
        onClick={handleVRToggle}
        className="vr-button"
        disabled={deviceError}
      >
        <span className="text-xl">🥽</span>
        {inVRMode ? '退出VR模式' : '进入VR模式'}
      </button>
      
      {currentDevice && (
        <div className="text-sm mt-2 text-gray-300">
          已连接: {currentDevice.name}
        </div>
      )}
      
      {deviceError && (
        <div className="text-sm mt-2 text-red-400">
          {deviceError}
        </div>
      )}
    </div>
  );
};

export default VRControls; 