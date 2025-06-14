import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContextProvider';
import { useOrders } from '../../Context/OrdersContextProvider';
import OrdersNavigation from './OrdersNavigation';
import LoadingSpinner from '../../Components/LoadingSpinner';
import ErrorDisplay from '../../Components/ErrorDisplay';
import PageContainer from "../../Components/PageContainer"
import {
  makeRazorpayPayment,
  prepareRazorpayOrder,
  formatCurrency,
} from "../../utils/razorpayLoader"

const OrderSummaryPage = () => {
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    paymentMethod: "razorpay",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState("")

  const navigate = useNavigate()
  const { currentUser, userDetails } = useAuth()
  const { cart, getSubtotal, placeOrder, clearCart } = useOrders()

  useEffect(() => {
    // If cart is empty, redirect back to products
    if (cart.length === 0) {
      navigate("/products")
      return
    }

    // Pre-fill form with user details if available
    if (currentUser && userDetails) {
      setFormData((prev) => ({
        ...prev,
        firstName: userDetails.displayName?.split(" ")[0] || "",
        lastName: userDetails.displayName?.split(" ")[1] || "",
        email: currentUser.email || "",
      }))
    }

    setLoading(false)
  }, [currentUser, userDetails, navigate, cart.length])

  const calculateTax = () => {
    return getSubtotal() * 0.1
  }

  const calculateShipping = () => {
    return 5.0 // Fixed shipping cost
  }

  const calculateTotal = () => {
    return getSubtotal() + calculateTax() + calculateShipping()
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Required fields validation
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "address",
      "city",
      "postalCode",
      "country",
    ]

    requiredFields.forEach((field) => {
      if (!formData[field].trim()) {
        newErrors[field] = "This field is required"
      }
    })

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Credit card validation if payment method is credit card
    if (formData.paymentMethod === "credit-card") {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required"
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
        newErrors.cardNumber = "Please enter a valid 16-digit card number"
      }

      if (!formData.cardExpiry.trim()) {
        newErrors.cardExpiry = "Expiry date is required"
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.cardExpiry)) {
        newErrors.cardExpiry = "Please enter a valid expiry date (MM/YY)"
      }

      if (!formData.cardCvc.trim()) {
        newErrors.cardCvc = "CVC is required"
      } else if (!/^\d{3,4}$/.test(formData.cardCvc)) {
        newErrors.cardCvc = "Please enter a valid CVC (3 or 4 digits)"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    // Process order
    try {
      // Place the order using context function
      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
      }
      // For Razorpay payment method, we'll handle payment differently
      if (formData.paymentMethod === "razorpay") {
        try {
          // Calculate the total amount
          const totalAmount = calculateTotal()

          // Create a temporary order ID for tracking
          const tempOrderId = `order_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 8)}`

          // Add the order ID to the order data
          orderData.orderId = tempOrderId

          // Create Razorpay options using our utility function
          const options = prepareRazorpayOrder(orderData, totalAmount)

          // Add the handler for payment success
          options.handler = async function (response) {
            try {
              // Payment was successful, include payment ID with order data
              const orderWithPayment = {
                ...orderData,
                payment: {
                  id: response.razorpay_payment_id,
                  method: "razorpay",
                  amount: totalAmount,
                  currency: import.meta.env.VITE_CURRENCY || "INR",
                  status: "completed",
                  timestamp: new Date().toISOString(),
                },
              }

              // Now place the order with payment information
              const order = await placeOrder(orderWithPayment)
              setOrderId(order.id || tempOrderId)

              // Set order as complete
              setOrderComplete(true)

              // Show success toast or notification here if you have one
              console.log("Payment successful!", response)
            } catch (error) {
              console.error("Error saving order after payment:", error)
              setErrors({
                submitError:
                  "Payment was successful but there was an issue saving your order. Please contact support with your payment ID: " +
                  response.razorpay_payment_id,
              })
            }
          }

          // Initialize Razorpay
          await makeRazorpayPayment(options)

          // The handler function will take care of completing the order
          setIsSubmitting(false)
        } catch (error) {
          console.error("Razorpay payment error:", error)
          setErrors({
            submitError:
              error.message ||
              "Payment failed. Please try again or choose a different payment method.",
          })
          setIsSubmitting(false)
        }
      } else {
        // For other payment methods, continue with the original flow
        const order = await placeOrder(orderData)
        setOrderId(order.id)

        // Clear cart (redundant as placeOrder already does this, but keeping for clarity)
        clearCart()

        // Set order as complete
        setOrderComplete(true)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error processing order:", error)

      // Display user-friendly error
      setErrors({
        submitError:
          error.message ||
          "There was an error processing your order. Please try again.",
      })

      window.scrollTo({ top: 0, behavior: "smooth" })
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <OrdersNavigation />
        <LoadingSpinner fullScreen={true} message="Loading checkout..." />
      </PageContainer>
    )
  }
  if (orderComplete) {
    return (
      <PageContainer>
        {/* Orders Navigation */}
        <OrdersNavigation />

        <div className="max-w-4xl mx-auto mt-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[var(--secondary-color)] mt-6">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Thank you for your purchase
            </p>
            <div className="mt-8 bg-gray-50 rounded-lg p-6 text-left">
              <p className="text-gray-600">Your order number:</p>
              <p className="text-xl font-medium text-[var(--secondary-color)]">
                {orderId}
              </p>
              <p className="text-gray-600 mt-4">
                We've sent a confirmation email to:
              </p>
              <p className="text-[var(--secondary-color)] font-medium">
                {formData.email}
              </p>
            </div>
            <div className="mt-8">
              <button
                onClick={() => navigate("/products")}
                className="px-6 py-3 bg-[var(--primary-color)] text-[var(--secondary-color)] font-medium rounded-lg hover:bg-[#c99c4c] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </PageContainer>
    )
  }
  return (
    <PageContainer>
      {/* Orders Navigation */}
      <OrdersNavigation />

      <div className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {" "}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-2xl font-bold text-[var(--secondary-color)] mb-6">
                Checkout
              </h1>

              {/* General form error */}
              {errors.submitError && (
                <ErrorDisplay
                  error={{ message: errors.submitError }}
                  reset={() =>
                    setErrors((prev) => ({ ...prev, submitError: null }))
                  }
                />
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    Shipping Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.address ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.address}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.city ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.postalCode
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.postalCode && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.country ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                      </select>
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.country}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    Payment Information
                  </h2>

                  <div className="mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="credit-card"
                          name="paymentMethod"
                          value="credit-card"
                          checked={formData.paymentMethod === "credit-card"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-[var(--primary-color)]"
                        />
                        <label
                          htmlFor="credit-card"
                          className="ml-2 text-sm text-gray-700"
                        >
                          Credit Card
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="paypal"
                          name="paymentMethod"
                          value="paypal"
                          checked={formData.paymentMethod === "paypal"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-[var(--primary-color)]"
                        />
                        <label
                          htmlFor="paypal"
                          className="ml-2 text-sm text-gray-700"
                        >
                          PayPal
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="razorpay"
                          name="paymentMethod"
                          value="razorpay"
                          checked={formData.paymentMethod === "razorpay"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-[var(--primary-color)]"
                        />{" "}
                        <label
                          htmlFor="razorpay"
                          className="ml-2 text-sm text-gray-700 flex items-center"
                        >
                          Razorpay
                          <img
                            src="https://cdn.razorpay.com/logos/D5UVWmDQnYtqKO_small.png"
                            alt="Razorpay"
                            className="h-6 ml-2"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {formData.paymentMethod === "credit-card" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors.cardNumber
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.cardNumber && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.cardNumber}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiration Date
                          </label>
                          <input
                            type="text"
                            name="cardExpiry"
                            value={formData.cardExpiry}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors.cardExpiry
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.cardExpiry && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.cardExpiry}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVC
                          </label>
                          <input
                            type="text"
                            name="cardCvc"
                            value={formData.cardCvc}
                            onChange={handleInputChange}
                            placeholder="123"
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors.cardCvc
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.cardCvc && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.cardCvc}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === "paypal" && (
                    <div className="bg-blue-50 p-4 rounded-md">
                      <p className="text-sm text-gray-700">
                        You will be redirected to PayPal to complete your
                        payment after review.
                      </p>
                    </div>
                  )}

                  {formData.paymentMethod === "razorpay" && (
                    <div className="bg-green-50 p-4 rounded-md">
                      <p className="text-sm text-gray-700">
                        You will be redirected to Razorpay to complete your
                        payment.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-[var(--primary-color)] text-[var(--secondary-color)] font-medium rounded-lg hover:bg-[#c99c4c] transition-colors flex items-center justify-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-[var(--secondary-color)]"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Complete Order"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Order Summary
              </h2>

              <div className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <div key={item.id} className="py-4 flex">
                    <div className="flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-800">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-800">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <div className="flex justify-between">
                  {" "}
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatCurrency(getSubtotal())}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Shipping</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatCurrency(calculateShipping())}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Tax</p>
                  <p className="text-sm font-medium text-gray-800">
                    ${calculateTax().toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  {" "}
                  <p className="text-base font-bold text-[var(--secondary-color)]">
                    Total
                  </p>
                  <p className="text-base font-bold text-[var(--secondary-color)]">
                    {formatCurrency(calculateTotal())}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => navigate("/cart")}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default OrderSummaryPage;
