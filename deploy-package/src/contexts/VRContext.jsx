import React, { createContext, useState, useEffect, useCallback } from 'react';

export const VRContext = createContext();

export const VRProvider = ({ children }) => {
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [inVRMode, setInVRMode] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [deviceError, setDeviceError] = useState(null);
  const [preferNonVR, setPreferNonVR] = useState(true); // 默认使用普通2D模式

  // Check if VR is supported in the browser
  useEffect(() => {
    const checkVRSupport = async () => {
      try {
        if ('xr' in navigator) {
          const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
          setIsVRSupported(isSupported);
          setDeviceError(null);
        } else {
          setIsVRSupported(false);
          setDeviceError('浏览器不支持WebXR');
        }
      } catch (error) {
        console.error('Error checking VR support:', error);
        setIsVRSupported(false);
        setDeviceError(`VR检测错误: ${error.message}`);
      }
    };

    // 只在用户选择VR模式时才检查VR支持
    if (!preferNonVR) {
      checkVRSupport();
    }
  }, [preferNonVR]);

  // Function to enter VR mode
  const enterVR = useCallback(async () => {
    if (!isVRSupported) {
      console.error('不支持VR，使用2D模式');
      return null;
    }

    try {
      const session = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor', 'hit-test'],
        optionalFeatures: ['hand-tracking']
      });
      
      session.addEventListener('end', () => {
        setInVRMode(false);
        setCurrentDevice(null);
      });
      
      // Get device information if available
      if (session.inputSources && session.inputSources.length > 0) {
        const device = session.inputSources[0];
        setCurrentDevice({
          name: device.profiles[0] || 'Unknown VR Device',
          handedness: device.handedness,
          hasTargetRay: !!device.targetRayMode,
          hasGamepad: !!device.gamepad
        });
      }
      
      setInVRMode(true);
      return session;
    } catch (error) {
      console.error('启动VR会话错误:', error);
      setDeviceError(`VR会话错误: ${error.message}`);
      return null;
    }
  }, [isVRSupported]);

  // Function to exit VR mode
  const exitVR = useCallback(async (session) => {
    if (session) {
      await session.end();
    }
    setInVRMode(false);
    setCurrentDevice(null);
  }, []);

  // Toggle between VR and non-VR mode preference
  const toggleVRPreference = useCallback(() => {
    setPreferNonVR(prev => !prev);
    if (inVRMode) {
      // 如果切换到非VR模式，但当前在VR中，则退出VR
      exitVR();
    }
  }, [inVRMode, exitVR]);

  // Get appropriate viewer for current content
  const getViewer = useCallback((modelUrl, thumbnailUrl) => {
    if (preferNonVR || !isVRSupported) {
      // 返回2D查看器组件或配置
      return {
        type: '2D',
        url: thumbnailUrl || modelUrl,
        isVR: false
      };
    } else {
      // 返回VR查看器组件或配置
      return {
        type: 'VR',
        url: modelUrl,
        isVR: true
      };
    }
  }, [preferNonVR, isVRSupported]);

  const value = {
    isVRSupported,
    inVRMode,
    currentDevice,
    deviceError,
    preferNonVR,
    enterVR,
    exitVR,
    toggleVRPreference,
    getViewer
  };

  return <VRContext.Provider value={value}>{children}</VRContext.Provider>;
}; 