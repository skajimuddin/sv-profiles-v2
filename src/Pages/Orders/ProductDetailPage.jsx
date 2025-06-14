import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../Context/OrdersContextProvider';
import OrdersNavigation from './OrdersNavigation';
import { ProductDetailSkeleton } from '../../Components/ProductSkeleton';
import LoadingSpinner from '../../Components/LoadingSpinner';
import ErrorDisplay from '../../Components/ErrorDisplay';
import { formatCurrency } from "../../utils/razorpayLoader"
import PageContainer from "../../Components/PageContainer"

const ProductDetailPage = () => {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const navigate = useNavigate()
  const { addToCart } = useOrders()
  // Fetch product data
  useEffect(() => {
    // In the future, this would fetch from Firebase
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        // Sample product data - in a real app this would come from an API or Firebase
        const mockProducts = [
          {
            id: "1",
            name: "Premium Wireless Headphones",
            description:
              "High-quality noise cancelling headphones with amazing sound quality and comfort",
            price: 99.99,
            imageUrl:
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D",
            category: "electronics",
            features: [
              "Active Noise Cancellation",
              "Comfortable over-ear design",
              "40 hour battery life",
              "Premium sound quality",
              "Bluetooth 5.0 connectivity",
            ],
            specs: {
              weight: "250g",
              batteryLife: "40 hours",
              connectivity: "Bluetooth 5.0, 3.5mm jack",
              warranty: "2 years",
            },
          },
          {
            id: "2",
            name: "Smart Watch Series X",
            description:
              "Premium design with health tracking, notifications and excellent battery life",
            price: 149.99,
            imageUrl:
              "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHByb2R1Y3R8ZW58MHx8MHx8fDA%3D",
            category: "electronics",
            features: [
              "Heart Rate Monitor",
              "ECG Capability",
              "Sleep Tracking",
              "GPS",
              "Water Resistant (50m)",
            ],
            specs: {
              display: '1.8" OLED',
              batteryLife: "7 days",
              connectivity: "Bluetooth 5.1, WiFi",
              warranty: "1 year",
            },
          },
          {
            id: "3",
            name: "Ergonomic Office Chair",
            description:
              "Comfortable and affordable chair with great lumbar support for long working hours",
            price: 179.99,
            imageUrl:
              "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHByb2R1Y3R8ZW58MHx8MHx8fDA%3D",
            category: "home",
            features: [
              "Adjustable height",
              "Lumbar support",
              "Breathable mesh back",
              "Sturdy 5-wheel base",
              "Reclining backrest",
            ],
            specs: {
              material: "Mesh, Foam, Metal",
              maxWeight: "300 lbs",
              dimensions: '26"W x 26"D x 38-42"H',
              warranty: "5 years",
            },
          },
          {
            id: "4",
            name: "Portable Bluetooth Speaker",
            description:
              "Compact and waterproof speaker with powerful sound for indoor and outdoor use",
            price: 129.99,
            imageUrl:
              "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D",
            category: "lifestyle",
            features: [
              "Waterproof (IPX7)",
              "Up to 20 hours playback",
              "Built-in microphone for calls",
              "Connect multiple speakers",
              "Compact design",
            ],
            specs: {
              weight: "560g",
              batteryLife: "20 hours",
              connectivity: "Bluetooth 5.1",
              warranty: "1 year",
            },
          },
          {
            id: "5",
            name: "Professional Camera Kit",
            description:
              "Advanced DSLR camera with multiple lenses for professional photography",
            price: 899.99,
            imageUrl:
              "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D",
            category: "professional",
            features: [
              "24.1 Megapixel CMOS sensor",
              "4K video recording",
              "Multiple lens compatibility",
              "Advanced autofocus system",
              "Weather-sealed body",
            ],
            specs: {
              sensor: "APS-C CMOS",
              ISO: "100-25600",
              videoResolution: "4K/30fps",
              warranty: "2 years",
            },
          },
          {
            id: "6",
            name: "Designer Sunglasses",
            description:
              "Elegant UV protection sunglasses with modern aesthetics and durable frame",
            price: 159.99,
            imageUrl:
              "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHN1bmdsYXNzZXN8ZW58MHx8MHx8fDA%3D",
            category: "lifestyle",
            features: [
              "UV400 protection",
              "Polarized lenses",
              "Durable acetate frame",
              "Anti-glare coating",
              "Lightweight design",
            ],
            specs: {
              material: "Acetate, Metal",
              lensType: "Polarized",
              UVProtection: "100%",
              warranty: "1 year",
            },
          },
          {
            id: "7",
            name: "Aromatherapy Diffuser",
            description:
              "Essential oil diffuser with LED lights and multiple mist settings",
            price: 49.99,
            imageUrl:
              "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZGlmZnVzZXJ8ZW58MHx8MHx8fDA%3D",
            category: "home",
            features: [
              "7-color LED lights",
              "Multiple mist settings",
              "Auto shut-off safety",
              "Ultra quiet operation",
              "300ml capacity",
            ],
            specs: {
              capacity: "300ml",
              runtime: "Up to 10 hours",
              material: "BPA-free plastic",
              warranty: "6 months",
            },
          },
          {
            id: "8",
            name: "Smart Home Hub",
            description:
              "Control all your smart home devices from one central hub with voice commands",
            price: 129.99,
            imageUrl:
              "https://images.unsplash.com/photo-1558089687-f282ffcbc0d3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnQlMjBob21lfGVufDB8fDB8fHww",
            category: "electronics",
            features: [
              "Voice control",
              "Works with multiple ecosystems",
              "Built-in speaker",
              "Privacy controls",
              "Smart home automation",
            ],
            specs: {
              connectivity: "WiFi, Bluetooth, Zigbee",
              power: "Wall outlet (included)",
              compatibility: "Works with 10,000+ devices",
              warranty: "1 year",
            },
          },
        ]

        // Find the product with matching ID
        const foundProduct = mockProducts.find((p) => p.id === productId)
        if (foundProduct) {
          setProduct(foundProduct)
        } else {
          const notFoundError = new Error("Product not found")
          console.error(notFoundError)
          setError(notFoundError)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId, navigate])

  // Handle quantity change
  const handleQuantityChange = (amount) => {
    const newQuantity = Math.max(1, quantity + amount)
    setQuantity(newQuantity)
  }

  // Add to cart with selected quantity
  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, quantity })
      navigate("/cart")
    }
  }
  // Back to products
  const backToProducts = () => {
    navigate("/products")
  }

  if (loading) {
    return (
      <PageContainer>
        <OrdersNavigation />

        <div className="py-8">
          <nav className="mb-6">
            <ol className="flex text-sm">
              <li className="flex items-center">
                <span className="text-gray-400">Products</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mx-2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </li>
              <li className="text-gray-500">Loading...</li>
            </ol>
          </nav>

          <ProductDetailSkeleton />
        </div>
      </PageContainer>
    )
  }
  if (error) {
    return (
      <PageContainer>
        <OrdersNavigation />
        <div className="py-8">
          <ErrorDisplay
            error={error}
            reset={() => {
              setError(null)
              setLoading(true)
              // Reload the product
              const fetchProduct = async () => {
                // This would be an API call in a real app
                // For now, just navigate back to products
                navigate("/products")
              }
              fetchProduct()
            }}
          />
          <div className="mt-6 text-center">
            <button
              onClick={backToProducts}
              className="px-6 py-2 bg-[var(--secondary-color)] text-white rounded-lg hover:bg-[#162d4d]"
            >
              Back to Products
            </button>
          </div>
        </div>
      </PageContainer>
    )
  }
  if (!product && !loading) {
    return (
      <PageContainer className="flex flex-col items-center justify-center">
        <p className="mt-4 text-lg font-medium text-red-500">
          Product not found
        </p>
        <button
          onClick={backToProducts}
          className="mt-4 px-6 py-2 bg-[var(--secondary-color)] text-white rounded-lg hover:bg-[#162d4d]"
        >
          Back to Products
        </button>
      </PageContainer>
    )
  }
  return (
    <PageContainer>
      {/* Orders Navigation */}
      <OrdersNavigation />

      <div className="py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex text-sm">
            <li className="flex items-center">
              <button
                onClick={backToProducts}
                className="text-[var(--secondary-color)] hover:underline"
              >
                Products
              </button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mx-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
            <li className="text-gray-500">{product.name}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="md:w-1/2 p-6 md:p-8">
              <h1 className="text-3xl font-bold text-[var(--secondary-color)] mb-2">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-[var(--primary-color)] mb-4">
                {formatCurrency(product.price)}
              </p>
              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Category */}
              <div className="mb-6">
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm capitalize">
                  {product.category}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity:
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-10 h-10 rounded-l bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="w-16 h-10 text-center border-t border-b border-gray-200 text-gray-800"
                    value={quantity}
                    readOnly
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-10 h-10 rounded-r bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="px-8 py-3 bg-[var(--secondary-color)] text-white rounded-lg hover:bg-[#162d4d] flex-1"
                >
                  Add to Cart
                </button>
                <button
                  onClick={backToProducts}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex-1"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
          {/* Product Features and Specs */}
          <div className="p-6 border-t">
            <div className="md:flex md:space-x-8">
              {/* Features */}
              <div className="md:w-1/2 mb-6 md:mb-0">
                <h2 className="text-xl font-semibold text-[var(--secondary-color)] mb-4">
                  Features
                </h2>
                <ul className="list-disc pl-5 space-y-2">
                  {product.features?.map((feature, index) => (
                    <li key={index} className="text-gray-600">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Specifications */}
              <div className="md:w-1/2">
                <h2 className="text-xl font-semibold text-[var(--secondary-color)] mb-4">
                  Specifications
                </h2>
                <div className="border rounded-lg overflow-hidden">
                  {product.specs &&
                    Object.entries(product.specs).map(([key, value], index) => (
                      <div
                        key={key}
                        className={`flex ${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <div className="w-1/3 px-4 py-3 text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </div>
                        <div className="w-2/3 px-4 py-3 text-sm text-gray-600">
                          {value}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>{" "}
        </div>
      </div>
    </PageContainer>
  )
}

export default ProductDetailPage;
