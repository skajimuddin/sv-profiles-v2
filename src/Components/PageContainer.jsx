import React from 'react';

/**
 * PageContainer component for consistent layout across pages
 * Provides consistent max-width, padding, and responsive behavior
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render within the page container
 * @param {string} props.className - Additional classes to apply to the container
 * @param {boolean} props.fullWidth - Whether to use full width or constrained width
 * @param {string} props.bgColor - Background color class for the container
 */
const PageContainer = ({ 
  children, 
  className = "", 
  fullWidth = false,
  bgColor = "bg-gray-50" 
}) => {
  return (
    <div className={`min-h-screen ${bgColor} pb-6 sm:pb-12 ${className}`}>
      <div className={`${fullWidth ? 'w-full' : 'container mx-auto px-4 sm:px-6 lg:px-8'} max-w-7xl`}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
