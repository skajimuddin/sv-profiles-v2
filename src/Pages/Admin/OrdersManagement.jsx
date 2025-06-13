import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContextProvider';
import AdminNavigation from './AdminNavigation';
import LoadingSpinner from '../../Components/LoadingSpinner';
import ErrorDisplay from '../../Components/ErrorDisplay';
import { useFeedback } from '../../Context/FeedbackContext';
import { 
  getOrders,
  updateOrderStatus as updateOrderStatusService,
  addOrderNote
} from '../../Firebase/orderService';

const ORDER_STATUSES = {
  'pending': { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  'processing': { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  'shipped': { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  'delivered': { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
};

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newNote, setNewNote] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const { currentUser, userDetails } = useAuth();
  const feedback = useFeedback();
  
  const ORDERS_PER_PAGE = 10;
  
  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      // Check if user has admin role
      if (!userDetails?.roles?.includes('admin')) {
        navigate('/');
        return;
      }
    };
    
    checkAdminStatus();
  }, [currentUser, userDetails, navigate]);
  
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        const options = {
          limit: ORDERS_PER_PAGE
        };
        
        if (statusFilter !== 'all') {
          options.status = statusFilter;
        }
        
        const result = await getOrders(options);
        
        if (result.orders.length > 0) {
          const ordersList = result.orders.map(order => ({
            ...order,
            createdAt: order.createdAt ? new Date(order.createdAt.seconds * 1000) : new Date()
          }));
          
          setOrders(ordersList);
          setLastVisible(result.lastDoc);
          setHasMore(result.orders.length >= ORDERS_PER_PAGE);
        } else {
          setOrders([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        feedback.showError("Failed to load orders. Please try again.");
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser && userDetails?.roles?.includes('admin')) {
      fetchOrders();
    }
  }, [currentUser, userDetails, statusFilter, feedback]);
  
  // Load more orders
  const loadMoreOrders = async () => {
    if (!lastVisible) return;
    
    try {
      setLoading(true);
      
      const options = {
        limit: ORDERS_PER_PAGE,
        lastDoc: lastVisible
      };
      
      if (statusFilter !== 'all') {
        options.status = statusFilter;
      }
      
      const result = await getOrders(options);
      
      if (result.orders.length > 0) {
        const newOrders = result.orders.map(order => ({
          ...order,
          createdAt: order.createdAt ? new Date(order.createdAt.seconds * 1000) : new Date()
        }));
        
        setOrders(prev => [...prev, ...newOrders]);
        setLastVisible(result.lastDoc);
        setHasMore(result.orders.length >= ORDERS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more orders:", error);
      feedback.showError("Failed to load more orders. Please try again.");
      setError(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Update order status
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setIsUpdating(true);
      
      await updateOrderStatusService(orderId, newStatus);
      
      // Update local state
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      feedback.showSuccess(`Order status updated to ${newStatus}`);
      
      if (isModalOpen) {
        setIsModalOpen(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      feedback.showError("Failed to update order status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Open status update modal
  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status || 'pending');
    setIsModalOpen(true);
  };
  
  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status) => {
    return ORDER_STATUSES[status]?.color || 'bg-gray-100 text-gray-800';
  };
  
  // Filter orders by search term (customer name, email, or order ID)
  const filteredOrders = searchTerm
    ? orders.filter(order => {
        const customerName = `${order.customer?.firstName} ${order.customer?.lastName}`.toLowerCase();
        const customerEmail = order.customer?.email?.toLowerCase() || '';
        const orderId = order.id.toLowerCase();
        const searchTermLower = searchTerm.toLowerCase();
        
        return customerName.includes(searchTermLower) 
          || customerEmail.includes(searchTermLower)
          || orderId.includes(searchTermLower);
      })
    : orders;
  
  if (loading && orders.length === 0) {
    return <LoadingSpinner fullScreen message="Loading orders..." />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[var(--secondary-color)] text-white shadow-md">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Order Management</h1>
        </div>
      </div>
      
      <AdminNavigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <ErrorDisplay 
            error={error} 
            onDismiss={() => setError(null)}
            className="mb-6"
          />
        )}
        
        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="w-full md:w-1/3">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Orders
              </label>
              <input
                type="text"
                id="search"
                className="shadow-sm focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by customer name, email or order ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-1/4">
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="statusFilter"
                className="shadow-sm focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] block w-full sm:text-sm border-gray-300 rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {Object.keys(ORDER_STATUSES).map(status => (
                  <option key={status} value={status}>
                    {ORDER_STATUSES[status].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Orders Table */}
        <div className="bg-white overflow-hidden shadow-md rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--secondary-color)]">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer?.firstName} {order.customer?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ${order.total?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status || 'pending')}`}>
                          {ORDER_STATUSES[order.status || 'pending']?.label || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <button 
                          onClick={() => openStatusModal(order)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium mr-2"
                        >
                          Update Status
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="text-[var(--secondary-color)] hover:text-[var(--secondary-color)] font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {searchTerm || statusFilter !== 'all' ? 'No matching orders found.' : 'No orders found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Load More */}
          {hasMore && (
            <div className="flex items-center justify-center py-4">
              <button
                onClick={loadMoreOrders}
                disabled={loading}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--secondary-color)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--secondary-color)]"
              >
                {loading ? 'Loading...' : 'Load More Orders'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Update Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Order Status</h3>
            <p className="text-sm text-gray-500 mb-4">
              Order ID: <span className="font-semibold">{selectedOrder.id}</span>
            </p>
            
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                className="shadow-sm focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] block w-full sm:text-sm border-gray-300 rounded-md"
                value={newStatus || selectedOrder.status || 'pending'}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {Object.keys(ORDER_STATUSES).map(status => (
                  <option key={status} value={status}>
                    {ORDER_STATUSES[status].label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--secondary-color)]"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleStatusUpdate(selectedOrder.id, newStatus)}
                disabled={isUpdating}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--secondary-color)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--secondary-color)]"
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
