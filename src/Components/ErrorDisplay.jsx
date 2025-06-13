import React from 'react';

const ErrorDisplay = ({ error, reset, fullScreen = false }) => {
  const errorMessage = error?.message || 'Something went wrong';
  
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 text-center mb-6">{errorMessage}</p>
          {reset && (
            <button
              onClick={reset}
              className="w-full px-4 py-2 bg-[var(--secondary-color)] text-white rounded-md hover:bg-[#162d4d] transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
          {reset && (
            <button 
              onClick={reset} 
              className="mt-2 text-sm font-medium text-red-800 hover:underline"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
