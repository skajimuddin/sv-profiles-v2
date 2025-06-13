import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useOrders } from '../../Context/OrdersContextProvider';

const OrdersNavigation = () => {
  const location = useLocation();
  const { cart } = useOrders();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Define navigation links
  const navLinks = [
    { path: '/products', label: 'Products' },
    { path: '/cart', label: 'Cart', badge: cartCount > 0 ? cartCount : null },
    { path: '/orders', label: 'My Orders' }
  ];
  
  // Check if current path is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-4">
          <h1 className="text-xl font-bold text-[var(--secondary-color)]">Shop</h1>
          
          <div className="flex space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium relative ${
                  isActive(link.path)
                    ? 'bg-[var(--secondary-color)] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="absolute -top-1 -right-1 bg-[var(--primary-color)] text-[var(--secondary-color)] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default OrdersNavigation;
