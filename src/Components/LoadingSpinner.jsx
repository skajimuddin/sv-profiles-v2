import React from 'react';

const sizes = {
  small: "h-4 w-4",
  medium: "h-8 w-8",
  large: "h-16 w-16"
};

const colors = {
  primary: "text-[var(--primary-color)]",
  secondary: "text-[var(--secondary-color)]",
  white: "text-white",
  gray: "text-gray-500"
};

const LoadingSpinner = ({ size = 'medium', color = 'secondary', fullScreen = false, message = '' }) => {
  const spinnerSize = sizes[size] || sizes.medium;
  const spinnerColor = colors[color] || colors.secondary;
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50">
        <svg 
          className={`animate-spin ${spinnerSize} ${spinnerColor}`} 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {message && <p className="mt-4 text-lg font-medium text-[var(--secondary-color)]">{message}</p>}
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center">
      <svg 
        className={`animate-spin ${spinnerSize} ${spinnerColor}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {message && <p className="mt-2 text-sm font-medium text-gray-700">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
