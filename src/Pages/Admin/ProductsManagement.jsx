import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContextProvider';
import AdminNavigation from './AdminNavigation';
import LoadingSpinner from '../../Components/LoadingSpinner';
import { useFeedback } from '../../Context/FeedbackContext';
import PageContainer from "../../Components/PageContainer"
import {
  getProducts,
  deleteProduct,
  getCategories,
} from "../../Firebase/productService"
import ErrorDisplay from "../../Components/ErrorDisplay"

const ProductsManagement = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastVisible, setLastVisible] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("all")
  const [categories, setCategories] = useState([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()
  const { currentUser, userDetails } = useAuth()
  const feedback = useFeedback()

  const PRODUCTS_PER_PAGE = 10

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

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error loading categories:", error)
        feedback.showError("Failed to load categories")
      }
    }

    loadCategories()
  }, [feedback])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const options = {
          limit: PRODUCTS_PER_PAGE,
          orderByField: "createdAt",
          orderDirection: "desc",
        }

        // Add search term if exists
        if (searchTerm) {
          options.searchTerm = searchTerm
        }

        // Add category filter if not 'all'
        if (category !== "all") {
          options.category = category
        }

        const result = await getProducts(options)

        if (result.products.length > 0) {
          setProducts(result.products)
          setLastVisible(result.lastDoc)
          setHasMore(result.products.length === PRODUCTS_PER_PAGE)
        } else {
          setProducts([])
          setHasMore(false)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        setError(error)
        feedback.showError("Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    if (currentUser && userDetails?.roles?.includes("admin")) {
      fetchProducts()
    }
  }, [currentUser, userDetails, searchTerm, category, feedback])

  // Load more products
  const loadMoreProducts = async () => {
    if (!lastVisible || !hasMore) return

    try {
      setLoading(true)
      setError(null)

      const options = {
        limit: PRODUCTS_PER_PAGE,
        lastDoc: lastVisible,
        orderByField: "createdAt",
        orderDirection: "desc",
      }

      if (category !== "all") {
        options.category = category
      }

      if (searchTerm) {
        options.searchTerm = searchTerm
      }

      const result = await getProducts(options)

      if (result.products.length > 0) {
        setProducts((prev) => [...prev, ...result.products])
        setLastVisible(result.lastDoc)
        setHasMore(result.products.length === PRODUCTS_PER_PAGE)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more products:", error)
      setError(error)
      feedback.showError("Failed to load more products")
    } finally {
      setLoading(false)
    }
  }

  // Handle product deletion
  const handleDeleteProduct = async (productId, productName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${productName}"?`
    )
    if (!confirmDelete) return

    try {
      setIsDeleting(true)
      await deleteProduct(productId)
      setProducts(products.filter((product) => product.id !== productId))
      feedback.showSuccess(`Product "${productName}" deleted successfully`)
    } catch (error) {
      console.error("Error deleting product:", error)
      feedback.showError(`Failed to delete product: ${error.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setLastVisible(null) // Reset pagination when searching
  }

  // Handle category change
  const handleCategoryChange = (e) => {
    setCategory(e.target.value)
    setLastVisible(null) // Reset pagination when changing category
  }

  // Create new product
  const goToNewProduct = () => {
    navigate("/admin/products/new")
  }
  if (loading && products.length === 0) {
    return (
      <PageContainer>
        <LoadingSpinner fullScreen message="Loading products..." />
      </PageContainer>
    )
  }

  if (error && products.length === 0) {
    return (
      <PageContainer className="pt-0" fullWidth={false} bgColor="bg-gray-50">
        <div className="bg-[var(--secondary-color)] text-white shadow-md -mx-4 sm:-mx-6 lg:-mx-8 mb-6">
          <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold">Products Management</h1>
          </div>
        </div>

        <AdminNavigation />

        <div className="py-8">
          <ErrorDisplay
            error={error}
            reset={() => {
              setError(null)
              setLoading(true)
              setLastVisible(null)
              setProducts([])
            }}
          />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="pt-0" fullWidth={false} bgColor="bg-gray-50">
      <div className="bg-[var(--secondary-color)] text-white shadow-md -mx-4 sm:-mx-6 lg:-mx-8 mb-6">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Products Management</h1>
          <button
            onClick={goToNewProduct}
            className="bg-[var(--primary-color)] text-[var(--secondary-color)] px-4 py-2 rounded-lg hover:bg-[#c99c4c] transition-colors flex items-center"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      <AdminNavigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] focus:outline-none"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {products.length > 0 ? (
            <div className="overflow-x-auto">
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              src={
                                product.imageUrl ||
                                "https://via.placeholder.com/40"
                              }
                              alt={product.name}
                              className="h-10 w-10 object-cover rounded"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.description?.substring(0, 50)}
                              {product.description?.length > 50 ? "..." : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${product.price?.toFixed(2) || "0.00"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.stockQuantity || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="text-[var(--secondary-color)] hover:text-[#162d4d] mr-4"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() =>
                            handleDeleteProduct(product.id, product.name)
                          }
                          className="text-red-600 hover:text-red-800"
                          disabled={isDeleting}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No products found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || category !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating a new product."}
              </p>
              {!searchTerm && category === "all" && (
                <div className="mt-6">
                  <button
                    onClick={goToNewProduct}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--secondary-color)] hover:bg-[#162d4d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--secondary-color)]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="-ml-1 mr-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create New Product
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Load More Button */}
        {hasMore && products.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMoreProducts}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--secondary-color)]"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default ProductsManagement;
