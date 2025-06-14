import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContextProvider';
import AdminNavigation from './AdminNavigation';
import LoadingSpinner from '../../Components/LoadingSpinner';
import ErrorDisplay from '../../Components/ErrorDisplay';
import PageContainer from "../../Components/PageContainer"
import { getOrderStats } from "../../Firebase/orderService"
import { getProductCount } from "../../Firebase/productService"
import { getUserStats } from "../../Firebase/adminService"

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalUsers: 0,
    adminUsers: 0,
  })
  const [error, setError] = useState(null)

  const navigate = useNavigate()
  const { currentUser, userDetails } = useAuth()

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        navigate("/login")
        return
      }

      // Check if user has admin role
      if (!userDetails?.roles?.includes("admin")) {
        navigate("/")
        return
      }
    }

    checkAdminStatus()
  }, [currentUser, userDetails, navigate])
  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        // Get total products
        const totalProducts = await getProductCount()

        // Get order statistics
        const orderStats = await getOrderStats()

        // Get user statistics
        const userStats = await getUserStats()

        setStats({
          totalOrders: orderStats.totalOrders,
          pendingOrders: orderStats.pendingOrders,
          completedOrders: orderStats.completedOrders,
          cancelledOrders: orderStats.cancelledOrders,
          totalProducts,
          totalRevenue: orderStats.totalRevenue,
          totalUsers: userStats.totalUsers,
          adminUsers: userStats.adminUsers,
        })
      } catch (error) {
        console.error("Error fetching admin stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser && userDetails?.roles?.includes("admin")) {
      fetchStats()
    }
  }, [currentUser, userDetails])

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner fullScreen message="Loading dashboard..." />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="pt-0" fullWidth={false} bgColor="bg-gray-50">
      <div className="bg-[var(--secondary-color)] text-white shadow-md -mx-4 sm:-mx-6 lg:-mx-8 mb-6">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
      </div>

      <AdminNavigation />

      <div className="py-8">
        <h2 className="text-2xl font-semibold text-[var(--secondary-color)] mb-6">
          Dashboard Overview
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Orders Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Orders
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">
                        {stats.totalOrders}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3">
              <div className="text-sm">
                <a
                  href="/admin/orders"
                  className="font-medium text-[var(--secondary-color)] hover:text-[#162d4d]"
                >
                  View all orders
                </a>
              </div>
            </div>
          </div>

          {/* Pending Orders Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Orders
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">
                        {stats.pendingOrders}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3">
              <div className="text-sm">
                <a
                  href="/admin/orders?status=pending"
                  className="font-medium text-[var(--secondary-color)] hover:text-[#162d4d]"
                >
                  View pending orders
                </a>
              </div>
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Products
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">
                        {stats.totalProducts}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3">
              <div className="text-sm">
                <a
                  href="/admin/products"
                  className="font-medium text-[var(--secondary-color)] hover:text-[#162d4d]"
                >
                  Manage products
                </a>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Revenue
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">
                        ${stats.totalRevenue.toFixed(2)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3">
              <div className="text-sm">
                <a
                  href="/admin/reports"
                  className="font-medium text-[var(--secondary-color)] hover:text-[#162d4d]"
                >
                  View reports
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-lg font-medium text-gray-900">
                  Add New Product
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Create a new product to sell in your store.
                </p>
                <div className="mt-4">
                  <a
                    href="/admin/products/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--secondary-color)] hover:bg-[#162d4d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--secondary-color)]"
                  >
                    Add Product
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-lg font-medium text-gray-900">
                  Manage Orders
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage customer orders.
                </p>
                <div className="mt-4">
                  <a
                    href="/admin/orders"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--secondary-color)] hover:bg-[#162d4d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--secondary-color)]"
                  >
                    View Orders
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default AdminDashboard;
