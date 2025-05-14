import React from 'react';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaTimes } from 'react-icons/fa';
import { useNotification } from '../contexts/NotificationContext';

const NotificationCenter = () => {
  const { notifications, removeNotification } = useNotification();
  
  // 根据通知类型获取图标和样式
  const getNotificationConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <FaCheckCircle className="h-6 w-6 text-green-400" />,
          bgColor: 'bg-green-900',
          borderColor: 'border-green-600'
        };
      case 'error':
        return {
          icon: <FaTimesCircle className="h-6 w-6 text-red-400" />,
          bgColor: 'bg-red-900',
          borderColor: 'border-red-600'
        };
      case 'warning':
        return {
          icon: <FaExclamationTriangle className="h-6 w-6 text-yellow-400" />,
          bgColor: 'bg-yellow-900',
          borderColor: 'border-yellow-600'
        };
      case 'info':
      default:
        return {
          icon: <FaInfoCircle className="h-6 w-6 text-blue-400" />,
          bgColor: 'bg-blue-900',
          borderColor: 'border-blue-600'
        };
    }
  };
  
  if (notifications.length === 0) return null;
  
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 w-full max-w-sm">
      {notifications.map((notification) => {
        const config = getNotificationConfig(notification.type);
        
        return (
          <div
            key={notification.id}
            className={`${config.bgColor} border-l-4 ${config.borderColor} p-4 rounded-lg shadow-lg transform transition-all duration-300 flex items-start`}
            style={{ opacity: 1, transform: 'translateX(0)' }}
          >
            <div className="flex-shrink-0 mr-3">
              {config.icon}
            </div>
            <div className="flex-1 mr-2">
              {notification.title && (
                <h4 className="text-white font-semibold text-sm">{notification.title}</h4>
              )}
              <p className="text-sm text-gray-200 mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-white"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationCenter; 