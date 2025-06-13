import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContextProvider';
import { useFeedback } from '../../Context/FeedbackContext';
import AdminNavigation from './AdminNavigation';
import LoadingSpinner from '../../Components/LoadingSpinner';
import ErrorDisplay from '../../Components/ErrorDisplay';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../Firebase/firebase';
import { addProduct, updateProduct, getProductById } from '../../Firebase/productService';

const ProductForm = () => {
  const { productId } = useParams();
  const isEditMode = Boolean(productId);
  
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingCategories, setExistingCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    stockQuantity: '100',
    features: [],
    specs: {}
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [currentFeature, setCurrentFeature] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  
  const navigate = useNavigate();
  const { currentUser, userDetails } = useAuth();
  const feedback = useFeedback();
  
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
  
  // Fetch existing categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const productsRef = collection(db, "products");
        const querySnapshot = await getDocs(query(productsRef));
        
        const categories = new Set();
        querySnapshot.docs.forEach(doc => {
          const category = doc.data().category;
          if (category) {
            categories.add(category);
          }
        });
        
        setExistingCategories(Array.from(categories));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    
    fetchCategories();
  }, []);
    // Fetch product data if in edit mode
  useEffect(() => {
    const fetchProduct = async () => {
      if (!isEditMode) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const product = await getProductById(productId);
        
        if (product) {
          // Format the data for the form
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price ? product.price.toString() : '',
            category: product.category || '',
            imageUrl: product.imageUrl || '',
            stockQuantity: product.stockQuantity ? product.stockQuantity.toString() : '100',
            features: product.features || [],
            specs: product.specs || {}
          });
          
          if (product.imageUrl) {
            setImagePreview(product.imageUrl);
          }
        } else {
          setError(new Error("Product not found"));
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser && userDetails?.roles?.includes('admin')) {
      fetchProduct();
    }
  }, [isEditMode, productId, currentUser, userDetails]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'stockQuantity') {
      // Allow only numbers and decimal point for price
      const regex = name === 'price' ? /^[0-9]*\.?[0-9]*$/ : /^[0-9]*$/;
      if (value === '' || regex.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
      feedback.showError('Please select an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      feedback.showError('Image size should not exceed 5MB');
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Add a feature to the list
  const addFeature = () => {
    if (currentFeature.trim() === '') return;
    
    setFormData({
      ...formData,
      features: [...formData.features, currentFeature.trim()]
    });
    setCurrentFeature('');
  };
  
  // Remove a feature from the list
  const removeFeature = (index) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData({ ...formData, features: updatedFeatures });
  };
  
  // Add a specification
  const addSpec = () => {
    if (specKey.trim() === '' || specValue.trim() === '') return;
    
    setFormData({
      ...formData,
      specs: {
        ...formData.specs,
        [specKey.trim()]: specValue.trim()
      }
    });
    setSpecKey('');
    setSpecValue('');
  };
  
  // Remove a specification
  const removeSpec = (key) => {
    const updatedSpecs = { ...formData.specs };
    delete updatedSpecs[key];
    setFormData({ ...formData, specs: updatedSpecs });
  };
    // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.description.trim() || !formData.price || !formData.category.trim()) {
      feedback.showError('Please fill all required fields');
      return;
    }
    
    try {
      setSubmitLoading(true);
      
      // Create product object
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim(),
        stockQuantity: parseInt(formData.stockQuantity, 10) || 100,
        features: formData.features,
        specs: formData.specs
      };
      
      if (isEditMode) {
        // If we already have an image URL and no new file, keep the existing URL
        if (formData.imageUrl && !imageFile) {
          productData.imageUrl = formData.imageUrl;
        }
        
        // Update existing product
        await updateProduct(productId, productData, imageFile);
        feedback.showSuccess('Product updated successfully');
      } else {
        // Create new product
        await addProduct(productData, imageFile);
        feedback.showSuccess('Product created successfully');
      }
      
      // Redirect to products list
      navigate('/admin/products');
      
    } catch (error) {
      console.error("Error saving product:", error);
      feedback.showError(`Failed to save product: ${error.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  // Cancel and go back
  const handleCancel = () => {
    navigate('/admin/products');
  };
  
  if (loading) {
    return <LoadingSpinner fullScreen message={isEditMode ? "Loading product..." : "Loading..."} />;
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorDisplay 
            error={error} 
            fullScreen 
            reset={() => navigate('/admin/products')} 
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[var(--secondary-color)] text-white shadow-md">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
      </div>
      
      <AdminNavigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Product Name */}
              <div className="sm:col-span-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Product Name *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--secondary-color)] focus:ring-[var(--secondary-color)] sm:text-sm"
                  />
                </div>
              </div>
              
              {/* Description */}
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--secondary-color)] focus:ring-[var(--secondary-color)] sm:text-sm"
                  />
                </div>
              </div>
              
              {/* Price */}
              <div className="sm:col-span-3">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price ($) *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="text"
                    name="price"
                    id="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-[var(--secondary-color)] focus:ring-[var(--secondary-color)] sm:text-sm"
                    placeholder="0.00"
                    aria-describedby="price-currency"
                  />
                </div>
              </div>
              
              {/* Stock Quantity */}
              <div className="sm:col-span-3">
                <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">
                  Stock Quantity
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="stockQuantity"
                    id="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--secondary-color)] focus:ring-[var(--secondary-color)] sm:text-sm"
                    placeholder="100"
                  />
                </div>
              </div>
              
              {/* Category */}
              <div className="sm:col-span-3">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <div className="mt-1">
                  {existingCategories.length > 0 ? (
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--secondary-color)] focus:ring-[var(--secondary-color)] sm:text-sm"
                    >
                      <option value="">Select a category</option>
                      {existingCategories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                      <option value="other">Other (Custom)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--secondary-color)] focus:ring-[var(--secondary-color)] sm:text-sm"
                      placeholder="e.g., electronics"
                    />
                  )}
                </div>
                {formData.category === 'other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="category"
                      value={formData.category === 'other' ? '' : formData.category}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--secondary-color)] focus:ring-[var(--secondary-color)] sm:text-sm"
                      placeholder="Enter custom category"
                    />
                  </div>
                )}
              </div>
              
              {/* Product Image */}
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Product Image
                </label>
                <div className="mt-1 flex items-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="h-32 w-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageFile(null);
                          if (!isEditMode) {
                            setFormData({ ...formData, imageUrl: '' });
                          }
                        }}
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="h-32 w-32 border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="ml-4">
                    <div className="relative bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm flex items-center cursor-pointer hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[var(--secondary-color)]">
                      <label
                        htmlFor="image-upload"
                        className="relative text-sm font-medium text-[var(--secondary-color)] pointer-events-none"
                      >
                        <span>Upload a file</span>
                        <span className="sr-only"> product image</span>
                      </label>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-gray-300 rounded-md"
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Features */}
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Product Features
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    value={currentFeature}
                    onChange={(e) => setCurrentFeature(e.target.value)}
                    className="block flex-1 rounded-none rounded-l-md border-gray-300 shadow-sm focus:border-[var(--secondary-color)] focus:ring-[var(--secondary-color)] sm:text-sm"
                    placeholder="e.g. Waterproof"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)]"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2">
                  {formData.features.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No features added yet. Add some features to highlight product capabilities.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature, index) => (
                        <div 
                          key={index} 
                          className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center"
                        >
                          <span>{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--secondary-color)]"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Specifications */}
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Product Specifications
                </label>
                <div className="mt-1 grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--secondary-color)] focus:ring-[var(--secondary-color)] sm:text-sm"
                    placeholder="Spec name (e.g. Weight)"
                  />
                  <div className="flex">
                    <input
                      type="text"
                      value={specValue}
                      onChange={(e) => setSpecValue(e.target.value)}
                      className="block flex-1 rounded-none rounded-l-md border-gray-300 shadow-sm focus:border-[var(--secondary-color)] focus:ring-[var(--secondary-color)] sm:text-sm"
                      placeholder="Value (e.g. 250g)"
                    />
                    <button
                      type="button"
                      onClick={addSpec}
                      className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[var(--secondary-color)] focus:border-[var(--secondary-color)]"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  {Object.keys(formData.specs).length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No specifications added yet. Add technical details about your product.
                    </p>
                  ) : (
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      {Object.entries(formData.specs).map(([key, value]) => (
                        <div key={key} className="border border-gray-200 rounded-md p-3 bg-gray-50 relative">
                          <button
                            type="button"
                            onClick={() => removeSpec(key)}
                            className="absolute top-1 right-1 rounded-full p-1 text-gray-400 hover:text-gray-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <dt className="text-sm font-medium text-gray-500">{key}</dt>
                          <dd className="mt-1 text-sm text-gray-900">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--secondary-color)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--secondary-color)] hover:bg-[#162d4d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--secondary-color)]"
              >
                {submitLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </span>
                ) : (
                  <span>{isEditMode ? 'Update Product' : 'Create Product'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
