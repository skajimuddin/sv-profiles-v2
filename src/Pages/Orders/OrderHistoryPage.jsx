import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContextProvider';
import { useOrders } from '../../Context/OrdersContextProvider';
import OrdersNavigation from './OrdersNavigation';
import LoadingSpinner from '../../Components/LoadingSpinner';
import ErrorDisplay from '../../Components/ErrorDisplay';

const OrderHistoryPage = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { orders, loadOrders, loading: contextLoading, error: contextError } = useOrders();
  
  // Load orders when component mounts
  useEffect(() => {
    const loadOrderData = async () => {
      try {
        setPageError(null);
        await loadOrders();
      } catch (error) {
        console.error("Error loading orders:", error);
        setPageError(error);
      } finally {
        setPageLoading(false);
      }
    };
    
    loadOrderData();
  }, [loadOrders]);
  
  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'Processing';
    
    // Check if it's a Firebase timestamp
    if (dateString.seconds) {
      const date = new Date(dateString.seconds * 1000);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    // Regular date string
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Get status badge class based on order status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'shipping':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
    // Handle loading state
  if (pageLoading || contextLoading) {
    return <LoadingSpinner fullScreen={true} message="Loading your orders..." />;
  }
  
  // Handle error state
  if (pageError || contextError) {
    const error = pageError || contextError;
    return (
      <ErrorDisplay 
        error={error} 
        fullScreen={true}
        reset={() => {
          setPageError(null);
          loadOrders().catch(err => setPageError(err));
        }}
      />
    );
  }
    return (
    <div className="bg-gray-50 min-h-screen py-8">
      {/* Orders Navigation */}
      <OrdersNavigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--secondary-color)] mb-6">Order History</h1>
          
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="mt-4 text-lg font-medium text-gray-700">No orders yet</h2>
              <p className="mt-2 text-gray-500">You haven't placed any orders yet.</p>
              <button 
                onClick={() => navigate('/products')}
                className="mt-6 px-6 py-3 bg-[var(--primary-color)] text-[var(--secondary-color)] font-medium rounded-lg hover:bg-[#c99c4c] transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${typeof order.total === 'number' ? order.total.toFixed(2) : '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                            {order.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => navigate(`/orders/${order.id}`)}
                            className="text-[var(--primary-color)] hover:text-[#c99c4c]"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-[var(--secondary-color)] text-white font-medium rounded-lg hover:bg-[#162d4d] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
