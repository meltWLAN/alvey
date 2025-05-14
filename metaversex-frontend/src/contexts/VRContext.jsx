import React, { createContext, useContext, useState, useEffect } from 'react';

const VRContext = createContext();

export const VRProvider = ({ children }) => {
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isVRActive, setIsVRActive] = useState(false);
  const [xrSession, setXRSession] = useState(null);
  const [vrError, setVRError] = useState(null);

  // 检查VR支持
  useEffect(() => {
    const checkVRSupport = async () => {
      if ('xr' in navigator) {
        try {
          const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
          setIsVRSupported(isSupported);
          console.log('VR支持状态:', isSupported);
        } catch (err) {
          console.error('检查VR支持时出错:', err);
          setVRError('无法检测VR支持');
          setIsVRSupported(false);
        }
      } else {
        console.log('WebXR API不支持');
        setIsVRSupported(false);
      }
    };

    checkVRSupport();
  }, []);

  // 进入VR模式
  const enterVR = async () => {
    if (!isVRSupported) {
      setVRError('您的设备不支持VR');
      return;
    }

    try {
      setVRError(null);

      if ('xr' in navigator) {
        const session = await navigator.xr.requestSession('immersive-vr', {
          requiredFeatures: ['local-floor', 'hand-tracking'],
          optionalFeatures: ['bounded-floor']
        });

        setXRSession(session);
        setIsVRActive(true);

        // 设置会话结束处理程序
        session.addEventListener('end', () => {
          setIsVRActive(false);
          setXRSession(null);
        });

        return session;
      }
    } catch (err) {
      console.error('启动VR会话时出错:', err);
      setVRError(`启动VR失败: ${err.message || '未知错误'}`);
      setIsVRActive(false);
      return null;
    }
  };

  // 退出VR模式
  const exitVR = async () => {
    if (xrSession) {
      try {
        await xrSession.end();
        setIsVRActive(false);
        setXRSession(null);
      } catch (err) {
        console.error('结束VR会话时出错:', err);
        setVRError(`退出VR失败: ${err.message || '未知错误'}`);
      }
    }
  };

  // 提供VR功能给子组件
  const value = {
    isVRSupported,
    isVRActive,
    xrSession,
    vrError,
    enterVR,
    exitVR
  };

  return <VRContext.Provider value={value}>{children}</VRContext.Provider>;
};

// Hook用于访问VRContext
export const useVR = () => {
  const context = useContext(VRContext);
  if (!context) {
    throw new Error('useVR必须在VRProvider中使用');
  }
  return context;
};

export default VRContext; 