import React from 'react';

/**
 * Layout component to provide consistent page structure
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render within the layout
 * @param {boolean} props.fullWidth - Whether to use full width or constrained width
 * @param {string} props.className - Additional classes for the container
 * @param {string} props.bgColor - Background color class for the page
 */
const Layout = ({ 
  children, 
  fullWidth = false, 
  className = "", 
  bgColor = "bg-white"
}) => {
  return (
    <div className={`${bgColor} min-h-screen`}>
      <div className={`mx-auto ${fullWidth ? 'w-full' : 'container max-w-7xl'} px-4 sm:px-6 lg:px-8 ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
