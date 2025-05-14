import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const addNotification = (type, message, duration = 5000) => {
    const id = Date.now();
    const newNotification = { id, type, message };
    
    setNotifications((prev) => [...prev, newNotification]);
    
    // Auto dismiss after duration
    if (duration) {
      setTimeout(() => {
        dismissNotification(id);
      }, duration);
    }
    
    return id;
  };
  
  // Dismiss a notification by id
  const dismissNotification = (id) => {
    setNotifications((prev) => 
      prev.filter((notification) => notification.id !== id)
    );
  };
  
  // Shorthand methods for different notification types
  const showSuccess = (message, duration) => 
    addNotification('success', message, duration);
    
  const showError = (message, duration) => 
    addNotification('error', message, duration);
    
  const showInfo = (message, duration) => 
    addNotification('info', message, duration);
    
  const showWarning = (message, duration) => 
    addNotification('warning', message, duration);
  
  const value = {
    notifications,
    addNotification,
    dismissNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification display */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
          {notifications.map(({ id, type, message }) => (
            <div 
              key={id}
              className={`p-3 rounded-lg shadow-lg flex justify-between items-start
                ${type === 'success' ? 'bg-green-700/90' : ''}
                ${type === 'error' ? 'bg-red-700/90' : ''}
                ${type === 'info' ? 'bg-blue-700/90' : ''}
                ${type === 'warning' ? 'bg-amber-700/90' : ''}
                backdrop-blur-sm border border-white/10
              `}
            >
              <p className="text-white text-sm">{message}</p>
              <button 
                className="text-white/70 hover:text-white ml-2"
                onClick={() => dismissNotification(id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

// Hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext; 