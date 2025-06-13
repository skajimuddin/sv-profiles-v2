import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContextProvider';
import AdminNavigation from './AdminNavigation';
import LoadingSpinner from '../../Components/LoadingSpinner';
import ErrorDisplay from '../../Components/ErrorDisplay';
import { useFeedback } from '../../Context/FeedbackContext';
import { 
  getOrderById,
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

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  const navigate = useNavigate();
  const { currentUser, userDetails } = useAuth();
  const feedback = useFeedback();
  
  // Check if user is admin and fetch order details
  useEffect(() => {
    const checkAdminAndFetchOrder = async () => {
      // Check authentication
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      // Check admin role
      if (!userDetails?.roles?.includes('admin')) {
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        const orderData = await getOrderById(orderId);
        
        if (orderData) {
          setOrder({
            ...orderData,
            createdAt: orderData.createdAt ? new Date(orderData.createdAt.seconds * 1000) : new Date(),
            updatedAt: orderData.updatedAt ? new Date(orderData.updatedAt.seconds * 1000) : null,
            notes: orderData.notes?.map(note => ({
              ...note,
              timestamp: note.timestamp ? new Date(note.timestamp.seconds * 1000) : new Date(note.date)
            })) || []
          });
          
          setNewStatus(orderData.status || 'pending');
        } else {
          setError(new Error('Order not found'));
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err);
        feedback.showError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminAndFetchOrder();
  }, [currentUser, userDetails, orderId, navigate, feedback]);
  
  // Update order status
  const handleUpdateStatus = async () => {
    try {
      setIsUpdating(true);
      
      await updateOrderStatusService(orderId, newStatus);
      
      // Update local state
      setOrder(prev => ({ ...prev, status: newStatus }));
      
      feedback.showSuccess(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      feedback.showError("Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Add note to order
  const handleAddNote = async (e) => {
    e.preventDefault();
    
    if (!newNote.trim()) return;
    
    try {
      setIsAddingNote(true);
      
      const updatedOrder = await addOrderNote(orderId, newNote);
      
      // Update local state with the new notes from server
      setOrder(prev => ({
        ...prev,
        notes: updatedOrder.notes?.map(note => ({
          ...note,
          timestamp: note.timestamp ? new Date(note.timestamp.seconds * 1000) : new Date(note.date)
        })) || []
      }));
      
      setNewNote('');
      feedback.showSuccess('Note added successfully');
    } catch (error) {
      console.error("Error adding note:", error);
      feedback.showError("Failed to add note to order");
    } finally {
      setIsAddingNote(false);
    }
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
  
  if (loading) {
    return <LoadingSpinner fullScreen message="Loading order details..." />;
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorDisplay 
            error={error} 
            onDismiss={() => navigate('/admin/orders')} 
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[var(--secondary-color)] text-white shadow-md">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>
      </div>
      
      <AdminNavigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/admin/orders')} 
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="h-5 w-5 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Orders
          </button>
        </div>
        
        {order && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Order Info */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Order #{order.id}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ORDER_STATUSES[order.status || 'pending']?.color || 'bg-gray-100'}`}>
                    {ORDER_STATUSES[order.status || 'pending']?.label || 'Pending'}
                  </span>
                </div>
                
                <div className="border-t border-gray-200">
                  <dl>
                    {/* Customer Information */}
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {order.customer?.email}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {order.customer?.phone || 'N/A'}
                      </dd>
                    </div>
                    
                    {/* Shipping Address */}
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}, {order.shippingAddress?.country}
                      </dd>
                    </div>
                    
                    {/* Payment Information */}
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {order.paymentMethod || 'Credit Card'}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <span className={order.paymentStatus === 'paid' 
                          ? 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'
                          : 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'
                        }>
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Order Items
                  </h3>
                </div>
                <div className="border-t border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.imageUrl && (
                                <div className="flex-shrink-0 h-10 w-10 mr-4">
                                  <img className="h-10 w-10 object-cover rounded" src={item.imageUrl} alt={item.name} />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500">ID: {item.productId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${item.price?.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          Subtotal:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${order.subtotal?.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          Shipping:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${order.shippingFee?.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          Tax:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${order.tax?.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                          Total:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          ${order.total?.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              {/* Order Notes */}
              <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Order Notes
                  </h3>
                </div>
                <div className="border-t border-gray-200">
                  <div className="px-4 py-5 sm:p-6">
                    {order.notes && order.notes.length > 0 ? (
                      <ul className="space-y-4">
                        {order.notes.map((note, index) => (
                          <li key={index} className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-900">{note.text}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(note.timestamp)}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No notes for this order.</p>
                    )}
                    
                    {/* Add Note Form */}
                    <form onSubmit={handleAddNote} className="mt-6">
                      <div>
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                          Add a Note
                        </label>
                        <div className="mt-1">
                          <textarea
                            rows={3}
                            name="note"
                            id="note"
                            className="shadow-sm focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Enter a note about this order"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          type="submit"
                          disabled={isAddingNote || !newNote.trim()}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--secondary-color)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--secondary-color)] disabled:opacity-50"
                        >
                          {isAddingNote ? 'Adding...' : 'Add Note'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Actions Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Order Actions
                  </h3>
                  
                  <div className="mt-6">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Update Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] sm:text-sm rounded-md"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      {Object.keys(ORDER_STATUSES).map(status => (
                        <option key={status} value={status}>
                          {ORDER_STATUSES[status].label}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--secondary-color)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--secondary-color)]"
                      onClick={handleUpdateStatus}
                      disabled={isUpdating || newStatus === order.status}
                    >
                      {isUpdating ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">Order Summary</h4>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <p className="text-gray-500">Order Date</p>
                        <p className="text-gray-900">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <p className="text-gray-500">Items</p>
                        <p className="text-gray-900">{order.items?.length || 0}</p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <p className="text-gray-500">Total Amount</p>
                        <p className="font-medium text-gray-900">${order.total?.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <p className="text-gray-500">Last Updated</p>
                        <p className="text-gray-900">{order.updatedAt ? formatDate(order.updatedAt) : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      className="text-sm text-[var(--secondary-color)] hover:text-opacity-75"
                      onClick={() => window.print()}
                    >
                      Print Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;
