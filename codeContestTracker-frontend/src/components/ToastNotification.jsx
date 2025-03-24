// components/ToastNotification.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';

// Create a context for notifications
const NotificationContext = createContext();

// Individual toast notification component
const Toast = ({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  
  const { message, type } = notification;
  
  // Start exit animation before actual removal
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, notification.duration - 500); // Longer animation prep time (500ms)
    
    return () => clearTimeout(timer);
  }, [notification.duration]);
  
  // Enhanced color schemes for different notification types
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
          border: 'border-l-4 border-emerald-700',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-rose-500',
          border: 'border-l-4 border-red-700',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-amber-400 to-yellow-500',
          border: 'border-l-4 border-amber-600',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
          border: 'border-l-4 border-blue-700',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-700 to-gray-800',
          border: 'border-l-4 border-gray-600',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };
  
  const styles = getStyles();
  
  return (
    <div 
      className={`${styles.bg} ${styles.border} text-white px-6 py-4 rounded-lg shadow-xl max-w-sm w-full
                  transform transition-all duration-500 ease-in-out flex items-center
                  ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
    >
      <div className="flex-1 flex items-center">
        {styles.icon}
        <p className="text-base font-medium">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={6} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// The container that holds and displays all notifications
const ToastContainer = () => {
  const { notifications, removeNotification } = useContext(NotificationContext);
  
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {notifications.map(notification => (
        <Toast 
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
      
      {/* Notification counter badge if more than one notification */}
      {notifications.length > 1 && (
        <div className="absolute -top-3 -right-3 bg-indigo-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg border-2 border-indigo-700">
          {notifications.length}
        </div>
      )}
    </div>
  );
};

// Provider component to manage notifications
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success', duration = 5000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    
    // Auto-remove notification after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const contextValue = {
    notifications,
    addNotification,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  );
};

// Hook to use notifications in any component
// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};