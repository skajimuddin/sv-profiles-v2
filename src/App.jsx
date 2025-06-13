import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import HomePage from "./Pages/HomePage"
import LoginPage from "./Pages/LoginPage"
import SignupPage from "./Pages/SignupPage"
import ForgotPasswordPage from "./Pages/ForgotPasswordPage"
import ProductsPage from "./Pages/Orders/ProductsPage"
import CartPage from "./Pages/Orders/CartPage"
import OrderSummaryPage from "./Pages/Orders/OrderSummaryPage"
import OrderHistoryPage from "./Pages/Orders/OrderHistoryPage"
import OrderDetailPage from "./Pages/Orders/OrderDetailPage"
import ProductDetailPage from "./Pages/Orders/ProductDetailPage"
// Admin imports
import AdminDashboard from "./Pages/Admin/AdminDashboard"
import ProductsManagement from "./Pages/Admin/ProductsManagement"
import OrdersManagement from "./Pages/Admin/OrdersManagement"
import ProductForm from "./Pages/Admin/ProductForm"
import AdminOrderDetailPage from "./Pages/Admin/OrderDetailPage"
import Header from "./Components/Header"
import { lazy, Suspense, useEffect, useState } from "react"
import { AuthContextProvider, useAuth } from "./Context/AuthContextProvider"
import { OrdersContextProvider } from "./Context/OrdersContextProvider"
import { FeedbackProvider } from "./Context/FeedbackContext"
import Preloader from "./Preloader"

// Create a Not Found Page component
const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-[#1c3860]">
            404
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            Page not found
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div>
          <a
            href="/"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#1c3860] hover:bg-[#162d4d]"
          >
            Go back home
          </a>
        </div>
      </div>
    </div>
  )
}

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { userLoggedIn, loading } = useAuth()

  if (loading) {
    return <Preloader />
  }

  if (!userLoggedIn) {
    return <Navigate to="/login" />
  }

  return (
    <>
      <Header />
      {children}
    </>
  )
}

// Admin Route component
const AdminRoute = ({ children }) => {
  const { userLoggedIn, loading, userDetails } = useAuth()

  if (loading) {
    return <Preloader />
  }

  if (!userLoggedIn) {
    return <Navigate to="/login" />
  }

  // Check for admin role
  if (!userDetails?.roles?.includes("admin")) {
    return <Navigate to="/" />
  }

  return (
    <>
      <Header />
      {children}
    </>
  )
}

function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return <Preloader />
  }

  return (
    <Routes>
      <Route path="*" element={<NotFoundPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-summary"
        element={
          <ProtectedRoute>
            <OrderSummaryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrderHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/:productId"
        element={
          <ProtectedRoute>
            <ProductDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <ProductsManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <OrdersManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders/:orderId"
        element={
          <AdminRoute>
            <AdminOrderDetailPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products/new"
        element={
          <AdminRoute>
            <ProductForm />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products/edit/:productId"
        element={
          <AdminRoute>
            <ProductForm />
          </AdminRoute>
        }
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <OrdersContextProvider>
          <FeedbackProvider>
            <AppRoutes />
          </FeedbackProvider>
        </OrdersContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  )
}

export default App
