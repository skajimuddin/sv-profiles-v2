import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContextProvider';
import AdminNavigation from './AdminNavigation';
import LoadingSpinner from '../../Components/LoadingSpinner';
import ErrorDisplay from '../../Components/ErrorDisplay';
import PageContainer from "../../Components/PageContainer"
import { useFeedback } from "../../Context/FeedbackContext"
import {
  getOrderById,
  updateOrderStatus as updateOrderStatusService,
  addOrderNote,
} from "../../Firebase/orderService"

const ORDER_STATUSES = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800" },
  shipped: { label: "Shipped", color: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
}

const OrderDetailPage = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newStatus, setNewStatus] = useState("")
  const [newNote, setNewNote] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isAddingNote, setIsAddingNote] = useState(false)

  const navigate = useNavigate()
  const { currentUser, userDetails } = useAuth()
  const feedback = useFeedback()

  // Check if user is admin and fetch order details
  useEffect(() => {
    const checkAdminAndFetchOrder = async () => {
      // Check authentication
      if (!currentUser) {
        navigate("/login")
        return
      }

      // Check admin role
      if (!userDetails?.roles?.includes("admin")) {
        navigate("/")
        return
      }

      try {
        // Fetch order details
        const orderData = await getOrderById(orderId)

        if (!orderData) {
          setError(new Error("Order not found"))
          setLoading(false)
          return
        }

        // Process order date
        if (orderData.createdAt) {
          orderData.createdAt = new Date(orderData.createdAt.seconds * 1000)
        } else {
          orderData.createdAt = new Date()
        }

        // Process status history dates
        if (orderData.statusHistory && Array.isArray(orderData.statusHistory)) {
          orderData.statusHistory = orderData.statusHistory.map((entry) => {
            return {
              ...entry,
              timestamp: entry.timestamp
                ? new Date(entry.timestamp.seconds * 1000)
                : new Date(),
            }
          })
        }

        // Sort status history by timestamp (newest first)
        if (orderData.statusHistory) {
          orderData.statusHistory.sort((a, b) => b.timestamp - a.timestamp)
        }

        setOrder(orderData)
        setNewStatus(orderData.status || "pending")
      } catch (error) {
        console.error("Error fetching order:", error)
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAndFetchOrder()
  }, [orderId, currentUser, userDetails, navigate])

  // Update order status
  const handleStatusUpdate = async () => {
    try {
      setIsUpdating(true)

      await updateOrderStatusService(orderId, newStatus, newNote)

      // Update the local order state
      setOrder((prev) => {
        const updatedOrder = { ...prev, status: newStatus }

        // Add to status history
        const newStatusEntry = {
          status: newStatus,
          timestamp: new Date(),
          note: newNote || "",
          updatedBy: currentUser.email,
        }

        updatedOrder.statusHistory = [
          newStatusEntry,
          ...(updatedOrder.statusHistory || []),
        ]

        return updatedOrder
      })

      feedback.showSuccess(
        `Order status updated to ${
          ORDER_STATUSES[newStatus]?.label || newStatus
        }`
      )
      setNewNote("")
    } catch (error) {
      console.error("Error updating order status:", error)
      feedback.showError("Failed to update order status")
    } finally {
      setIsUpdating(false)
    }
  }

  // Add a note to the order
  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      setIsAddingNote(true)

      await addOrderNote(orderId, newNote)

      // Update local order state
      setOrder((prev) => {
        const updatedOrder = { ...prev }

        // Add to notes array
        const newNoteEntry = {
          content: newNote,
          timestamp: new Date(),
          addedBy: currentUser.email,
        }

        updatedOrder.notes = [newNoteEntry, ...(updatedOrder.notes || [])]

        return updatedOrder
      })

      feedback.showSuccess("Note added successfully")
      setNewNote("")
    } catch (error) {
      console.error("Error adding note:", error)
      feedback.showError("Failed to add note")
    } finally {
      setIsAddingNote(false)
    }
  }

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A"

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner fullScreen message="Loading order details..." />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorDisplay
          error={error}
          onDismiss={() => navigate("/admin/orders")}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="pt-0" fullWidth={false} bgColor="bg-gray-50">
      <div className="bg-[var(--secondary-color)] text-white shadow-md -mx-4 sm:-mx-6 lg:-mx-8 mb-6">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>
      </div>

      <AdminNavigation />

      <div className="py-8">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg
              className="h-5 w-5 mr-1"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
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
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ORDER_STATUSES[order.status || "pending"]?.color ||
                      "bg-gray-100"
                    }`}
                  >
                    {ORDER_STATUSES[order.status || "pending"]?.label ||
                      "Pending"}
                  </span>
                </div>

                <div className="border-t border-gray-200">
                  <dl>
                    {/* Customer Information */}
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Customer Name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Email Address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {order.customer?.email}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Phone Number
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {order.customer?.phone || "N/A"}
                      </dd>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Shipping Address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {order.shippingAddress?.street},{" "}
                        {order.shippingAddress?.city},{" "}
                        {order.shippingAddress?.state}{" "}
                        {order.shippingAddress?.zip},{" "}
                        {order.shippingAddress?.country}
                      </dd>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Payment Method
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {order.paymentMethod || "Credit Card"}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Payment ID
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {order.paymentId || "N/A"}
                      </dd>
                    </div>

                    {/* Order Total */}
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Total Amount
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-semibold">
                        ${order.totalAmount?.toFixed(2) || "0.00"}
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
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                  <div className="sm:divide-y sm:divide-gray-200">
                    {order.items &&
                      order.items.map((item, index) => (
                        <div
                          key={index}
                          className="py-4 sm:py-5 sm:grid sm:grid-cols-5 sm:gap-4 sm:px-6"
                        >
                          <div className="sm:col-span-1">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-20 w-20 object-cover rounded-md"
                              />
                            ) : (
                              <div className="h-20 w-20 bg-gray-100 flex items-center justify-center rounded-md text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="mt-1 sm:mt-0 sm:col-span-3">
                            <div className="text-sm font-medium text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500 mt-1 sm:hidden">
                              Qty: {item.quantity} × $
                              {item.price?.toFixed(2) || "0.00"}
                            </div>
                            {item.options &&
                              Object.keys(item.options).length > 0 && (
                                <div className="mt-1 text-xs text-gray-500">
                                  {Object.entries(item.options).map(
                                    ([key, value]) => (
                                      <span key={key} className="mr-2">
                                        {key}: {value}
                                      </span>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                          <div className="mt-2 sm:mt-0 sm:col-span-1 text-right">
                            <div className="text-sm text-gray-900 hidden sm:block">
                              {item.quantity} × $
                              {item.price?.toFixed(2) || "0.00"}
                            </div>
                            <div className="font-medium text-gray-900">
                              ${(item.quantity * (item.price || 0)).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Order Summary */}
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-5 sm:gap-4 sm:px-6 bg-gray-50">
                      <div className="sm:col-span-1"></div>
                      <div className="mt-1 sm:mt-0 sm:col-span-3 text-right">
                        <div className="text-sm text-gray-500">Subtotal</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Shipping
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Tax</div>
                        <div className="text-sm font-medium text-gray-900 mt-2">
                          Total
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0 sm:col-span-1 text-right">
                        <div className="text-sm text-gray-900">
                          ${order.subtotal?.toFixed(2) || "0.00"}
                        </div>
                        <div className="text-sm text-gray-900 mt-1">
                          ${order.shippingCost?.toFixed(2) || "0.00"}
                        </div>
                        <div className="text-sm text-gray-900 mt-1">
                          ${order.tax?.toFixed(2) || "0.00"}
                        </div>
                        <div className="text-sm font-medium text-gray-900 mt-2">
                          ${order.totalAmount?.toFixed(2) || "0.00"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status History */}
              <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Status History
                  </h3>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {order.statusHistory && order.statusHistory.length > 0 ? (
                      order.statusHistory.map((status, index) => (
                        <li key={index} className="px-4 py-4">
                          <div className="flex justify-between">
                            <div>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  ORDER_STATUSES[status.status]?.color ||
                                  "bg-gray-100"
                                }`}
                              >
                                {ORDER_STATUSES[status.status]?.label ||
                                  status.status}
                              </span>
                              {status.note && (
                                <p className="mt-1 text-sm text-gray-600">
                                  {status.note}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">
                                {formatDate(status.timestamp)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                by {status.updatedBy || "System"}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-4 text-sm text-gray-500 text-center">
                        No status history available
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Notes
                  </h3>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {order.notes && order.notes.length > 0 ? (
                      order.notes.map((note, index) => (
                        <li key={index} className="px-4 py-4">
                          <div className="flex justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-600">
                                {note.content}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-xs text-gray-500">
                                {formatDate(note.timestamp)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                by {note.addedBy || "System"}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-4 text-sm text-gray-500 text-center">
                        No notes available
                      </li>
                    )}
                  </ul>

                  <div className="p-4 border-t border-gray-200">
                    <textarea
                      className="shadow-sm focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] block w-full sm:text-sm border-gray-300 rounded-md"
                      rows="3"
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    ></textarea>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddNote}
                        disabled={isAddingNote || !newNote.trim()}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-[var(--secondary-color)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--secondary-color)]"
                      >
                        {isAddingNote ? "Adding..." : "Add Note"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg sticky top-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Order Actions
                  </h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5">
                  <div className="mb-4">
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Update Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] sm:text-sm rounded-md"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      {Object.keys(ORDER_STATUSES).map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUSES[status].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="statusNote"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Status Note (Optional)
                    </label>
                    <textarea
                      id="statusNote"
                      name="statusNote"
                      rows="3"
                      className="shadow-sm focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Add a note about this status update..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleStatusUpdate}
                      disabled={isUpdating}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--secondary-color)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--secondary-color)]"
                    >
                      {isUpdating ? "Updating..." : "Update Status"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default OrderDetailPage;
