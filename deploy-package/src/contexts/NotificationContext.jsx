import React, { createContext, useState, useContext, useCallback } from 'react';

// 通知类型
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // 添加通知
  const addNotification = useCallback((message, type = NOTIFICATION_TYPES.INFO, timeout = 5000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    const newNotification = { id, message, type, timeout };
    
    setNotifications(prevNotifications => [...prevNotifications, newNotification]);
    
    // 自动移除通知
    if (timeout !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, timeout);
    }
    
    return id;
  }, []);
  
  // 移除通知
  const removeNotification = useCallback((id) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  }, []);
  
  // 便捷方法
  const showSuccess = useCallback((message, timeout) => 
    addNotification(message, NOTIFICATION_TYPES.SUCCESS, timeout), [addNotification]);
    
  const showError = useCallback((message, timeout) => 
    addNotification(message, NOTIFICATION_TYPES.ERROR, timeout), [addNotification]);
    
  const showInfo = useCallback((message, timeout) => 
    addNotification(message, NOTIFICATION_TYPES.INFO, timeout), [addNotification]);
    
  const showWarning = useCallback((message, timeout) => 
    addNotification(message, NOTIFICATION_TYPES.WARNING, timeout), [addNotification]);
  
  // 清除所有通知
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearNotifications,
    NOTIFICATION_TYPES
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationDisplay />
    </NotificationContext.Provider>
  );
};

// 通知显示组件
const NotificationDisplay = () => {
  const { notifications, removeNotification, NOTIFICATION_TYPES } = useContext(NotificationContext);
  
  if (notifications.length === 0) {
    return null;
  }
  
  const getNotificationStyle = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'bg-green-900/90 border-l-4 border-green-500 text-green-100';
      case NOTIFICATION_TYPES.ERROR:
        return 'bg-red-900/90 border-l-4 border-red-500 text-red-100';
      case NOTIFICATION_TYPES.WARNING:
        return 'bg-yellow-900/90 border-l-4 border-yellow-500 text-yellow-100';
      case NOTIFICATION_TYPES.INFO:
      default:
        return 'bg-blue-900/90 border-l-4 border-blue-500 text-blue-100';
    }
  };
  
  const getIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return '✓';
      case NOTIFICATION_TYPES.ERROR:
        return '✕';
      case NOTIFICATION_TYPES.WARNING:
        return '⚠️';
      case NOTIFICATION_TYPES.INFO:
      default:
        return 'ℹ️';
    }
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`${getNotificationStyle(notification.type)} p-4 rounded-md shadow-lg backdrop-blur-sm flex items-start animate-slideIn`}
        >
          <div className="mr-3 text-xl">{getIcon(notification.type)}</div>
          <div className="flex-1">{notification.message}</div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-2 text-sm opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContext; 