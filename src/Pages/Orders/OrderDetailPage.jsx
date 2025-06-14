import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../Firebase/firebase';
import { useAuth } from '../../Context/AuthContextProvider';
import PageContainer from "../../Components/PageContainer"
import LoadingSpinner from "../../Components/LoadingSpinner"

const OrderDetailPage = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !currentUser) {
        setError("No order ID provided or user not logged in")
        setLoading(false)
        return
      }

      try {
        const orderRef = doc(db, "orders", orderId)
        const orderSnap = await getDoc(orderRef)

        if (orderSnap.exists()) {
          const orderData = orderSnap.data()

          // Verify that this order belongs to the current user
          if (orderData.userId !== currentUser.uid) {
            setError("You do not have permission to view this order")
          } else {
            setOrder({ id: orderSnap.id, ...orderData })
          }
        } else {
          setError("Order not found")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        setError("Error loading order details")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, currentUser])

  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return "Processing"

    // Check if it's a Firebase timestamp
    if (dateString.seconds) {
      const date = new Date(dateString.seconds * 1000)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    // Regular date string
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status badge class based on order status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "shipping":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner fullScreen={true} message="Loading order details..." />
      </PageContainer>
    )
  }
  if (error) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="mt-4 text-xl font-bold text-gray-900">{error}</h2>
              <p className="mt-2 text-gray-600">
                We couldn't find the order you're looking for.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/orders")}
                  className="px-4 py-2 bg-[var(--secondary-color)] text-white rounded-md hover:bg-[#162d4d] transition-colors"
                >
                  Back to Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    )
  }
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Order Header */}
          <div className="bg-[var(--secondary-color)] px-6 py-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-xl font-bold text-white">
                  Order #{order?.id?.substring(0, 8)}
                </h1>
                <p className="text-[var(--primary-color)]">
                  {formatDate(order?.createdAt)}
                </p>
              </div>
              <div className="mt-2 md:mt-0">
                <span
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                    order?.status
                  )}`}
                >
                  {order?.status || "pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Order Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Items */}
              <div className="lg:col-span-2">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Order Items
                </h2>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Product
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Price
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Quantity
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order?.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-md object-cover"
                                  src={item.imageUrl}
                                  alt={item.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Order Summary */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">
                      ${order?.subtotal?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900 font-medium">
                      ${order?.shipping?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900 font-medium">
                      ${order?.tax?.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between">
                    <span className="text-gray-900 font-bold">Total</span>
                    <span className="text-gray-900 font-bold">
                      ${order?.total?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Customer Information
                  </h2>
                  <p className="text-gray-700">
                    {order?.customer?.firstName} {order?.customer?.lastName}
                  </p>
                  <p className="text-gray-700">{order?.customer?.email}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Shipping Address
                  </h2>
                  <p className="text-gray-700">{order?.customer?.address}</p>
                  <p className="text-gray-700">
                    {order?.customer?.city}, {order?.customer?.postalCode}
                  </p>
                  <p className="text-gray-700">{order?.customer?.country}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Payment Method
                  </h2>
                  <p className="text-gray-700 capitalize">
                    {order?.paymentMethod?.replace("-", " ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => navigate("/orders")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to Orders
              </button>

              {order?.status === "pending" && (
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[var(--primary-color)] text-[var(--secondary-color)] rounded-md hover:bg-[#c99c4c] transition-colors"
                >
                  Print Receipt
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default OrderDetailPage;
