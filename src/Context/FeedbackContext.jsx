import React, { createContext, useContext, useState } from 'react';
import FeedbackToast from '../Components/FeedbackToast';

// Create a context for feedback/toast notifications
const FeedbackContext = createContext();

/**
 * Provider component for feedback/toast management
 */
export function FeedbackProvider({ children }) {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000
  });
  
  // Show a toast notification
  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({
      visible: true,
      message,
      type,
      duration
    });
  };
  
  // Hide the toast
  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };
  
  // Convenience methods for different toast types
  const showSuccess = (message, duration) => showToast(message, 'success', duration);
  const showError = (message, duration) => showToast(message, 'error', duration);
  const showInfo = (message, duration) => showToast(message, 'info', duration);
  const showWarning = (message, duration) => showToast(message, 'warning', duration);
  
  return (
    <FeedbackContext.Provider 
      value={{
        showToast,
        hideToast,
        showSuccess,
        showError,
        showInfo,
        showWarning
      }}
    >
      {children}
      
      {toast.visible && (
        <FeedbackToast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
    </FeedbackContext.Provider>
  );
}

// Custom hook to access the feedback context
export function useFeedback() {
  const context = useContext(FeedbackContext);
  
  if (!context) {
    console.warn('useFeedback hook was called outside of its Provider');
    
    // Return a no-op implementation to prevent errors
    return {
      showToast: () => {},
      hideToast: () => {},
      showSuccess: () => {},
      showError: () => {},
      showInfo: () => {},
      showWarning: () => {}
    };
  }
  
  return context;
}

export default FeedbackContext;
