import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const AdminNavigation = () => {
  const location = useLocation();
  
  // Define admin navigation links
  const navLinks = [
    { path: '/admin', exact: true, label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/admin/products', label: 'Products', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
    { path: '/admin/orders', label: 'Orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { path: '/admin/customers', label: 'Customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { path: '/admin/reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
  ];
  
  // Check if current path is active
  const isActive = (path) => {
    if (path === "/admin" && location.pathname === "/admin") {
      return true
    }
    return location.pathname.startsWith(path) && path !== "/admin"
  }
  return (
    <nav className="bg-white border-b border-gray-200 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex flex-1 overflow-x-auto hide-scrollbar">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-lg font-semibold text-[var(--secondary-color)]">
                Admin Panel
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={`${
                    isActive(link.path)
                      ? "border-[var(--secondary-color)] text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  end={link.exact}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={link.icon}
                    />
                  </svg>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <a
              href="/"
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <span className="mr-1">View Store</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="sm:hidden">
        <div className="flex overflow-x-auto py-2 px-3 space-x-4 hide-scrollbar">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={`${
                isActive(link.path)
                  ? "bg-[var(--secondary-color)] bg-opacity-10 text-[var(--secondary-color)]"
                  : "text-gray-600 hover:bg-gray-100"
              } flex items-center px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap`}
              end={link.exact}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={link.icon}
                />
              </svg>
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
};

export default AdminNavigation;
