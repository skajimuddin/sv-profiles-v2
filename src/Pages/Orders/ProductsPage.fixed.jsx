import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContextProvider';
import { useOrders } from '../../Context/OrdersContextProvider';
import OrdersNavigation from './OrdersNavigation';
import LoadingSpinner from '../../Components/LoadingSpinner';
import ProductSkeleton from '../../Components/ProductSkeleton';
import ErrorDisplay from '../../Components/ErrorDisplay';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  const { cart, addToCart, getCartCount } = useOrders();
  
  // Fetch products on component mount
  useEffect(() => {
    // In the future, this would fetch from Firebase
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, this would be an API call with proper error handling
        // For example: const response = await fetch('/api/products');
        // const data = await response.json();
        
        // Simulate API call
        return new Promise((resolve) => {
          setTimeout(() => {
            // This would be a real Firebase or API call in production
            const mockProducts = [
              {
                id: '1',
                name: 'Premium Wireless Headphones',
                description: 'High-quality noise cancelling headphones with amazing sound quality and comfort',
                price: 99.99,
                imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D',
                category: 'electronics'
              },
              {
                id: '2',
                name: 'Smart Watch Series X',
                description: 'Premium design with health tracking, notifications and excellent battery life',
                price: 149.99,
                imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHByb2R1Y3R8ZW58MHx8MHx8fDA%3D',
                category: 'electronics'
              },
              {
                id: '3',
                name: 'Ergonomic Office Chair',
                description: 'Comfortable and affordable chair with great lumbar support for long working hours',
                price: 179.99,
                imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHByb2R1Y3R8ZW58MHx8MHx8fDA%3D',
                category: 'home'
              },
              {
                id: '4',
                name: 'Portable Bluetooth Speaker',
                description: 'Compact and waterproof speaker with powerful sound for indoor and outdoor use',
                price: 129.99,
                imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D',
                category: 'lifestyle'
              },
              {
                id: '5',
                name: 'Professional Camera Kit',
                description: 'Advanced DSLR camera with multiple lenses for professional photography',
                price: 899.99,
                imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D',
                category: 'professional'
              },
              {
                id: '6',
                name: 'Designer Sunglasses',
                description: 'Elegant UV protection sunglasses with modern aesthetics and durable frame',
                price: 159.99,
                imageUrl: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHN1bmdsYXNzZXN8ZW58MHx8MHx8fDA%3D',
                category: 'lifestyle'
              },
              {
                id: '7',
                name: 'Aromatherapy Diffuser',
                description: 'Essential oil diffuser with LED lights and multiple mist settings',
                price: 49.99,
                imageUrl: 'https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZGlmZnVzZXJ8ZW58MHx8MHx8fDA%3D',
                category: 'home'
              },
              {
                id: '8',
                name: 'Smart Home Hub',
                description: 'Control all your smart home devices from one central hub with voice commands',
                price: 129.99,
                imageUrl: 'https://images.unsplash.com/photo-1558089687-f282ffcbc0d3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnQlMjBob21lfGVufDB8fDB8fHww',
                category: 'electronics'
              },
            ];
            
            // Extract unique categories from products
            const uniqueCategories = [...new Set(mockProducts.map(product => product.category))];
            setCategories(uniqueCategories);
            
            resolve(mockProducts);
          }, 800); // Simulate loading delay
        });
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error);
        throw error;
      }
    };
    
    // Execute the async function
    fetchProducts()
      .then((mockProducts) => {
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
      })
      .catch((error) => {
        console.error("Error in fetchProducts:", error);
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  // Filter products by search term and category
  const filterProducts = () => {
    let filtered = products;
    
    // Apply category filter if not "all"
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Apply search term filter if there is one
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredProducts(filtered);
  };
  
  // Effect to filter products when search term or category changes
  useEffect(() => {
    if (products.length > 0) {
      filterProducts();
    }
  }, [searchTerm, selectedCategory, products]);
  
  // Filter products by category
  const filterByCategory = (category) => {
    setSelectedCategory(category);
  };
  
  const viewCart = () => {
    navigate('/cart');
  };
  
  // Handle retry after error
  const handleRetry = () => {
    window.location.reload();
  };
  
  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="bg-[var(--secondary-color)] text-white shadow-md">
          <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Our Products</h1>
            <div className="w-8 h-8"></div>
          </div>
        </div>
        
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center">
        <ErrorDisplay 
          error={error} 
          reset={handleRetry}
          fullScreen={true}
        />
        
        <div className="mt-8 text-center">
          <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>
          <p className="mt-2 text-gray-600">We are unable to load the products at this moment. Please try again later.</p>
          
          <button 
            onClick={handleRetry} 
            className="mt-4 px-4 py-2 bg-[var(--secondary-color)] text-white rounded-md hover:bg-[#162d4d] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-[var(--secondary-color)] text-white shadow-md">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Our Products</h1>
          <button 
            onClick={viewCart} 
            className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-[var(--primary-color)] text-[var(--secondary-color)] hover:bg-[#c99c4c] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-medium">{cart.reduce((total, item) => total + item.quantity, 0)}</span>
          </button>
        </div>
      </div>
      
      {/* Orders Navigation */}
      <OrdersNavigation />
      
      {/* Search and Category filters */}
      <div className="bg-gray-50 py-4 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="flex w-full max-w-md mx-auto">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)] focus:outline-none"
              />
              <button 
                onClick={() => setSearchTerm('')}
                className={`px-4 py-2 bg-[var(--secondary-color)] text-white rounded-r-md hover:bg-[#162d4d] transition-colors ${!searchTerm ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!searchTerm}
              >
                Clear
              </button>
            </div>
          </div>
          
          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Filter by:</span>
            
            <button 
              onClick={() => filterByCategory('all')}
              className={`px-3 py-1 text-sm rounded-full ${selectedCategory === 'all' 
                ? 'bg-[var(--secondary-color)] text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              All
            </button>
            
            {categories.map(category => (
              <button 
                key={category}
                onClick={() => filterByCategory(category)}
                className={`px-3 py-1 text-sm rounded-full capitalize ${selectedCategory === category 
                  ? 'bg-[var(--secondary-color)] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Products grid */}
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-gray-500">No products match your current filter selection.</p>
              <button 
                onClick={() => filterByCategory('all')} 
                className="mt-6 px-4 py-2 bg-[var(--secondary-color)] text-white rounded-md hover:bg-[#162d4d]"
              >
                Show all products
              </button>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-xl border border-gray-100">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                />
                <div className="p-6">
                  <h2 
                    className="text-xl font-bold mb-2 text-[var(--secondary-color)] cursor-pointer hover:underline"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    {product.name}
                  </h2>
                  <p className="text-gray-600 mb-4">{product.description.substring(0, 80)}...</p>
                  <div className="flex justify-between items-center">
                    <p className="text-[var(--primary-color)] font-bold text-xl">${product.price.toFixed(2)}</p>
                    <div className="space-x-2">
                      <button 
                        onClick={() => navigate(`/products/${product.id}`)} 
                        className="px-2 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        aria-label="View product details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => addToCart(product)} 
                        className="px-4 py-2 bg-[var(--secondary-color)] text-white rounded hover:bg-[#162d4d] transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
